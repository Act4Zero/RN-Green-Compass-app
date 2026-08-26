-- Community engagement MVP: private invite groups, opt-in aggregate comparison,
-- shared goals, curated projects/initiatives, and moderated community submissions.

create table if not exists public.community_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 60),
  description text not null default '' check (char_length(description) <= 280),
  kind text not null default 'team' check (kind in ('friends','team','local')),
  owner_id uuid not null references auth.users(id) on delete cascade,
  invite_code text not null unique,
  invite_expires_at timestamptz not null default (now() + interval '7 days'),
  max_members integer not null default 100 check (max_members between 2 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_group_members (
  group_id uuid not null references public.community_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  share_summary boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.community_leaderboard_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  global_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_group_goals (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.community_groups(id) on delete cascade,
  title text not null check (char_length(title) between 5 and 100),
  description text not null default '' check (char_length(description) <= 500),
  metric text not null check (metric in ('points','actions','co2e_kg')),
  target_value numeric(12,2) not null check (target_value > 0),
  starts_on date not null,
  ends_on date not null check (ends_on >= starts_on),
  status text not null default 'active' check (status in ('active','completed','archived')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.community_goal_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.community_group_goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value numeric(12,2) not null check (value > 0),
  note text not null default '' check (char_length(note) <= 280),
  event_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create table if not exists public.community_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 5 and 120),
  summary text not null check (char_length(summary) between 10 and 280),
  description text not null check (char_length(description) between 20 and 5000),
  scope text not null check (scope in ('local','global')),
  location text,
  external_url text check (external_url is null or external_url ~ '^https://'),
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  target_participants integer check (target_participants is null or target_participants > 0),
  seasonal_tag text,
  event_name text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  featured boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_project_participants (
  project_id uuid not null references public.community_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.community_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('story','tip','article','video','project_idea')),
  title text not null check (char_length(title) between 5 and 120),
  body text not null check (char_length(body) between 20 and 5000),
  url text check (url is null or url ~ '^https://'),
  status text not null default 'pending' check (status in ('pending','in_review','approved','rejected')),
  reviewer_id uuid references auth.users(id) on delete set null,
  reviewer_notes text check (reviewer_notes is null or char_length(reviewer_notes) <= 1000),
  reviewed_at timestamptz,
  featured_on date,
  published_knowledge_item_id uuid references public.knowledge_items(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (type not in ('article','video') or url is not null)
);

alter table public.discussions add column if not exists category text not null default 'sustainable_living';
alter table public.discussions add column if not exists status text not null default 'published';
alter table public.discussions add column if not exists is_pinned boolean not null default false;
alter table public.discussions add column if not exists moderated_by uuid references auth.users(id) on delete set null;
alter table public.discussions add column if not exists moderated_at timestamptz;

do $$ begin
  if not exists(select 1 from pg_constraint where conname = 'discussions_category_check') then
    alter table public.discussions add constraint discussions_category_check check (category in ('sustainable_living','diy_projects','carbon_reduction','community_projects','questions'));
  end if;
  if not exists(select 1 from pg_constraint where conname = 'discussions_status_check') then
    alter table public.discussions add constraint discussions_status_check check (status in ('published','hidden','removed'));
  end if;
end $$;

create table if not exists public.community_content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  reason text not null check (reason in ('spam','harassment','misinformation','unsafe','other')),
  details text not null default '' check (char_length(details) <= 500),
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(reporter_id, discussion_id)
);

create index if not exists community_group_members_user_idx on public.community_group_members(user_id);
create index if not exists community_group_goals_group_idx on public.community_group_goals(group_id, status, ends_on);
create index if not exists community_goal_contributions_goal_idx on public.community_goal_contributions(goal_id, created_at);
create index if not exists community_projects_status_dates_idx on public.community_projects(status, featured desc, starts_at);
create index if not exists community_submissions_review_idx on public.community_submissions(status, created_at);
create index if not exists community_submissions_featured_idx on public.community_submissions(featured_on desc) where status = 'approved';
create index if not exists community_discussions_category_idx on public.discussions(status, category, is_pinned desc, created_at desc);
create index if not exists community_content_reports_review_idx on public.community_content_reports(status, created_at);

create or replace function public.is_community_group_member(p_group_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from public.community_group_members where group_id = p_group_id and user_id = p_user_id)
$$;

create or replace function public.is_community_group_owner(p_group_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from public.community_group_members where group_id = p_group_id and user_id = p_user_id and role = 'owner')
$$;

alter table public.community_groups enable row level security;
alter table public.community_group_members enable row level security;
alter table public.community_leaderboard_preferences enable row level security;
alter table public.community_group_goals enable row level security;
alter table public.community_goal_contributions enable row level security;
alter table public.community_projects enable row level security;
alter table public.community_project_participants enable row level security;
alter table public.community_submissions enable row level security;
alter table public.community_content_reports enable row level security;

drop policy if exists "Members read community groups" on public.community_groups;
create policy "Members read community groups" on public.community_groups for select using (public.is_community_group_member(id));
drop policy if exists "Owners update community groups" on public.community_groups;
create policy "Owners update community groups" on public.community_groups for update using (public.is_community_group_owner(id)) with check (owner_id = auth.uid());

drop policy if exists "Members read group membership" on public.community_group_members;
create policy "Members read group membership" on public.community_group_members for select using (public.is_community_group_member(group_id));
drop policy if exists "Members update own group privacy" on public.community_group_members;
create policy "Members update own group privacy" on public.community_group_members for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Members leave community groups" on public.community_group_members;
create policy "Members leave community groups" on public.community_group_members for delete using (user_id = auth.uid() and role <> 'owner');

drop policy if exists "Users own leaderboard preferences" on public.community_leaderboard_preferences;
create policy "Users own leaderboard preferences" on public.community_leaderboard_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Members read group goals" on public.community_group_goals;
create policy "Members read group goals" on public.community_group_goals for select using (public.is_community_group_member(group_id));
drop policy if exists "Members create group goals" on public.community_group_goals;
create policy "Members create group goals" on public.community_group_goals for insert with check (created_by = auth.uid() and public.is_community_group_member(group_id));
drop policy if exists "Goal creators update goals" on public.community_group_goals;
create policy "Goal creators update goals" on public.community_group_goals for update using (created_by = auth.uid() or public.is_community_group_owner(group_id));

drop policy if exists "Members read goal contributions" on public.community_goal_contributions;
create policy "Members read goal contributions" on public.community_goal_contributions for select using (exists(select 1 from public.community_group_goals g where g.id = goal_id and public.is_community_group_member(g.group_id)));
drop policy if exists "Members add own goal contributions" on public.community_goal_contributions;
create policy "Members add own goal contributions" on public.community_goal_contributions for insert with check (user_id = auth.uid() and exists(select 1 from public.community_group_goals g where g.id = goal_id and public.is_community_group_member(g.group_id)));

drop policy if exists "Published community projects are visible" on public.community_projects;
create policy "Published community projects are visible" on public.community_projects for select using (status = 'published' or public.is_knowledge_editor());
drop policy if exists "Editors manage community projects" on public.community_projects;
create policy "Editors manage community projects" on public.community_projects for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
drop policy if exists "Project participation is visible" on public.community_project_participants;
create policy "Project participation is visible" on public.community_project_participants for select using (exists(select 1 from public.community_projects p where p.id = project_id and p.status = 'published'));
drop policy if exists "Users join projects" on public.community_project_participants;
create policy "Users join projects" on public.community_project_participants for insert with check (user_id = auth.uid());
drop policy if exists "Users leave projects" on public.community_project_participants;
create policy "Users leave projects" on public.community_project_participants for delete using (user_id = auth.uid());

drop policy if exists "Users read own or featured submissions" on public.community_submissions;
create policy "Users read own or featured submissions" on public.community_submissions for select using (user_id = auth.uid() or (status = 'approved' and featured_on is not null) or public.is_knowledge_editor('reviewer'));
drop policy if exists "Users create pending submissions" on public.community_submissions;
create policy "Users create pending submissions" on public.community_submissions for insert with check (user_id = auth.uid() and status = 'pending');
drop policy if exists "Editors review submissions" on public.community_submissions;
create policy "Editors review submissions" on public.community_submissions for update using (public.is_knowledge_editor('reviewer')) with check (public.is_knowledge_editor('reviewer'));

drop policy if exists "Users create content reports" on public.community_content_reports;
create policy "Users create content reports" on public.community_content_reports for insert with check (reporter_id = auth.uid());
drop policy if exists "Users read own content reports" on public.community_content_reports;
create policy "Users read own content reports" on public.community_content_reports for select using (reporter_id = auth.uid() or public.is_knowledge_editor('reviewer'));
drop policy if exists "Editors manage content reports" on public.community_content_reports;
create policy "Editors manage content reports" on public.community_content_reports for update using (public.is_knowledge_editor('reviewer')) with check (public.is_knowledge_editor('reviewer'));

create or replace function public.create_community_group(p_name text, p_description text default '', p_kind text default 'team')
returns table(id uuid, name text, description text, kind text, role text, member_count bigint, share_summary boolean, invite_code text, invite_expires_at timestamptz, created_at timestamptz)
language plpgsql security definer set search_path = public, pg_temp as $$
declare new_group public.community_groups;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_kind not in ('friends','team','local') then raise exception 'Invalid group kind'; end if;
  insert into public.community_groups(name, description, kind, owner_id, invite_code)
  values(trim(p_name), trim(coalesce(p_description,'')), p_kind, auth.uid(), upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))) returning * into new_group;
  insert into public.community_group_members(group_id, user_id, role) values(new_group.id, auth.uid(), 'owner');
  return query select new_group.id, new_group.name, new_group.description, new_group.kind, 'owner'::text, 1::bigint, false, new_group.invite_code, new_group.invite_expires_at, new_group.created_at;
