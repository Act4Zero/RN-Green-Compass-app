-- Complete daily missions atomically: the assignment, points and ecosystem
-- growth must succeed together so the app never reports an unsaved reward.
create or replace function public.complete_daily_eco_challenge(
  p_challenge_id text,
  p_challenge_date date,
  p_event_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  assignment public.user_daily_challenges;
  challenge public.daily_eco_challenges;
  point_event_id uuid;
  growth_total integer := 0;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;

  select * into assignment
    from public.user_daily_challenges
   where user_id = auth.uid() and challenge_date = p_challenge_date
   for update;

  if assignment.id is null or assignment.challenge_id <> p_challenge_id then
    raise exception 'Challenge assignment not found';
  end if;

  select * into challenge from public.daily_eco_challenges where id = p_challenge_id;
  if challenge.id is null then raise exception 'Challenge not found'; end if;

  if assignment.completed_at is null then
    update public.user_daily_challenges
       set completed_at = now(), completion_event_id = p_event_id
     where id = assignment.id
    returning * into assignment;

    insert into public.user_points(user_id, source, points, reference_id, created_at)
    select auth.uid(), 'daily_challenge', challenge.points, assignment.id::text, now()
     where not exists (
       select 1 from public.user_points
        where user_id = auth.uid()
          and source = 'daily_challenge'
          and reference_id = assignment.id::text
     )
    returning id into point_event_id;
  else
    select id into point_event_id
      from public.user_points
     where user_id = auth.uid()
       and source = 'daily_challenge'
       and reference_id = assignment.id::text
     order by created_at
     limit 1;
  end if;

  if point_event_id is not null and to_regprocedure('public.record_ecosystem_growth(uuid)') is not null then
    growth_total := public.record_ecosystem_growth(point_event_id);
  end if;

  return jsonb_build_object(
    'id', assignment.id,
    'completed_at', assignment.completed_at,
    'points', challenge.points,
    'growth_units', growth_total
  );
end;
$$;

grant execute on function public.complete_daily_eco_challenge(text,date,uuid) to authenticated;

-- Repair daily missions completed after the ecosystem feature was introduced
-- but before mission completion called the growth recorder.
with eligible as (
  select distinct on (p.user_id, p.reference_id)
    p.user_id, p.id as point_event_id, p.reference_id, p.created_at
  from public.user_points p
  join public.user_daily_challenges c
    on c.id::text = p.reference_id
   and c.user_id = p.user_id
   and c.completed_at is not null
  where p.source = 'daily_challenge'
  order by p.user_id, p.reference_id, p.created_at, p.id
), ranked as (
  select *, row_number() over (
    partition by user_id, date_trunc('day', created_at)
    order by created_at, point_event_id
  ) as daily_rank
  from eligible
)
insert into public.ecosystem_growth_events(user_id, point_event_id, source, reference_id, units, created_at)
select user_id, point_event_id, 'daily_challenge', reference_id, 16, created_at
from ranked
where daily_rank = 1
on conflict do nothing;

insert into public.user_ecosystems(user_id)
select distinct user_id from public.ecosystem_growth_events
on conflict (user_id) do nothing;

update public.user_ecosystems e
set growth_units = totals.growth_units,
    updated_at = now()
from (
  select user_id, sum(units)::integer as growth_units
  from public.ecosystem_growth_events
  group by user_id
) totals
where e.user_id = totals.user_id;
