-- Knowledge Hub V2: interests, data-driven infographics, personal missions,
-- idempotent learning rewards and moderated webinar questions.
alter type public.knowledge_content_type add value if not exists 'infographic';

create table if not exists public.user_knowledge_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  locale text not null default 'en' check (locale in ('en','bg')),
  topic_slugs text[] not null default '{}',
  onboarding_complete boolean not null default false,
  updated_at timestamptz not null default now(),
  check (cardinality(topic_slugs) <= 5)
);

create table if not exists public.knowledge_challenges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title jsonb not null check (title ?& array['en','bg']),
  summary jsonb not null check (summary ?& array['en','bg']),
  topic_slug text not null,
  duration_days integer not null check (duration_days in (3,7,14)),
  reward_points integer not null check ((duration_days = 3 and reward_points = 20) or (duration_days = 7 and reward_points = 35) or (duration_days = 14 and reward_points = 60)),
  steps jsonb not null check (jsonb_typeof(steps) = 'array' and jsonb_array_length(steps) between 3 and 5),
  status public.knowledge_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_knowledge_challenge_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id uuid not null references public.knowledge_challenges(id) on delete cascade,
  started_at timestamptz not null default now(),
  deadline_at timestamptz not null,
  completed_step_ids text[] not null default '{}',
  status text not null default 'active' check (status in ('active','completed','expired')),
  completion_event_id uuid unique,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create unique index if not exists one_active_knowledge_challenge_per_user on public.user_knowledge_challenge_attempts(user_id) where status = 'active';
create index if not exists knowledge_challenge_attempts_user_idx on public.user_knowledge_challenge_attempts(user_id, started_at desc);

create table if not exists public.knowledge_quests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title jsonb not null check (title ?& array['en','bg']),
  summary jsonb not null check (summary ?& array['en','bg']),
  topic_slug text not null,
  reward_points integer not null default 50 check (reward_points = 50),
  status public.knowledge_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_quest_nodes (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.knowledge_quests(id) on delete cascade,
  node_key text not null,
  title jsonb not null check (title ?& array['en','bg']),
  kind text not null check (kind in ('content','quiz','tour','simulation','diy','action')),
  item_key text,
  prerequisite_keys text[] not null default '{}',
  branch_key text,
  required boolean not null default true,
  bonus boolean not null default false,
  reward_points integer not null default 0 check ((bonus and reward_points = 10) or (not bonus and reward_points = 0)),
  sort_order integer not null,
  unique (quest_id, node_key)
);

create table if not exists public.user_knowledge_quest_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_id uuid not null references public.knowledge_quests(id) on delete cascade,
  completed_node_keys text[] not null default '{}',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, quest_id)
);
create index if not exists knowledge_quest_progress_user_idx on public.user_knowledge_quest_progress(user_id, updated_at desc);

alter table public.knowledge_webinars add column if not exists moderation_owner uuid references auth.users(id);

create table if not exists public.knowledge_webinar_questions (
  id uuid primary key default gen_random_uuid(),
  webinar_id uuid not null references public.knowledge_webinars(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 10 and 500),
  status text not null default 'pending' check (status in ('pending','approved','answered','rejected')),
  answer text,
  replay_timestamp_seconds integer check (replay_timestamp_seconds is null or replay_timestamp_seconds >= 0),
  moderated_by uuid references auth.users(id),
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists knowledge_webinar_questions_feed_idx on public.knowledge_webinar_questions(webinar_id, status, created_at);

create table if not exists public.knowledge_webinar_question_votes (
  question_id uuid not null references public.knowledge_webinar_questions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (question_id, user_id)
);

create table if not exists public.knowledge_reward_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference_id text not null,
  kind text not null check (kind in ('item_complete','path_complete','challenge_complete','quest_complete','quest_bonus')),
  points integer not null check (points between 0 and 60),
  created_at timestamptz not null default now(),
  unique (user_id, reference_id)
);
create index if not exists knowledge_reward_user_idx on public.knowledge_reward_events(user_id, created_at desc);

alter table public.user_knowledge_preferences enable row level security;
alter table public.knowledge_challenges enable row level security;
alter table public.user_knowledge_challenge_attempts enable row level security;
alter table public.knowledge_quests enable row level security;
alter table public.knowledge_quest_nodes enable row level security;
alter table public.user_knowledge_quest_progress enable row level security;
alter table public.knowledge_webinar_questions enable row level security;
alter table public.knowledge_webinar_question_votes enable row level security;
alter table public.knowledge_reward_events enable row level security;

create policy "Users own knowledge preferences" on public.user_knowledge_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public reads published knowledge challenges" on public.knowledge_challenges for select using (status = 'published' or public.is_knowledge_editor());
create policy "Editors manage knowledge challenges" on public.knowledge_challenges for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Users read own knowledge challenge attempts" on public.user_knowledge_challenge_attempts for select using (auth.uid() = user_id);
create policy "Public reads published knowledge quests" on public.knowledge_quests for select using (status = 'published' or public.is_knowledge_editor());
create policy "Editors manage knowledge quests" on public.knowledge_quests for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Public reads published knowledge quest nodes" on public.knowledge_quest_nodes for select using (exists (select 1 from public.knowledge_quests q where q.id = quest_id and (q.status = 'published' or public.is_knowledge_editor())));
create policy "Editors manage knowledge quest nodes" on public.knowledge_quest_nodes for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Users read own knowledge quest progress" on public.user_knowledge_quest_progress for select using (auth.uid() = user_id);
create policy "Questions visible to owner editors or after approval" on public.knowledge_webinar_questions for select using (auth.uid() = user_id or status in ('approved','answered') or public.is_knowledge_editor('reviewer'));
create policy "Users submit own webinar questions" on public.knowledge_webinar_questions for insert with check (auth.uid() = user_id and status = 'pending');
create policy "Editors moderate webinar questions" on public.knowledge_webinar_questions for update using (public.is_knowledge_editor('reviewer')) with check (public.is_knowledge_editor('reviewer'));
create policy "Users read question votes" on public.knowledge_webinar_question_votes for select using (true);
create policy "Users own question votes" on public.knowledge_webinar_question_votes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users read own knowledge rewards" on public.knowledge_reward_events for select using (auth.uid() = user_id);

