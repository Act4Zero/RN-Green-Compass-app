-- Living Ecosystem v1: one private forest-and-meadow world per user.
-- Growth is separate from Green Points, deduplicated, capped and server-calculated.

create table if not exists public.ecosystem_species (
  slug text primary key,
  scientific_name text not null,
  name_en text not null,
  name_bg text not null,
  unlock_at integer not null check (unlock_at >= 0),
  sort_order integer not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_ecosystems (
  user_id uuid primary key references auth.users(id) on delete cascade,
  biome text not null default 'forest_meadow' check (biome in ('forest_meadow')),
  active_species_slug text not null default 'english-oak' references public.ecosystem_species(slug),
  growth_units integer not null default 0 check (growth_units >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ecosystem_growth_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  point_event_id uuid not null,
  source text not null check (source in ('habit_log','habit_streak','learning_milestone','daily_challenge','discussion_participation')),
  reference_id text not null,
  units integer not null check (units > 0 and units <= 20),
  created_at timestamptz not null default now(),
  unique (point_event_id),
  unique (user_id, source, reference_id)
);

create index if not exists ecosystem_growth_events_user_date_idx on public.ecosystem_growth_events(user_id, created_at desc);

insert into public.ecosystem_species(slug, scientific_name, name_en, name_bg, unlock_at, sort_order) values
  ('english-oak', 'Quercus robur', 'English oak', 'Летен дъб', 0, 1),
  ('small-leaved-lime', 'Tilia cordata', 'Small-leaved lime', 'Дребнолистна липа', 96, 2),
  ('cornelian-cherry', 'Cornus mas', 'Cornelian cherry', 'Дрян', 168, 3),
  ('dog-rose', 'Rosa canina', 'Dog rose', 'Шипка', 240, 4),
  ('yarrow', 'Achillea millefolium', 'Yarrow', 'Бял равнец', 312, 5),
  ('red-clover', 'Trifolium pratense', 'Red clover', 'Червена детелина', 384, 6),
  ('corn-poppy', 'Papaver rhoeas', 'Corn poppy', 'Полски мак', 456, 7),
  ('oxeye-daisy', 'Leucanthemum vulgare', 'Oxeye daisy', 'Обикновена маргаритка', 528, 8)
on conflict (slug) do update set scientific_name = excluded.scientific_name, name_en = excluded.name_en, name_bg = excluded.name_bg, unlock_at = excluded.unlock_at, sort_order = excluded.sort_order;

alter table public.ecosystem_species enable row level security;
alter table public.user_ecosystems enable row level security;
alter table public.ecosystem_growth_events enable row level security;

drop policy if exists "Active ecosystem species are public" on public.ecosystem_species;
create policy "Active ecosystem species are public" on public.ecosystem_species for select using (active);
drop policy if exists "Users read own ecosystem" on public.user_ecosystems;
create policy "Users read own ecosystem" on public.user_ecosystems for select using (user_id = auth.uid());
drop policy if exists "Users read own ecosystem growth" on public.ecosystem_growth_events;
create policy "Users read own ecosystem growth" on public.ecosystem_growth_events for select using (user_id = auth.uid());

-- There are deliberately no client INSERT/UPDATE policies. Mutations go through
-- the security-definer functions below, which calculate units server-side.
create or replace function public.record_ecosystem_growth(p_point_event_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  event_row record;
  event_units integer := 0;
  event_daily_cap integer := 0;
  events_today integer := 0;
  new_total integer := 0;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;

  select id, user_id, source::text as source, reference_id::text as reference_id, created_at
    into event_row
    from public.user_points
   where id = p_point_event_id and user_id = auth.uid();

  if event_row.id is null or event_row.reference_id is null then
    select coalesce(growth_units, 0) into new_total from public.user_ecosystems where user_id = auth.uid();
    return coalesce(new_total, 0);
  end if;

  case event_row.source
    when 'habit_log' then event_units := 12; event_daily_cap := 4;
    when 'habit_streak' then event_units := 8; event_daily_cap := 1;
    when 'learning_milestone' then event_units := 10; event_daily_cap := 3;
    when 'daily_challenge' then event_units := 16; event_daily_cap := 1;
    when 'discussion_participation' then event_units := 4; event_daily_cap := 2;
    else event_units := 0;
  end case;

  if event_units = 0 then
    select coalesce(growth_units, 0) into new_total from public.user_ecosystems where user_id = auth.uid();
    return coalesce(new_total, 0);
  end if;

  -- A habit event must point to a completed log owned by the same user.
  if event_row.source = 'habit_log' and not exists (
    select 1 from public.habit_logs h
     where h.id::text = event_row.reference_id and h.user_id = auth.uid() and h.completed = true
  ) then
    raise exception 'Habit reference is not eligible for ecosystem growth';
  end if;

  select count(*) into events_today
    from public.ecosystem_growth_events
   where user_id = auth.uid()
     and source = event_row.source
     and created_at >= date_trunc('day', event_row.created_at)
     and created_at < date_trunc('day', event_row.created_at) + interval '1 day';

  insert into public.user_ecosystems(user_id) values(auth.uid()) on conflict (user_id) do nothing;

  if events_today < event_daily_cap then
    insert into public.ecosystem_growth_events(user_id, point_event_id, source, reference_id, units, created_at)
    values(auth.uid(), event_row.id, event_row.source, event_row.reference_id, event_units, event_row.created_at)
    on conflict do nothing;
  end if;

  update public.user_ecosystems e
     set growth_units = coalesce((select sum(g.units) from public.ecosystem_growth_events g where g.user_id = e.user_id), 0),
         updated_at = now()
   where e.user_id = auth.uid()
  returning growth_units into new_total;

  return coalesce(new_total, 0);
end;
$$;

create or replace function public.get_my_ecosystem()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare result jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.user_ecosystems(user_id) values(auth.uid()) on conflict (user_id) do nothing;
  select jsonb_build_object(
    'biome', e.biome,
    'active_species_slug', e.active_species_slug,
    'growth_units', e.growth_units,
    'updated_at', e.updated_at
  ) into result from public.user_ecosystems e where e.user_id = auth.uid();
  return result;
end;
$$;

create or replace function public.select_ecosystem_species(p_species_slug text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare required_growth integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select unlock_at into required_growth from public.ecosystem_species where slug = p_species_slug and active;
  if required_growth is null then raise exception 'Unknown species'; end if;
  insert into public.user_ecosystems(user_id) values(auth.uid()) on conflict (user_id) do nothing;
  if (select growth_units from public.user_ecosystems where user_id = auth.uid()) < required_growth then return false; end if;
  update public.user_ecosystems set active_species_slug = p_species_slug, updated_at = now() where user_id = auth.uid();
  return true;
end;
$$;

revoke all on function public.record_ecosystem_growth(uuid) from public;
revoke all on function public.get_my_ecosystem() from public;
revoke all on function public.select_ecosystem_species(text) from public;
grant execute on function public.record_ecosystem_growth(uuid) to authenticated;
grant execute on function public.get_my_ecosystem() to authenticated;
grant execute on function public.select_ecosystem_species(text) to authenticated;

-- Preserve meaningful progress already earned before this feature ships. Raw
-- point values are ignored; the same fixed rules, daily caps and references
-- used by the live RPC are applied to the history.
with ranked_events as (
  select
    p.id as point_event_id,
    p.user_id,
    p.source::text as source,
    p.reference_id::text as reference_id,
    p.created_at,
    case p.source::text
      when 'habit_log' then 12
      when 'habit_streak' then 8
      when 'learning_milestone' then 10
      when 'daily_challenge' then 16
      when 'discussion_participation' then 4
      else 0
    end as units,
    case p.source::text
      when 'habit_log' then 4
      when 'habit_streak' then 1
      when 'learning_milestone' then 3
      when 'daily_challenge' then 1
      when 'discussion_participation' then 2
      else 0
    end as daily_cap,
    row_number() over (partition by p.user_id, p.source, date_trunc('day', p.created_at) order by p.created_at, p.id) as daily_rank
  from public.user_points p
  where p.reference_id is not null
), eligible_events as (
  select r.* from ranked_events r
  where r.units > 0 and r.daily_rank <= r.daily_cap
    and (r.source <> 'habit_log' or exists (
      select 1 from public.habit_logs h where h.id::text = r.reference_id and h.user_id = r.user_id and h.completed = true
    ))
)
insert into public.ecosystem_growth_events(user_id, point_event_id, source, reference_id, units, created_at)
select user_id, point_event_id, source, reference_id, units, created_at from eligible_events
on conflict do nothing;

insert into public.user_ecosystems(user_id)
select distinct user_id from public.ecosystem_growth_events
on conflict (user_id) do nothing;

update public.user_ecosystems e
set growth_units = totals.growth_units, updated_at = now()
from (
  select user_id, sum(units)::integer as growth_units
  from public.ecosystem_growth_events
  group by user_id
) totals
where e.user_id = totals.user_id;

insert into public.feature_flags(key, enabled, updated_at)
values ('living_ecosystem_v1', true, now())
on conflict (key) do update set updated_at = excluded.updated_at;