end $$;

create or replace function public.get_my_community_groups()
returns table(id uuid, name text, description text, kind text, role text, member_count bigint, share_summary boolean, invite_code text, invite_expires_at timestamptz, created_at timestamptz)
language sql stable security definer set search_path = public, pg_temp as $$
  select g.id, g.name, g.description, g.kind, m.role,
    (select count(*) from public.community_group_members c where c.group_id = g.id),
    m.share_summary,
    case when m.role = 'owner' then g.invite_code else null end,
    case when m.role = 'owner' then g.invite_expires_at else null end,
    g.created_at
  from public.community_group_members m join public.community_groups g on g.id = m.group_id
  where m.user_id = auth.uid() order by g.created_at desc
$$;

create or replace function public.join_community_group_by_code(p_invite_code text)
returns table(group_id uuid) language plpgsql security definer set search_path = public, pg_temp as $$
declare target public.community_groups; current_count integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into target from public.community_groups where invite_code = upper(regexp_replace(trim(p_invite_code),'[^A-Za-z0-9]','','g')) and invite_expires_at > now() for update;
  if target.id is null then raise exception 'Invite is invalid or expired'; end if;
  select count(*) into current_count from public.community_group_members where community_group_members.group_id = target.id;
  if current_count >= target.max_members then raise exception 'Group is full'; end if;
  insert into public.community_group_members(group_id, user_id) values(target.id, auth.uid()) on conflict do nothing;
  return query select target.id;