create or replace function public.evaluate_knowledge_badges()
returns text[] language plpgsql security definer set search_path = public, pg_temp as $$
declare newly_awarded text[] := '{}';
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  with eligible(code) as (
    select 'knowledge_first_step' where (select count(*) from public.user_knowledge_progress where user_id=auth.uid() and completed) >= 1
    union all select 'knowledge_curious_learner' where (select count(*) from public.user_knowledge_progress where user_id=auth.uid() and completed) >= 5
    union all select 'knowledge_quiz_ace' where (select count(distinct quiz_id) from public.user_quiz_attempts where user_id=auth.uid() and passed) >= 3
    union all select 'knowledge_pathfinder' where exists(select 1 from public.knowledge_certificates where user_id=auth.uid() and status='valid')
    union all select 'knowledge_experimenter' where (select count(*) from public.user_interactive_progress where user_id=auth.uid() and completed_at is not null) >= 3
    union all select 'knowledge_challenge_finisher' where exists(select 1 from public.user_knowledge_challenge_attempts where user_id=auth.uid() and status='completed')
    union all select 'knowledge_quest_seeker' where exists(select 1 from public.user_knowledge_quest_progress where user_id=auth.uid() and completed_at is not null)
    union all select 'knowledge_green_guru' where (select coalesce(sum(points),0) from public.knowledge_reward_events where user_id=auth.uid()) >= 350
  ), inserted as (
    insert into public.user_badges(user_id,badge_id)
    select auth.uid(), b.id from eligible e join public.badges b on b.code=e.code
    where not exists(select 1 from public.user_badges ub where ub.user_id=auth.uid() and ub.badge_id=b.id)
    on conflict do nothing returning badge_id
  )
  select coalesce(array_agg(b.code),'{}') into newly_awarded from inserted i join public.badges b on b.id=i.badge_id;
  return newly_awarded;
end $$;

create or replace function public.award_knowledge_reward(p_reference_id text, p_kind text, p_points integer default 0)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare expected_points integer := 0; inserted_points integer := 0; total_xp integer; badge_codes text[] := '{}'; already_in_points boolean := false;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_kind = 'item_complete' then
    select case when i.type::text in ('quiz','tour','simulation','diy') then 10 else 5 end into expected_points
      from public.user_knowledge_progress p join public.knowledge_items i on i.id = p.item_id
     where p.user_id = auth.uid() and p.completed and i.id::text = split_part(p_reference_id, ':', 2);
    select exists(select 1 from public.knowledge_items i join public.user_points up on up.user_id = auth.uid() and up.reference_id = i.id::text and up.source = 'learning_milestone' where i.id::text = split_part(p_reference_id, ':', 2) and i.type::text = 'quiz') into already_in_points;
  elsif p_kind = 'challenge_complete' then
    select c.reward_points into expected_points from public.user_knowledge_challenge_attempts a join public.knowledge_challenges c on c.id = a.challenge_id where a.user_id = auth.uid() and a.status = 'completed' and a.id::text = split_part(p_reference_id, ':', 2);
  elsif p_kind = 'quest_complete' then
    select q.reward_points into expected_points from public.user_knowledge_quest_progress p join public.knowledge_quests q on q.id = p.quest_id where p.user_id = auth.uid() and p.completed_at is not null and (q.id::text = split_part(p_reference_id, ':', 2) or q.slug = split_part(p_reference_id, ':', 2));
  elsif p_kind = 'quest_bonus' then
    select n.reward_points into expected_points from public.knowledge_quest_nodes n join public.knowledge_quests q on q.id = n.quest_id join public.user_knowledge_quest_progress p on p.quest_id = q.id and p.user_id = auth.uid() where n.bonus and (q.id::text = split_part(p_reference_id, ':', 2) or q.slug = split_part(p_reference_id, ':', 2)) and n.node_key = split_part(p_reference_id, ':', 3) and n.node_key = any(p.completed_node_keys);
  elsif p_kind = 'path_complete' then
    select 50 into expected_points where exists(select 1 from public.knowledge_certificates c join public.knowledge_collections col on col.id=c.collection_id where c.user_id=auth.uid() and c.status='valid' and (col.id::text=split_part(p_reference_id, ':', 2) or col.slug=split_part(p_reference_id, ':', 2)));
  else raise exception 'Unsupported knowledge reward'; end if;
  if expected_points is null then raise exception 'Reward eligibility not verified'; end if;
  insert into public.knowledge_reward_events(user_id, reference_id, kind, points) values(auth.uid(), p_reference_id, p_kind, expected_points)
  on conflict (user_id, reference_id) do nothing returning points into inserted_points;
  inserted_points := coalesce(inserted_points, 0);
  if inserted_points > 0 and not already_in_points and to_regclass('public.user_points') is not null then
    insert into public.user_points(user_id, source, points, reference_id, created_at) values(auth.uid(), 'learning_milestone', inserted_points, p_reference_id, now());
  end if;
  select coalesce(sum(points),0)::integer into total_xp from public.knowledge_reward_events where user_id = auth.uid();
  badge_codes := public.evaluate_knowledge_badges();
  return jsonb_build_object('awardedPoints',inserted_points,'learningXp',total_xp,'newBadgeCodes',badge_codes);
end $$;

create or replace function public.start_knowledge_challenge(p_challenge_slug text, p_restart boolean default false)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare challenge public.knowledge_challenges; attempt public.user_knowledge_challenge_attempts;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.user_knowledge_challenge_attempts set status = 'expired', updated_at = now() where user_id = auth.uid() and status = 'active' and deadline_at < now();
  select * into challenge from public.knowledge_challenges where slug = p_challenge_slug and status = 'published';
  if challenge.id is null then raise exception 'Challenge unavailable'; end if;
  select * into attempt from public.user_knowledge_challenge_attempts where user_id = auth.uid() and status = 'active';
  if attempt.id is not null and not p_restart then
    if attempt.challenge_id <> challenge.id then raise exception 'Another challenge is active'; end if;
    return jsonb_build_object('challengeId',challenge.slug,'attemptId',attempt.id,'startedAt',attempt.started_at,'deadlineAt',attempt.deadline_at,'completedStepIds',attempt.completed_step_ids,'status',attempt.status);
  end if;
  if attempt.id is not null then update public.user_knowledge_challenge_attempts set status = 'expired', updated_at = now() where id = attempt.id; end if;
  insert into public.user_knowledge_challenge_attempts(user_id,challenge_id,deadline_at) values(auth.uid(),challenge.id,now() + make_interval(days => challenge.duration_days)) returning * into attempt;
  return jsonb_build_object('challengeId',challenge.slug,'attemptId',attempt.id,'startedAt',attempt.started_at,'deadlineAt',attempt.deadline_at,'completedStepIds',attempt.completed_step_ids,'status',attempt.status);
end $$;