end $$;

create or replace function public.rotate_community_group_invite(p_group_id uuid)
returns table(invite_code text, invite_expires_at timestamptz) language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_community_group_owner(p_group_id) then raise exception 'Owner access required'; end if;
  return query update public.community_groups set invite_code = upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)), invite_expires_at = now() + interval '7 days', updated_at = now()
    where id = p_group_id returning community_groups.invite_code, community_groups.invite_expires_at;
end $$;

create or replace function public.set_community_group_summary_sharing(p_group_id uuid, p_enabled boolean)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  update public.community_group_members set share_summary = p_enabled where group_id = p_group_id and user_id = auth.uid();
  if not found then raise exception 'Group membership required'; end if;
end $$;

create or replace function public.get_community_leaderboard_preferences()
returns table(global_enabled boolean) language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce((select p.global_enabled from public.community_leaderboard_preferences p where p.user_id = auth.uid()), false)
$$;

create or replace function public.set_community_global_leaderboard_sharing(p_enabled boolean)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.community_leaderboard_preferences(user_id, global_enabled)
  values(auth.uid(), p_enabled)
  on conflict(user_id) do update set global_enabled = excluded.global_enabled, updated_at = now();
end $$;

create or replace function public.create_community_group_goal(p_group_id uuid, p_title text, p_description text, p_metric text, p_target_value numeric, p_starts_on date, p_ends_on date)
returns table(id uuid) language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_community_group_member(p_group_id) then raise exception 'Group membership required'; end if;
  if p_metric not in ('points','actions','co2e_kg') then raise exception 'Invalid goal metric'; end if;
  return query insert into public.community_group_goals(group_id,title,description,metric,target_value,starts_on,ends_on,created_by)
    values(p_group_id,trim(p_title),trim(coalesce(p_description,'')),p_metric,p_target_value,p_starts_on,p_ends_on,auth.uid()) returning community_group_goals.id;