create or replace function public.complete_knowledge_challenge_step(p_challenge_slug text, p_step_key text, p_event_id uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare challenge public.knowledge_challenges; attempt public.user_knowledge_challenge_attempts; step_record jsonb; required_count integer; completed_required integer; destination text; step_kind text; verified boolean := false;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into challenge from public.knowledge_challenges where slug = p_challenge_slug and status = 'published';
  select * into attempt from public.user_knowledge_challenge_attempts where user_id = auth.uid() and challenge_id = challenge.id and status = 'active' for update;
  if attempt.id is null or attempt.deadline_at < now() then raise exception 'Active challenge unavailable'; end if;
  select value into step_record from jsonb_array_elements(challenge.steps) where value->>'id' = p_step_key;
  if step_record is null then raise exception 'Challenge step unavailable'; end if;
  if exists(select 1 from jsonb_array_elements_text(coalesce(step_record->'prerequisiteIds','[]'::jsonb)) p where not (p.value = any(attempt.completed_step_ids))) then raise exception 'Prerequisite incomplete'; end if;
  destination := step_record->>'itemId'; step_kind := step_record->>'kind';
  if step_kind = 'action' then verified := true;
  elsif step_kind = 'quiz' then
    select exists(select 1 from public.user_quiz_attempts a join public.knowledge_quizzes q on q.id=a.quiz_id join public.knowledge_items i on i.id=q.item_id where a.user_id=auth.uid() and a.passed and (i.id::text=destination or i.slug=destination)) into verified;
  elsif step_kind in ('simulation','tour','diy') then
    select exists(select 1 from public.user_interactive_progress p join public.knowledge_items i on i.id=p.item_id where p.user_id=auth.uid() and p.completed_at is not null and (i.id::text=destination or i.slug=destination)) into verified;
  else
    select exists(select 1 from public.user_knowledge_progress p join public.knowledge_items i on i.id=p.item_id where p.user_id=auth.uid() and p.completed and (i.id::text=destination or i.slug=destination)) into verified;
  end if;
  if not verified then raise exception 'Complete the linked learning activity first'; end if;
  attempt.completed_step_ids := array(select distinct unnest(attempt.completed_step_ids || p_step_key));
  select count(*) into required_count from jsonb_array_elements(challenge.steps) s where coalesce((s->>'required')::boolean,true);
  select count(*) into completed_required from jsonb_array_elements(challenge.steps) s where coalesce((s->>'required')::boolean,true) and s->>'id' = any(attempt.completed_step_ids);
  update public.user_knowledge_challenge_attempts set completed_step_ids = attempt.completed_step_ids, status = case when completed_required = required_count then 'completed' else 'active' end, completed_at = case when completed_required = required_count then now() else null end, completion_event_id = case when completed_required = required_count then p_event_id else null end, updated_at = now() where id = attempt.id returning * into attempt;
  if attempt.status = 'completed' then perform public.award_knowledge_reward('challenge:' || attempt.id::text,'challenge_complete',challenge.reward_points); end if;
  return jsonb_build_object('challengeId',challenge.slug,'attemptId',attempt.id,'startedAt',attempt.started_at,'deadlineAt',attempt.deadline_at,'completedStepIds',attempt.completed_step_ids,'status',attempt.status,'completedAt',attempt.completed_at);
end $$;

create or replace function public.get_knowledge_quest_progress(p_quest_slug text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare quest public.knowledge_quests; progress public.user_knowledge_quest_progress;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into quest from public.knowledge_quests where slug = p_quest_slug and status = 'published';
  if quest.id is null then return null; end if;
  select * into progress from public.user_knowledge_quest_progress where user_id = auth.uid() and quest_id = quest.id;
  if progress.user_id is null then return null; end if;
  return jsonb_build_object('questId',quest.slug,'completedNodeIds',progress.completed_node_keys,'startedAt',progress.started_at,'completedAt',progress.completed_at);
end $$;

create or replace function public.complete_knowledge_quest_node(p_quest_slug text, p_node_key text, p_event_id uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare quest public.knowledge_quests; node public.knowledge_quest_nodes; progress public.user_knowledge_quest_progress; core_missing integer; branch_needed boolean; branch_done boolean; verified boolean := false;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into quest from public.knowledge_quests where slug = p_quest_slug and status = 'published';
  select * into node from public.knowledge_quest_nodes where quest_id = quest.id and node_key = p_node_key;
  if node.id is null then raise exception 'Quest node unavailable'; end if;
  insert into public.user_knowledge_quest_progress(user_id,quest_id) values(auth.uid(),quest.id) on conflict do nothing;
  select * into progress from public.user_knowledge_quest_progress where user_id = auth.uid() and quest_id = quest.id for update;
  if cardinality(node.prerequisite_keys) > 0 and not exists(select 1 from unnest(node.prerequisite_keys) k where k = any(progress.completed_node_keys)) then raise exception 'Prerequisite incomplete'; end if;
  if node.kind = 'action' then verified := true;
  elsif node.kind = 'quiz' then
    select exists(select 1 from public.user_quiz_attempts a join public.knowledge_quizzes q on q.id=a.quiz_id join public.knowledge_items i on i.id=q.item_id where a.user_id=auth.uid() and a.passed and (i.id::text=node.item_key or i.slug=node.item_key)) into verified;
  elsif node.kind in ('simulation','tour','diy') then
    select exists(select 1 from public.user_interactive_progress p join public.knowledge_items i on i.id=p.item_id where p.user_id=auth.uid() and p.completed_at is not null and (i.id::text=node.item_key or i.slug=node.item_key)) into verified;
  else
    select exists(select 1 from public.user_knowledge_progress p join public.knowledge_items i on i.id=p.item_id where p.user_id=auth.uid() and p.completed and (i.id::text=node.item_key or i.slug=node.item_key)) into verified;
  end if;
  if not verified then raise exception 'Complete the linked quest activity first'; end if;
  progress.completed_node_keys := array(select distinct unnest(progress.completed_node_keys || node.node_key));
  select count(*) into core_missing from public.knowledge_quest_nodes n where n.quest_id = quest.id and n.required and n.branch_key is null and not (n.node_key = any(progress.completed_node_keys));
  select exists(select 1 from public.knowledge_quest_nodes n where n.quest_id = quest.id and n.required and n.branch_key is not null), exists(select 1 from public.knowledge_quest_nodes n where n.quest_id = quest.id and n.required and n.branch_key is not null and n.node_key = any(progress.completed_node_keys)) into branch_needed, branch_done;
  update public.user_knowledge_quest_progress set completed_node_keys = progress.completed_node_keys, completed_at = case when core_missing = 0 and (not branch_needed or branch_done) then coalesce(completed_at,now()) else completed_at end, updated_at = now() where user_id = auth.uid() and quest_id = quest.id returning * into progress;
  if node.bonus then perform public.award_knowledge_reward('quest-node:' || quest.id::text || ':' || node.node_key,'quest_bonus',node.reward_points); end if;
  if progress.completed_at is not null then perform public.award_knowledge_reward('quest:' || quest.id::text,'quest_complete',quest.reward_points); end if;
  return jsonb_build_object('questId',quest.slug,'completedNodeIds',progress.completed_node_keys,'startedAt',progress.started_at,'completedAt',progress.completed_at);
end $$;

create or replace function public.submit_knowledge_webinar_question(p_webinar_id uuid, p_body text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare question public.knowledge_webinar_questions; clean_body text := regexp_replace(trim(p_body),'\s+',' ','g');
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(clean_body) not between 10 and 500 then raise exception 'Question must be 10 to 500 characters'; end if;
  insert into public.knowledge_webinar_questions(webinar_id,user_id,body) values(p_webinar_id,auth.uid(),clean_body) returning * into question;
  return jsonb_build_object('id',question.id,'webinarId',question.webinar_id,'userId',question.user_id,'body',question.body,'status',question.status,'upvotes',0,'viewerHasUpvoted',false,'createdAt',question.created_at);
end $$;

create or replace function public.get_knowledge_webinar_questions(p_webinar_id uuid)
returns table(id uuid, webinar_id uuid, user_id uuid, body text, status text, upvotes bigint, viewer_has_upvoted boolean, answer text, replay_timestamp_seconds integer, created_at timestamptz)
language sql stable security definer set search_path = public, pg_temp as $$
  select q.id,q.webinar_id,q.user_id,q.body,q.status,(select count(*) from public.knowledge_webinar_question_votes v where v.question_id=q.id),exists(select 1 from public.knowledge_webinar_question_votes v where v.question_id=q.id and v.user_id=auth.uid()),q.answer,q.replay_timestamp_seconds,q.created_at
  from public.knowledge_webinar_questions q where q.webinar_id=p_webinar_id and (q.status in ('approved','answered') or q.user_id=auth.uid() or public.is_knowledge_editor('reviewer')) order by 6 desc,q.created_at;
$$;

create or replace function public.toggle_knowledge_webinar_question_vote(p_question_id uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare question public.knowledge_webinar_questions; voted boolean; votes bigint;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into question from public.knowledge_webinar_questions where id=p_question_id and status in ('approved','answered');
  if question.id is null then raise exception 'Question unavailable'; end if;
  delete from public.knowledge_webinar_question_votes where question_id=p_question_id and user_id=auth.uid(); get diagnostics votes = row_count;
  if votes = 0 then insert into public.knowledge_webinar_question_votes(question_id,user_id) values(p_question_id,auth.uid()); voted := true; else voted := false; end if;
  select count(*) into votes from public.knowledge_webinar_question_votes where question_id=p_question_id;
  return jsonb_build_object('id',question.id,'webinarId',question.webinar_id,'userId',question.user_id,'body',question.body,'status',question.status,'upvotes',votes,'viewerHasUpvoted',voted,'answer',question.answer,'replayTimestampSeconds',question.replay_timestamp_seconds,'createdAt',question.created_at);
end $$;

create or replace function public.get_knowledge_learning_profile()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare xp integer; total_points integer; challenge jsonb; quest jsonb; topic_progress jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select coalesce(sum(points),0)::integer into xp from public.knowledge_reward_events where user_id=auth.uid();
  select coalesce(sum(points),0)::integer into total_points from public.user_points where user_id=auth.uid();
  select jsonb_build_object('challengeId',c.slug,'attemptId',a.id,'startedAt',a.started_at,'deadlineAt',a.deadline_at,'completedStepIds',a.completed_step_ids,'status',a.status) into challenge from public.user_knowledge_challenge_attempts a join public.knowledge_challenges c on c.id=a.challenge_id where a.user_id=auth.uid() and a.status='active' order by a.started_at desc limit 1;
  select jsonb_build_object('questId',q.slug,'completedNodeIds',p.completed_node_keys,'startedAt',p.started_at,'completedAt',p.completed_at) into quest from public.user_knowledge_quest_progress p join public.knowledge_quests q on q.id=p.quest_id where p.user_id=auth.uid() and p.completed_at is null order by p.updated_at desc limit 1;
  select coalesce(jsonb_object_agg(slug,percent),'{}') into topic_progress from (
    select t.slug, coalesce(round(100.0 * count(distinct p.item_id) filter(where p.completed) / nullif(count(distinct i.id),0)),0)::integer percent
      from public.knowledge_topics t left join public.knowledge_item_topics it on it.topic_id=t.id left join public.knowledge_items i on i.id=it.item_id and i.status='published' left join public.user_knowledge_progress p on p.item_id=i.id and p.user_id=auth.uid()
     where t.active group by t.id,t.slug
  ) topic_totals;
  return jsonb_build_object('learningXp',xp,'totalGreenPoints',total_points,'completedItems',(select count(*) from public.user_knowledge_progress where user_id=auth.uid() and completed),'completedQuizzes',(select count(distinct quiz_id) from public.user_quiz_attempts where user_id=auth.uid() and passed),'completedInteractives',(select count(*) from public.user_interactive_progress where user_id=auth.uid() and completed_at is not null),'topicProgress',topic_progress,'activeChallenge',challenge,'activeQuest',quest,'badgeCodes',coalesce((select jsonb_agg(b.code) from public.user_badges ub join public.badges b on b.id=ub.badge_id where ub.user_id=auth.uid() and b.category='knowledge_hub'),'[]'::jsonb));
end $$;

create or replace function public.validate_knowledge_v2_version()
returns trigger language plpgsql set search_path = public, pg_temp as $$
declare content_type text; graphic jsonb;
begin
  select type::text into content_type from public.knowledge_items where id=new.item_id;
  if content_type='infographic' then
    select value into graphic from jsonb_array_elements(new.body_blocks) where value->>'type'='infographic' limit 1;
    if graphic is null or coalesce(graphic->>'textAlternative','')='' or jsonb_array_length(coalesce(graphic->'dataPoints','[]'::jsonb))<2 then raise exception 'Publication blocked: infographic accessibility and data required'; end if;
    if exists(select 1 from jsonb_array_elements(graphic->'dataPoints') p where coalesce(p->>'sourceId','')='') then raise exception 'Publication blocked: every infographic point needs a source'; end if;
  end if;
  return new;
end $$;
drop trigger if exists validate_knowledge_v2_version_trigger on public.knowledge_item_versions;
create trigger validate_knowledge_v2_version_trigger before insert or update on public.knowledge_item_versions for each row execute function public.validate_knowledge_v2_version();

create or replace function public.validate_published_knowledge_webinar()
returns trigger language plpgsql set search_path = public, pg_temp as $$
declare item_status text;
begin
  select status::text into item_status from public.knowledge_items where id=new.item_id;
  if item_status='published' and (
    new.moderation_owner is null or trim(new.speaker)='' or trim(new.speaker_role)='' or trim(new.timezone)='' or
    (new.provider='youtube' and new.join_url !~ 'youtube\.com/(watch\?v=|live/)' and new.join_url !~ 'youtu\.be/') or
    (new.provider='zoom' and new.join_url !~ 'zoom\.[^/]+/j/') or
    (new.provider='vimeo' and new.join_url !~ 'vimeo\.com/event/')
  ) then raise exception 'Publication blocked: webinar needs a real event URL, speaker, timezone and moderation owner'; end if;
  return new;
end $$;
drop trigger if exists validate_published_knowledge_webinar_trigger on public.knowledge_webinars;
create trigger validate_published_knowledge_webinar_trigger before insert or update on public.knowledge_webinars for each row execute function public.validate_published_knowledge_webinar();

create or replace function public.validate_knowledge_webinar_publication()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if new.type::text='webinar' and new.status='published' and not exists(
    select 1 from public.knowledge_webinars w where w.item_id=new.id and w.moderation_owner is not null and trim(w.speaker)<>'' and trim(w.speaker_role)<>'' and trim(w.timezone)<>'' and (
      (w.provider='youtube' and (w.join_url ~ 'youtube\.com/(watch\?v=|live/)' or w.join_url ~ 'youtu\.be/')) or
      (w.provider='zoom' and w.join_url ~ 'zoom\.[^/]+/j/') or
      (w.provider='vimeo' and w.join_url ~ 'vimeo\.com/event/')
    )
  ) then raise exception 'Publication blocked: configure and assign moderation for the real webinar event first'; end if;
  return new;
end $$;
drop trigger if exists validate_knowledge_webinar_publication_trigger on public.knowledge_items;
create trigger validate_knowledge_webinar_publication_trigger before insert or update of status on public.knowledge_items for each row execute function public.validate_knowledge_webinar_publication();

update public.knowledge_items i set status='draft',updated_at=now()
 where i.type::text='webinar' and i.status='published' and exists(
   select 1 from public.knowledge_webinars w where w.item_id=i.id and (
     w.moderation_owner is null or trim(w.speaker)='' or trim(w.speaker_role)='' or trim(w.timezone)='' or
     (w.provider='youtube' and w.join_url !~ 'youtube\.com/(watch\?v=|live/)' and w.join_url !~ 'youtu\.be/') or
     (w.provider='zoom' and w.join_url !~ 'zoom\.[^/]+/j/') or
     (w.provider='vimeo' and w.join_url !~ 'vimeo\.com/event/')
   )
 );

create or replace view public.published_knowledge_missions with (security_invoker = true) as
select c.id,c.slug,'challenge'::text as mission_type,c.title,c.summary,c.topic_slug,c.reward_points,c.steps as configuration,c.updated_at
  from public.knowledge_challenges c where c.status='published'
union all
select q.id,q.slug,'quest'::text as mission_type,q.title,q.summary,q.topic_slug,q.reward_points,
       coalesce((select jsonb_agg(jsonb_build_object('id',n.node_key,'title',n.title,'kind',n.kind,'itemId',n.item_key,'prerequisiteIds',n.prerequisite_keys,'branch',n.branch_key,'required',n.required,'bonus',n.bonus,'rewardPoints',n.reward_points) order by n.sort_order) from public.knowledge_quest_nodes n where n.quest_id=q.id),'[]'::jsonb),q.updated_at
  from public.knowledge_quests q where q.status='published';

grant select on public.knowledge_challenges,public.knowledge_quests,public.knowledge_quest_nodes to anon,authenticated;
grant select on public.published_knowledge_missions to anon,authenticated;
grant select,insert,update on public.user_knowledge_preferences to authenticated;
grant select on public.user_knowledge_challenge_attempts,public.user_knowledge_quest_progress,public.knowledge_reward_events to authenticated;
grant select,insert on public.knowledge_webinar_questions,public.knowledge_webinar_question_votes to authenticated;
grant execute on function public.start_knowledge_challenge(text,boolean),public.complete_knowledge_challenge_step(text,text,uuid),public.get_knowledge_quest_progress(text),public.complete_knowledge_quest_node(text,text,uuid),public.submit_knowledge_webinar_question(uuid,text),public.get_knowledge_webinar_questions(uuid),public.toggle_knowledge_webinar_question_vote(uuid),public.get_knowledge_learning_profile(),public.award_knowledge_reward(text,text,integer) to authenticated;

-- Published seeds are intentionally configuration-only; localized learning content
-- remains in the versioned Knowledge catalog and must pass the existing editorial gate.
insert into public.knowledge_challenges(slug,title,summary,topic_slug,duration_days,reward_points,steps,status) values
('climate-basics-3-days','{"en":"Climate Basics in 3 Days","bg":"Основи на климата за 3 дни"}','{"en":"Build a source-backed climate foundation.","bg":"Изградете проверена основа за климата."}','climate-action',3,20,'[{"id":"climate-read","kind":"content","itemId":"knowledge-climate-action-intro","required":true,"prerequisiteIds":[]},{"id":"climate-visual","kind":"content","itemId":"infographic-climate-action","required":true,"prerequisiteIds":["climate-read"]},{"id":"climate-quiz","kind":"quiz","itemId":"climate-action-basics-quiz","required":true,"prerequisiteIds":["climate-visual"]}]','published'),
('energy-efficiency-sprint','{"en":"Energy Efficiency Sprint","bg":"Спринт за енергийна ефективност"}','{"en":"Improve one week of home energy choices.","bg":"Подобрете домашните енергийни решения за седмица."}','clean-energy',7,35,'[{"id":"energy-read","kind":"content","itemId":"knowledge-clean-energy-intro","required":true,"prerequisiteIds":[]},{"id":"energy-sim","kind":"simulation","itemId":"home-energy-simulation","required":true,"prerequisiteIds":["energy-read"]},{"id":"energy-quiz","kind":"quiz","itemId":"clean-energy-home-quiz","required":true,"prerequisiteIds":["energy-sim"]},{"id":"energy-action","kind":"action","required":true,"prerequisiteIds":["energy-quiz"]}]','published'),
('plastic-free-kickstart','{"en":"Plastic-Free Kickstart","bg":"Старт с по-малко пластмаса"}','{"en":"Replace avoidable single-use choices.","bg":"Заменете излишните еднократни продукти."}','zero-waste',7,35,'[{"id":"plastic-read","kind":"content","itemId":"knowledge-zero-waste-guide","required":true,"prerequisiteIds":[]},{"id":"plastic-diy","kind":"diy","itemId":"zero-waste-diy-project","required":true,"prerequisiteIds":["plastic-read"]},{"id":"plastic-quiz","kind":"quiz","itemId":"lower-waste-choices-quiz","required":true,"prerequisiteIds":["plastic-diy"]}]','published'),
('food-waste-reset','{"en":"Food Waste Reset","bg":"Рестарт срещу хранителния отпадък"}','{"en":"Plan, store and use food intentionally.","bg":"Планирайте и използвайте храната съзнателно."}','sustainable-food',7,35,'[{"id":"food-read","kind":"content","itemId":"knowledge-sustainable-food-guide","required":true,"prerequisiteIds":[]},{"id":"food-sim","kind":"simulation","itemId":"food-waste-simulation","required":true,"prerequisiteIds":["food-read"]},{"id":"food-quiz","kind":"quiz","itemId":"sustainable-food-skills-quiz","required":true,"prerequisiteIds":["food-sim"]}]','published'),
('sustainable-travel-week','{"en":"Sustainable Travel Week","bg":"Седмица на устойчивото придвижване"}','{"en":"Compare realistic mobility choices.","bg":"Сравнете реалистични решения за придвижване."}','green-transportation',7,35,'[{"id":"travel-read","kind":"content","itemId":"knowledge-green-transportation-guide","required":true,"prerequisiteIds":[]},{"id":"travel-sim","kind":"simulation","itemId":"mobility-simulation","required":true,"prerequisiteIds":["travel-read"]},{"id":"travel-quiz","kind":"quiz","itemId":"green-transportation-skills-quiz","required":true,"prerequisiteIds":["travel-sim"]}]','published'),
('green-home-builder','{"en":"Green Home Builder","bg":"Създател на по-зелен дом"}','{"en":"Connect energy, water and materials.","bg":"Свържете енергия, вода и материали."}','sustainable-building',14,60,'[{"id":"home-read","kind":"content","itemId":"knowledge-sustainable-building-guide","required":true,"prerequisiteIds":[]},{"id":"home-water","kind":"content","itemId":"infographic-water-conservation","required":true,"prerequisiteIds":["home-read"]},{"id":"home-energy","kind":"simulation","itemId":"home-energy-simulation","required":true,"prerequisiteIds":["home-water"]},{"id":"home-action","kind":"action","required":true,"prerequisiteIds":["home-energy"]}]','published')
on conflict(slug) do update set title=excluded.title,summary=excluded.summary,topic_slug=excluded.topic_slug,duration_days=excluded.duration_days,reward_points=excluded.reward_points,steps=excluded.steps,status=excluded.status,updated_at=now();

insert into public.knowledge_quests(slug,title,summary,topic_slug,status) values
('home-energy-detective','{"en":"Home Energy Detective","bg":"Домашен енергиен детектив"}','{"en":"Follow evidence from the meter to action.","bg":"Проследете доказателствата от електромера до действие."}','clean-energy','published'),
('low-waste-kitchen','{"en":"Low-Waste Kitchen","bg":"Кухня с по-малко отпадъци"}','{"en":"Connect planning, storage and reuse.","bg":"Свържете планиране, съхранение и повторна употреба."}','zero-waste','published'),
('climate-solutions-trail','{"en":"Climate Solutions Trail","bg":"Пътека на климатичните решения"}','{"en":"Move from evidence to collective action.","bg":"Преминете от доказателства към общо действие."}','climate-action','published')
on conflict(slug) do update set title=excluded.title,summary=excluded.summary,topic_slug=excluded.topic_slug,status=excluded.status,updated_at=now();

insert into public.knowledge_quest_nodes(quest_id,node_key,title,kind,item_key,prerequisite_keys,branch_key,required,bonus,reward_points,sort_order)
select q.id,
  case n.node_key when 'step-1' then p.prefix || '-1' when 'step-2' then p.prefix || '-2' when 'branch-a' then p.prefix || '-3a' when 'branch-b' then p.prefix || '-3b' when 'step-4' then p.prefix || '-4' when 'step-5' then p.prefix || '-5' when 'bonus-1' then p.prefix || '-bonus-1' else p.prefix || '-bonus-2' end,
  n.title,
  case q.slug || ':' || n.node_key when 'low-waste-kitchen:branch-b' then 'diy' when 'low-waste-kitchen:bonus-2' then 'diy' when 'climate-solutions-trail:branch-a' then 'tour' when 'climate-solutions-trail:bonus-2' then 'tour' else n.kind end,
  case q.slug || ':' || n.node_key
    when 'home-energy-detective:step-1' then 'knowledge-clean-energy-intro'
    when 'home-energy-detective:step-2' then 'infographic-clean-energy'
    when 'home-energy-detective:branch-a' then 'home-energy-simulation'
    when 'home-energy-detective:branch-b' then 'clean-energy-field-notes'
    when 'home-energy-detective:step-4' then 'clean-energy-home-quiz'
    when 'home-energy-detective:bonus-1' then 'infographic-sustainable-building'
    when 'home-energy-detective:bonus-2' then 'infographic-water-conservation'
    when 'low-waste-kitchen:step-1' then 'knowledge-zero-waste-intro'
    when 'low-waste-kitchen:step-2' then 'infographic-zero-waste'
    when 'low-waste-kitchen:branch-a' then 'food-waste-simulation'
    when 'low-waste-kitchen:branch-b' then 'zero-waste-diy-project'
    when 'low-waste-kitchen:step-4' then 'lower-waste-choices-quiz'
    when 'low-waste-kitchen:bonus-1' then 'infographic-sustainable-food'
    when 'low-waste-kitchen:bonus-2' then 'zero-waste-diy-project'
    when 'climate-solutions-trail:step-1' then 'knowledge-climate-action-intro'
    when 'climate-solutions-trail:step-2' then 'infographic-climate-action'
    when 'climate-solutions-trail:branch-a' then 'sustainable-community-tour'
    when 'climate-solutions-trail:branch-b' then 'climate-action-field-notes'
    when 'climate-solutions-trail:step-4' then 'climate-action-basics-quiz'
    when 'climate-solutions-trail:bonus-1' then 'infographic-conservation'
    when 'climate-solutions-trail:bonus-2' then 'wetland-tour'
    else n.item_key end,
  array(select case prerequisite when 'step-1' then p.prefix || '-1' when 'step-2' then p.prefix || '-2' when 'branch-a' then p.prefix || '-3a' when 'branch-b' then p.prefix || '-3b' when 'step-4' then p.prefix || '-4' else p.prefix || '-5' end from unnest(n.prerequisites) prerequisite),
  n.branch_key,n.required,n.bonus,n.reward_points,n.sort_order
from public.knowledge_quests q
cross join lateral (select case q.slug when 'home-energy-detective' then 'qe' when 'low-waste-kitchen' then 'qw' else 'qc' end prefix) p
cross join lateral (values
('step-1',jsonb_build_object('en','Start the journey','bg','Започнете пътешествието'),'content'::text,null::text,'{}'::text[],null::text,true,false,0,1),
('step-2',jsonb_build_object('en','Read the visual clues','bg','Прочетете визуалните улики'),'content',null,array['step-1'],null,true,false,0,2),
('branch-a',jsonb_build_object('en','Explore route A','bg','Разгледайте маршрут А'),'simulation',null,array['step-2'],'a',true,false,0,3),
('branch-b',jsonb_build_object('en','Explore route B','bg','Разгледайте маршрут Б'),'content',null,array['step-2'],'b',true,false,0,4),
('step-4',jsonb_build_object('en','Test your findings','bg','Проверете изводите си'),'quiz',null,array['branch-a','branch-b'],null,true,false,0,5),
('step-5',jsonb_build_object('en','Take practical action','bg','Направете практична стъпка'),'action',null,array['step-4'],null,true,false,0,6),
('bonus-1',jsonb_build_object('en','Bonus mastery','bg','Бонус майсторство'),'content',null,array['step-4'],null,false,true,10,7),
('bonus-2',jsonb_build_object('en','Bonus connection','bg','Бонус връзка'),'content',null,array['step-4'],null,false,true,10,8)
) n(node_key,title,kind,item_key,prerequisites,branch_key,required,bonus,reward_points,sort_order)
on conflict(quest_id,node_key) do update set title=excluded.title,kind=excluded.kind,item_key=excluded.item_key,prerequisite_keys=excluded.prerequisite_keys,branch_key=excluded.branch_key,required=excluded.required,bonus=excluded.bonus,reward_points=excluded.reward_points,sort_order=excluded.sort_order;

do $$ begin
  if to_regclass('public.badges') is not null then
    insert into public.badges(code,name,description,category) values
    ('knowledge_first_step','First Step','Complete a first learning item.','knowledge_hub'),
    ('knowledge_curious_learner','Curious Learner','Complete five learning items.','knowledge_hub'),
    ('knowledge_quiz_ace','Quiz Ace','Pass three quizzes.','knowledge_hub'),
    ('knowledge_pathfinder','Pathfinder','Complete a learning path.','knowledge_hub'),
    ('knowledge_experimenter','Experimenter','Complete three interactive tools.','knowledge_hub'),
    ('knowledge_challenge_finisher','Challenge Finisher','Finish a learning challenge on time.','knowledge_hub'),
    ('knowledge_quest_seeker','Quest Seeker','Complete a Knowledge Quest.','knowledge_hub'),
    ('knowledge_green_guru','Green Guru','Reach 350 learning XP.','knowledge_hub')
    on conflict(code) do update set name=excluded.name,description=excluded.description,category=excluded.category;
  end if;
end $$;