end $$;

create or replace function public.add_community_goal_contribution(p_goal_id uuid, p_value numeric, p_note text, p_event_id uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare target public.community_group_goals; total numeric;
begin
  select * into target from public.community_group_goals where id = p_goal_id and status = 'active' and ends_on >= current_date for update;
  if target.id is null or not public.is_community_group_member(target.group_id) then raise exception 'Active group goal not found'; end if;
  insert into public.community_goal_contributions(goal_id,user_id,value,note,event_id) values(p_goal_id,auth.uid(),p_value,trim(coalesce(p_note,'')),p_event_id) on conflict(user_id,event_id) do nothing;
  select coalesce(sum(value),0) into total from public.community_goal_contributions where goal_id = p_goal_id;
  if total >= target.target_value then update public.community_group_goals set status = 'completed' where id = p_goal_id; end if;
end $$;

create or replace function public.set_community_project_participation(p_project_id uuid, p_participating boolean)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists(select 1 from public.community_projects where id = p_project_id and status = 'published' and ends_at > now()) then raise exception 'Project is unavailable'; end if;
  if p_participating then insert into public.community_project_participants(project_id,user_id) values(p_project_id,auth.uid()) on conflict do nothing;
  else delete from public.community_project_participants where project_id = p_project_id and user_id = auth.uid(); end if;
end $$;

create or replace function public.review_community_submission(p_submission_id uuid, p_status text, p_reviewer_notes text default '', p_featured_on date default null)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare submission_owner uuid;
begin
  if not public.is_knowledge_editor('reviewer') then raise exception 'Reviewer access required'; end if;
  if p_status not in ('approved','rejected') then raise exception 'Invalid review status'; end if;
  update public.community_submissions set status = p_status, reviewer_id = auth.uid(), reviewer_notes = trim(coalesce(p_reviewer_notes,'')), reviewed_at = now(), featured_on = case when p_status = 'approved' then coalesce(p_featured_on,current_date) else null end, updated_at = now() where id = p_submission_id;
  if not found then raise exception 'Submission not found'; end if;
  if p_status = 'approved' and to_regclass('public.user_points') is not null then
    select user_id into submission_owner from public.community_submissions where id=p_submission_id;
    insert into public.user_points(user_id,source,points,reference_id,created_at)
    select submission_owner,'discussion_participation',10,p_submission_id::text,now()
    where not exists(select 1 from public.user_points where user_id=submission_owner and source='discussion_participation' and reference_id=p_submission_id::text);
  end if;
end $$;

-- Stable cross-feature boundary: Habit-Based Carbon Offsetting V2 can replace this
-- function to include new activity tables without changing Community contracts.
create or replace function public.get_community_impact_summary(p_user_id uuid)
returns table(total_points numeric, login_streak bigint, completed_actions bigint, co2e_kg_avoided numeric)
language sql stable security definer set search_path = public, pg_temp as $$
  select
    (select coalesce(sum(up.points),0)::numeric from public.user_points up where up.user_id = p_user_id),
    coalesce((select p.login_streak::bigint from public.profiles p where p.id = p_user_id),0),
    ((select count(*) from public.habit_logs hl where hl.user_id = p_user_id and hl.completed) +
      (select count(*) from public.user_daily_challenges dc where dc.user_id = p_user_id and dc.completed_at is not null))::bigint,
    round(((select coalesce(sum(hl.co2_saving),0) from public.habit_logs hl where hl.user_id = p_user_id and hl.completed) +
      (select coalesce(sum(tf.avoided_kg_co2e),0) from public.travel_footprint_entries tf where tf.user_id = p_user_id))::numeric,2)
$$;

revoke all on function public.get_community_impact_summary(uuid) from public, anon, authenticated;

create or replace function public.get_community_group_dashboard(p_group_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare result jsonb;
begin
  if not public.is_community_group_member(p_group_id) then raise exception 'Group membership required'; end if;
  select jsonb_build_object(
    'group', jsonb_build_object('id',g.id,'name',g.name,'description',g.description,'kind',g.kind,'role',me.role,'member_count',(select count(*) from public.community_group_members where group_id=g.id),'share_summary',me.share_summary,'invite_code',case when me.role='owner' then g.invite_code else null end,'invite_expires_at',case when me.role='owner' then g.invite_expires_at else null end,'created_at',g.created_at),
    'members', coalesce((select jsonb_agg(jsonb_build_object(
      'user_id',m.user_id,'display_name',coalesce(p.display_name,'Community member'),'avatar_url',p.avatar_url,'is_current_user',m.user_id=auth.uid(),'sharing_enabled',m.share_summary,
      'total_points',case when m.share_summary or m.user_id=auth.uid() then impact.total_points else null end,
      'login_streak',case when m.share_summary or m.user_id=auth.uid() then impact.login_streak else null end,
      'completed_actions',case when m.share_summary or m.user_id=auth.uid() then impact.completed_actions else null end,
      'co2e_kg_avoided',case when m.share_summary or m.user_id=auth.uid() then impact.co2e_kg_avoided else null end
    ) order by case when m.user_id=auth.uid() then 0 else 1 end, coalesce(p.display_name,'')) from public.community_group_members m left join public.profiles p on p.id=m.user_id cross join lateral public.get_community_impact_summary(m.user_id) impact where m.group_id=g.id),'[]'::jsonb),
    'goals', coalesce((select jsonb_agg(jsonb_build_object('id',goal.id,'group_id',goal.group_id,'title',goal.title,'description',goal.description,'metric',goal.metric,'target_value',goal.target_value,'current_value',(select coalesce(sum(c.value),0) from public.community_goal_contributions c where c.goal_id=goal.id),'my_contribution',(select coalesce(sum(c.value),0) from public.community_goal_contributions c where c.goal_id=goal.id and c.user_id=auth.uid()),'contributors',coalesce((select jsonb_agg(jsonb_build_object('user_id',totals.user_id,'display_name',coalesce(cp.display_name,'Community member'),'value',totals.value,'is_current_user',totals.user_id=auth.uid()) order by totals.value desc) from (select c.user_id,sum(c.value) value from public.community_goal_contributions c where c.goal_id=goal.id group by c.user_id) totals left join public.profiles cp on cp.id=totals.user_id),'[]'::jsonb),'starts_on',goal.starts_on,'ends_on',goal.ends_on,'status',goal.status,'created_by',goal.created_by) order by goal.status,goal.ends_on) from public.community_group_goals goal where goal.group_id=g.id and goal.status<>'archived'),'[]'::jsonb)
  ) into result from public.community_groups g join public.community_group_members me on me.group_id=g.id and me.user_id=auth.uid() where g.id=p_group_id;
  return result;
end $$;

create or replace function public.get_scoped_community_leaderboard(p_scope text, p_metric text, p_group_id uuid default null, p_page integer default 1, p_page_size integer default 25)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare result jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_scope not in ('friends','local','team','global') or p_metric not in ('points','streak') then raise exception 'Invalid leaderboard filter'; end if;
  if p_scope = 'team' and (p_group_id is null or not public.is_community_group_member(p_group_id)) then raise exception 'Team membership required'; end if;
  with eligible as (
    select p.id as user_id
    from public.profiles p
    left join public.community_leaderboard_preferences preference on preference.user_id = p.id
    where p_scope = 'global' and (coalesce(preference.global_enabled,false) or p.id = auth.uid())
    union
    select distinct m.user_id
    from public.community_group_members mine
    join public.community_groups g on g.id = mine.group_id
    join public.community_group_members m on m.group_id = g.id
    where mine.user_id = auth.uid()
      and ((p_scope = 'team' and g.id = p_group_id) or (p_scope in ('friends','local') and g.kind = p_scope))
      and (m.share_summary or m.user_id = auth.uid())
  ), scored as (
    select e.user_id, coalesce(p.display_name,'Community member') display_name, p.avatar_url,
      case when p_metric='points' then impact.total_points else impact.login_streak end as value
    from eligible e join public.profiles p on p.id=e.user_id cross join lateral public.get_community_impact_summary(e.user_id) impact
  ), ranked as (
    select *, rank() over(order by value desc, display_name, user_id) as rank from scored
  ), paged as (
    select * from ranked order by rank limit greatest(1,least(p_page_size,100)) offset greatest(0,(p_page-1)*p_page_size)
  )
  select jsonb_build_object('total_entries',(select count(*) from ranked),'entries',coalesce((select jsonb_agg(jsonb_build_object('user_id',user_id,'display_name',display_name,'avatar_url',avatar_url,'rank',rank,'value',value,'is_current_user',user_id=auth.uid()) order by rank) from paged),'[]'::jsonb)) into result;
  return result;
end $$;

create or replace function public.report_community_discussion(p_discussion_id uuid, p_reason text, p_details text default '')
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_reason not in ('spam','harassment','misinformation','unsafe','other') then raise exception 'Invalid report reason'; end if;
  if not exists(select 1 from public.discussions where id=p_discussion_id and status='published') then raise exception 'Discussion unavailable'; end if;
  insert into public.community_content_reports(reporter_id,discussion_id,reason,details) values(auth.uid(),p_discussion_id,p_reason,trim(coalesce(p_details,''))) on conflict(reporter_id,discussion_id) do update set reason=excluded.reason,details=excluded.details,status='open',created_at=now();
end $$;

create or replace function public.moderate_community_discussion(p_discussion_id uuid, p_status text, p_pin boolean default false)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_knowledge_editor('reviewer') then raise exception 'Reviewer access required'; end if;
  if p_status not in ('published','hidden','removed') then raise exception 'Invalid moderation status'; end if;
  update public.discussions set status=p_status,is_pinned=p_pin,moderated_by=auth.uid(),moderated_at=now(),updated_at=now() where id=p_discussion_id;
  update public.community_content_reports set status='resolved',reviewed_by=auth.uid(),reviewed_at=now() where discussion_id=p_discussion_id and status='open';
end $$;

grant execute on function public.create_community_group(text,text,text), public.get_my_community_groups(), public.join_community_group_by_code(text), public.rotate_community_group_invite(uuid), public.set_community_group_summary_sharing(uuid,boolean), public.get_community_leaderboard_preferences(), public.set_community_global_leaderboard_sharing(boolean), public.create_community_group_goal(uuid,text,text,text,numeric,date,date), public.add_community_goal_contribution(uuid,numeric,text,uuid), public.set_community_project_participation(uuid,boolean), public.review_community_submission(uuid,text,text,date), public.get_community_group_dashboard(uuid), public.get_scoped_community_leaderboard(text,text,uuid,integer,integer), public.report_community_discussion(uuid,text,text), public.moderate_community_discussion(uuid,text,boolean) to authenticated;
grant select on public.community_projects, public.community_project_participants to authenticated;
grant select, insert on public.community_submissions to authenticated;

insert into public.community_projects(id,title,summary,description,scope,location,external_url,starts_at,ends_at,target_participants,seasonal_tag,event_name,status,featured) values
('22af5740-a825-4d5d-a3b4-dff8d1d5d101','International Coastal Cleanup','Join a coordinated cleanup and record a visible contribution to healthier waterways.','Choose a safe local shoreline or riverbank activity, follow organizer guidance, and share practical lessons with the Green Compass community.','global',null,'https://oceanconservancy.org/work/plastics/cleanups-icc/',date_trunc('month',now()) + interval '20 days',date_trunc('month',now()) + interval '50 days',500,'autumn','International Coastal Cleanup','published',true),
('22af5740-a825-4d5d-a3b4-dff8d1d5d102','Neighbourhood Repair & Reuse Day','Bring one household item back into use and exchange repair knowledge locally.','Organize or join a small repair session with friends, family, or neighbours. Count repaired items and share a tip that helped.','local','Choose a venue with your group',null,now(),now() + interval '45 days',100,'autumn','Circular Economy Month','published',true),
('22af5740-a825-4d5d-a3b4-dff8d1d5d103','Community Pollinator Pledge','Create food and shelter for pollinators through locally appropriate planting and pesticide-free care.','Use native planting guidance, document your action, and invite others to build a connected pollinator corridor.','global',null,'https://www.unep.org/news-and-stories/story/why-bees-are-essential-people-and-planet',now(),now() + interval '120 days',1000,'spring','World Bee Day','published',false)
on conflict(id) do update set title=excluded.title,summary=excluded.summary,description=excluded.description,scope=excluded.scope,location=excluded.location,external_url=excluded.external_url,starts_at=excluded.starts_at,ends_at=excluded.ends_at,target_participants=excluded.target_participants,seasonal_tag=excluded.seasonal_tag,event_name=excluded.event_name,status=excluded.status,featured=excluded.featured,updated_at=now();

do $$ begin
  if to_regclass('public.feature_flags') is not null then
    insert into public.feature_flags(key,enabled,updated_at) values('community_engagement_mvp',true,now()) on conflict(key) do update set enabled=excluded.enabled,updated_at=excluded.updated_at;
  end if;
end $$;
