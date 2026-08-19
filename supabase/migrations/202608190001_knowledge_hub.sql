-- Knowledge Hub foundation: editorial content, public delivery, learning state,
-- assessments, certificates, auditability, and row-level security.
create extension if not exists pgcrypto;
create extension if not exists unaccent;

do $$ begin
  create type knowledge_content_type as enum ('article', 'guide', 'video', 'quiz', 'daily', 'resource');
exception when duplicate_object then null; end $$;
do $$ begin
  create type knowledge_difficulty as enum ('beginner', 'intermediate', 'advanced');
exception when duplicate_object then null; end $$;
do $$ begin
  create type knowledge_status as enum ('draft', 'in_review', 'scheduled', 'published', 'archived');
exception when duplicate_object then null; end $$;

create or replace function public.is_knowledge_editor(required_role text default 'editor')
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((auth.jwt() -> 'app_metadata' -> 'knowledge_roles') ? required_role, false)
    or coalesce((auth.jwt() -> 'app_metadata' -> 'knowledge_roles') ? 'publisher', false);
$$;

create table if not exists public.knowledge_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  description text not null,
  icon text not null,
  accent text not null check (accent ~ '^#[0-9A-Fa-f]{6}$'),
  localization_key text not null unique,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  publisher text not null,
  title text not null,
  canonical_url text not null check (canonical_url ~ '^https://'),
  source_type text not null check (source_type in ('government','intergovernmental','research','university','ngo')),
  published_on date,
  accessed_on date not null,
  license text,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  type knowledge_content_type not null,
  difficulty knowledge_difficulty not null default 'beginner',
  estimated_minutes integer not null check (estimated_minutes between 1 and 600),
  status knowledge_status not null default 'draft',
  downloadable boolean not null default false,
  editor_pick boolean not null default false,
  current_published_version_id uuid,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_item_versions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.knowledge_items(id) on delete cascade,
  version integer not null check (version > 0),
  locale text not null default 'en' check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  title text not null,
  summary text not null,
  body_blocks jsonb not null default '[]'::jsonb check (jsonb_typeof(body_blocks) = 'array'),
  action jsonb,
  author text not null,
  reviewer text not null,
  hero_alt_text text,
  media_rights jsonb not null default '{}'::jsonb,
  search_text text not null,
  seo_title text not null,
  seo_description text not null,
  checksum text not null,
  published_at timestamptz,
  reviewed_at date not null,
  next_review_at date not null check (next_review_at > reviewed_at),
  created_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (item_id, locale, version),
  unique (item_id, checksum)
);

alter table public.knowledge_items drop constraint if exists knowledge_items_current_published_version_id_fkey;
alter table public.knowledge_items add constraint knowledge_items_current_published_version_id_fkey foreign key (current_published_version_id) references public.knowledge_item_versions(id);

create table if not exists public.knowledge_item_topics (
  item_id uuid not null references public.knowledge_items(id) on delete cascade,
  topic_id uuid not null references public.knowledge_topics(id) on delete cascade,
  primary key (item_id, topic_id)
);

create table if not exists public.knowledge_citations (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.knowledge_item_versions(id) on delete cascade,
  source_id uuid not null references public.knowledge_sources(id),
  block_id text,
  sort_order integer not null default 0,
  unique (version_id, source_id, block_id)
);

create table if not exists public.knowledge_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  locale text not null default 'en',
  title text not null,
  summary text not null,
  status knowledge_status not null default 'draft',
  certificate_enabled boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.knowledge_collection_items (
  collection_id uuid not null references public.knowledge_collections(id) on delete cascade,
  item_id uuid not null references public.knowledge_items(id) on delete cascade,
  sort_order integer not null,
  required boolean not null default true,
  primary key (collection_id, item_id)
);

create table if not exists public.knowledge_quizzes (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null unique references public.knowledge_items(id) on delete cascade,
  passing_score integer not null default 80 check (passing_score between 1 and 100)
);
create table if not exists public.knowledge_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.knowledge_quizzes(id) on delete cascade,
  prompt text not null,
  explanation text not null,
  source_id uuid not null references public.knowledge_sources(id),
  sort_order integer not null
);
create table if not exists public.knowledge_answer_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.knowledge_questions(id) on delete cascade,
  text text not null,
  is_correct boolean not null default false,
  sort_order integer not null
);

create table if not exists public.knowledge_daily_schedule (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.knowledge_items(id) on delete cascade,
  locale text not null default 'en',
  publish_on date not null,
  timezone text not null default 'UTC',
  unique (locale, publish_on, timezone)
);

create table if not exists public.user_knowledge_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.knowledge_items(id) on delete cascade,
  version_id uuid not null references public.knowledge_item_versions(id),
  percent integer not null default 0 check (percent between 0 and 100),
  completed boolean generated always as (percent = 100) stored,
  event_id uuid not null unique,
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);
create table if not exists public.user_knowledge_bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.knowledge_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);
create table if not exists public.user_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.knowledge_quizzes(id),
  version_id uuid not null references public.knowledge_item_versions(id),
  answers jsonb not null,
  score integer not null check (score between 0 and 100),
  passed boolean not null,
  event_id uuid not null unique,
  created_at timestamptz not null default now()
);
create table if not exists public.knowledge_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  item_id uuid not null references public.knowledge_items(id) on delete cascade,
  kind text not null check (kind in ('helpful','outdated')),
  status text not null default 'open' check (status in ('open','reviewed','resolved')),
  created_at timestamptz not null default now()
);
create table if not exists public.knowledge_certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_id uuid not null references public.knowledge_collections(id),
  verification_code uuid not null unique default gen_random_uuid(),
  holder_name text,
  public_name_consent boolean not null default false,
  version integer not null default 1,
  status text not null default 'valid' check (status in ('valid','revoked')),
  issued_at timestamptz not null default now(),
  unique (user_id, collection_id, version)
);
create table if not exists public.knowledge_editorial_audit (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  version integer,
  change_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists knowledge_versions_search_idx on public.knowledge_item_versions using gin (to_tsvector('english', search_text));
create index if not exists knowledge_items_delivery_idx on public.knowledge_items (status, type, updated_at desc);
create index if not exists knowledge_progress_user_idx on public.user_knowledge_progress (user_id, updated_at desc);

create or replace view public.published_knowledge_items with (security_invoker = true) as
select i.id,
       v.id as version_id,
       i.slug,
       v.locale,
       i.type::text as type,
       v.title,
       v.summary,
       coalesce((select jsonb_agg(t.slug order by t.sort_order) from public.knowledge_item_topics it join public.knowledge_topics t on t.id = it.topic_id where it.item_id = i.id), '[]'::jsonb) as topic_slugs,
       i.difficulty::text as difficulty,
       i.estimated_minutes,
       v.published_at,
       v.reviewed_at,
       v.next_review_at,
       i.downloadable,
       i.editor_pick,
       v.action,
       v.author,
       v.reviewer,
       v.body_blocks,
       coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'publisher', s.publisher, 'title', s.title, 'url', s.canonical_url, 'sourceType', s.source_type, 'publishedOn', s.published_on, 'accessedOn', s.accessed_on, 'license', s.license) order by c.sort_order) from public.knowledge_citations c join public.knowledge_sources s on s.id = c.source_id where c.version_id = v.id), '[]'::jsonb) as sources,
       v.search_text,
       v.version,
       v.checksum
  from public.knowledge_items i
  join public.knowledge_item_versions v on v.id = i.current_published_version_id
 where i.status = 'published'
   and v.published_at <= now()
   and (v.next_review_at >= current_date or i.editor_pick = true);

create or replace view public.public_quiz_options as
select qz.item_id, qz.id as quiz_id, qz.passing_score, q.id as question_id, q.prompt, q.explanation, q.source_id,
       o.id as option_id, o.text as option_text, q.sort_order as question_order, o.sort_order as option_order
  from public.knowledge_quizzes qz
  join public.knowledge_questions q on q.quiz_id = qz.id
  join public.knowledge_answer_options o on o.question_id = q.id
  join public.knowledge_items i on i.id = qz.item_id
 where i.status = 'published';

create or replace function public.get_public_knowledge_quiz(p_item_id uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', qz.id,
    'itemId', qz.item_id,
    'passingScore', qz.passing_score,
    'questions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', q.id,
          'prompt', q.prompt,
          'explanation', q.explanation,
          'sourceId', q.source_id,
          'options', coalesce((
            select jsonb_agg(jsonb_build_object('id', o.id, 'text', o.text) order by o.sort_order)
              from public.knowledge_answer_options o
             where o.question_id = q.id
          ), '[]'::jsonb)
        ) order by q.sort_order
      )
        from public.knowledge_questions q
       where q.quiz_id = qz.id
    ), '[]'::jsonb)
  )
    from public.knowledge_quizzes qz
    join public.knowledge_items i on i.id = qz.item_id
   where qz.item_id = p_item_id and i.status = 'published';
$$;

create or replace function public.set_knowledge_progress(p_item_id uuid, p_version_id uuid, p_percent integer, p_event_id uuid)
returns public.user_knowledge_progress
language plpgsql security definer set search_path = public as $$
declare result public.user_knowledge_progress;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.user_knowledge_progress(user_id, item_id, version_id, percent, event_id)
  values (auth.uid(), p_item_id, p_version_id, greatest(0, least(100, p_percent)), p_event_id)
  on conflict (user_id, item_id) do update set
    version_id = excluded.version_id,
    percent = greatest(user_knowledge_progress.percent, excluded.percent),
    event_id = excluded.event_id,
    updated_at = now()
  returning * into result;
  return result;
end $$;

create or replace function public.search_knowledge(
  p_query text default '',
  p_locale text default 'en',
  p_topic text default null,
  p_type text default null,
  p_difficulty text default null,
  p_max_minutes integer default null,
  p_downloadable boolean default null,
  p_sort text default 'relevance',
  p_offset integer default 0,
  p_limit integer default 12
)
returns setof public.published_knowledge_items
language sql stable security invoker set search_path = public as $$
  select p.* from public.published_knowledge_items p
   where p.locale = p_locale
     and (nullif(trim(p_query), '') is null or to_tsvector('english', p.search_text) @@ websearch_to_tsquery('english', p_query) or p.title ilike '%' || p_query || '%')
     and (p_topic is null or p.topic_slugs ? p_topic)
     and (p_type is null or p.type = p_type)
     and (p_difficulty is null or p.difficulty = p_difficulty)
     and (p_max_minutes is null or p.estimated_minutes <= p_max_minutes)
     and (p_downloadable is null or p.downloadable = p_downloadable)
   order by
     case when p_sort = 'shortest' then p.estimated_minutes end asc,
     case when p_sort = 'newest' then p.published_at end desc,
     case when p_sort = 'reviewed' then p.reviewed_at end desc,
     case when p_sort = 'relevance' and nullif(trim(p_query), '') is not null then ts_rank(to_tsvector('english', p.search_text), websearch_to_tsquery('english', p_query)) end desc,
     p.editor_pick desc, p.title asc
   offset greatest(p_offset, 0) limit least(greatest(p_limit, 1), 50);
$$;

create or replace function public.submit_knowledge_quiz(p_item_id uuid, p_answers jsonb, p_event_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  quiz_record public.knowledge_quizzes;
  version_id uuid;
  total_count integer;
  correct_count integer;
  result_score integer;
  result_passed boolean;
  result_feedback jsonb;
  attempt_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into quiz_record from public.knowledge_quizzes where item_id = p_item_id;
  select current_published_version_id into version_id from public.knowledge_items where id = p_item_id and status = 'published';
  if quiz_record.id is null or version_id is null then raise exception 'Quiz unavailable'; end if;
  select count(*) into total_count from public.knowledge_questions where quiz_id = quiz_record.id;
  select count(*) into correct_count
    from public.knowledge_questions q
    join public.knowledge_answer_options o on o.question_id = q.id and o.is_correct
   where q.quiz_id = quiz_record.id and p_answers ->> q.id::text = o.id::text;
  result_score := case when total_count = 0 then 0 else round(correct_count * 100.0 / total_count) end;
  result_passed := result_score >= quiz_record.passing_score;
  select coalesce(jsonb_agg(jsonb_build_object(
           'questionId', q.id,
           'correct', exists (
             select 1 from public.knowledge_answer_options selected_option
              where selected_option.question_id = q.id
                and selected_option.id::text = (p_answers ->> q.id::text)
                and selected_option.is_correct
           ),
           'explanation', q.explanation,
           'sourceId', q.source_id
         ) order by q.sort_order), '[]'::jsonb)
    into result_feedback
    from public.knowledge_questions q
   where q.quiz_id = quiz_record.id;
  insert into public.user_quiz_attempts(user_id, quiz_id, version_id, answers, score, passed, event_id)
  values (auth.uid(), quiz_record.id, version_id, p_answers, result_score, result_passed, p_event_id)
  on conflict (event_id) do update set event_id = excluded.event_id
  returning id into attempt_id;
  if result_passed and to_regclass('public.user_points') is not null then
    execute 'insert into public.user_points(user_id, source, points, reference_id, created_at)
             select $1, ''learning_milestone'', 10, $2, now()
             where not exists (select 1 from public.user_points where user_id = $1 and source = ''learning_milestone'' and reference_id = $2)'
      using auth.uid(), p_item_id;
  end if;
  return jsonb_build_object('attemptId', attempt_id, 'score', result_score, 'passed', result_passed, 'correctAnswers', correct_count, 'totalQuestions', total_count, 'feedback', result_feedback);
end $$;

create or replace function public.verify_knowledge_certificate(p_code uuid)
returns table(code uuid, status text, path_title text, holder_name text, issued_at timestamptz, version integer, accreditation_claim boolean)
language sql stable security definer set search_path = public as $$
  select c.verification_code, c.status, col.title,
         case when c.public_name_consent then coalesce(c.holder_name, 'Private learner') else 'Private learner' end,
         c.issued_at, c.version, false
    from public.knowledge_certificates c join public.knowledge_collections col on col.id = c.collection_id
   where c.verification_code = p_code;
$$;

alter table public.knowledge_topics enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.knowledge_items enable row level security;
alter table public.knowledge_item_versions enable row level security;
alter table public.knowledge_item_topics enable row level security;
alter table public.knowledge_citations enable row level security;
alter table public.knowledge_collections enable row level security;
alter table public.knowledge_collection_items enable row level security;
alter table public.knowledge_quizzes enable row level security;
alter table public.knowledge_questions enable row level security;
alter table public.knowledge_answer_options enable row level security;
alter table public.knowledge_daily_schedule enable row level security;
alter table public.user_knowledge_progress enable row level security;
alter table public.user_knowledge_bookmarks enable row level security;
alter table public.user_quiz_attempts enable row level security;
alter table public.knowledge_feedback enable row level security;
alter table public.knowledge_certificates enable row level security;
alter table public.knowledge_editorial_audit enable row level security;

create policy "Public active knowledge topics" on public.knowledge_topics for select using (active or public.is_knowledge_editor());
create policy "Editors manage knowledge topics" on public.knowledge_topics for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Public published knowledge items" on public.knowledge_items for select using (status = 'published' or public.is_knowledge_editor());
create policy "Editors manage knowledge items" on public.knowledge_items for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Public current knowledge versions" on public.knowledge_item_versions for select using (exists (select 1 from public.knowledge_items i where i.id = item_id and (i.current_published_version_id = knowledge_item_versions.id and i.status = 'published' or public.is_knowledge_editor())));
create policy "Editors manage knowledge versions" on public.knowledge_item_versions for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Public knowledge joins" on public.knowledge_item_topics for select using (exists (select 1 from public.knowledge_items i where i.id = item_id and i.status = 'published') or public.is_knowledge_editor());
create policy "Editors manage topic joins" on public.knowledge_item_topics for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Public cited sources" on public.knowledge_sources for select using (exists (select 1 from public.knowledge_citations c join public.knowledge_item_versions v on v.id = c.version_id join public.knowledge_items i on i.current_published_version_id = v.id where c.source_id = knowledge_sources.id and i.status = 'published') or public.is_knowledge_editor());
create policy "Editors manage sources" on public.knowledge_sources for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Public published citations" on public.knowledge_citations for select using (exists (select 1 from public.knowledge_item_versions v join public.knowledge_items i on i.current_published_version_id = v.id where v.id = version_id and i.status = 'published') or public.is_knowledge_editor());
create policy "Editors manage citations" on public.knowledge_citations for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Public published collections" on public.knowledge_collections for select using (status = 'published' or public.is_knowledge_editor());
create policy "Editors manage collections" on public.knowledge_collections for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Public collection items" on public.knowledge_collection_items for select using (exists (select 1 from public.knowledge_collections c where c.id = collection_id and c.status = 'published') or public.is_knowledge_editor());
create policy "Editors manage collection items" on public.knowledge_collection_items for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Public published quizzes" on public.knowledge_quizzes for select using (exists (select 1 from public.knowledge_items i where i.id = item_id and i.status = 'published') or public.is_knowledge_editor());
create policy "Editors manage quizzes" on public.knowledge_quizzes for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Public quiz questions" on public.knowledge_questions for select using (exists (select 1 from public.knowledge_quizzes z join public.knowledge_items i on i.id = z.item_id where z.id = quiz_id and i.status = 'published') or public.is_knowledge_editor());
create policy "Editors manage quiz questions" on public.knowledge_questions for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Editors manage quiz answers" on public.knowledge_answer_options for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Public daily schedule" on public.knowledge_daily_schedule for select using (exists (select 1 from public.knowledge_items i where i.id = item_id and i.status = 'published') or public.is_knowledge_editor());
create policy "Editors manage schedules" on public.knowledge_daily_schedule for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Users own progress" on public.user_knowledge_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own bookmarks" on public.user_knowledge_bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users read own attempts" on public.user_quiz_attempts for select using (auth.uid() = user_id);
create policy "Users submit feedback" on public.knowledge_feedback for insert with check (user_id is null or auth.uid() = user_id);
create policy "Users read own certificates" on public.knowledge_certificates for select using (auth.uid() = user_id or public.is_knowledge_editor());
create policy "Editors manage feedback" on public.knowledge_feedback for all using (public.is_knowledge_editor('reviewer')) with check (public.is_knowledge_editor('reviewer'));
create policy "Editors read audit" on public.knowledge_editorial_audit for select using (public.is_knowledge_editor());
create policy "Editors append audit" on public.knowledge_editorial_audit for insert with check (public.is_knowledge_editor());

grant select on public.published_knowledge_items, public.public_quiz_options to anon, authenticated;
grant execute on function public.set_knowledge_progress(uuid, uuid, integer, uuid) to authenticated;
grant execute on function public.search_knowledge(text, text, text, text, text, integer, boolean, text, integer, integer) to anon, authenticated;
grant execute on function public.get_public_knowledge_quiz(uuid) to anon, authenticated;
grant execute on function public.submit_knowledge_quiz(uuid, jsonb, uuid) to authenticated;
grant execute on function public.verify_knowledge_certificate(uuid) to anon, authenticated;

insert into storage.buckets (id, name, public) values ('knowledge-public-media', 'knowledge-public-media', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('knowledge-downloads', 'knowledge-downloads', false) on conflict (id) do nothing;

create policy "Public knowledge media" on storage.objects for select using (bucket_id = 'knowledge-public-media');
create policy "Editors upload knowledge assets" on storage.objects for insert to authenticated with check (bucket_id in ('knowledge-public-media','knowledge-downloads') and public.is_knowledge_editor());
create policy "Editors update knowledge assets" on storage.objects for update to authenticated using (bucket_id in ('knowledge-public-media','knowledge-downloads') and public.is_knowledge_editor()) with check (bucket_id in ('knowledge-public-media','knowledge-downloads') and public.is_knowledge_editor());
create policy "Editors delete knowledge assets" on storage.objects for delete to authenticated using (bucket_id in ('knowledge-public-media','knowledge-downloads') and public.is_knowledge_editor());

insert into public.knowledge_topics(slug, name, description, icon, accent, localization_key, sort_order) values
('zero-waste','Zero Waste','Prevent waste, reuse more, and make recycling count.','trash-bin-outline','#4E9F6D','knowledge.topic.zero_waste',1),
('clean-energy','Clean Energy','Use energy wisely and understand the clean transition.','flash-outline','#D99A2B','knowledge.topic.clean_energy',2),
('sustainable-food','Sustainable Food','Choose food systems that support people and planet.','nutrition-outline','#A66A3F','knowledge.topic.sustainable_food',3),
('ethical-fashion','Ethical Fashion','Buy less, care longer, and ask better questions.','shirt-outline','#9A6FB0','knowledge.topic.ethical_fashion',4),
('conservation','Conservation','Protect habitats, biodiversity, and shared natural spaces.','paw-outline','#397E73','knowledge.topic.conservation',5),
('climate-action','Climate Action','Understand climate change and choose effective action.','earth-outline','#356B91','knowledge.topic.climate_action',6),
('water-conservation','Water Conservation','Reduce water waste at home and in your community.','water-outline','#3B88A7','knowledge.topic.water_conservation',7),
('green-transportation','Green Transportation','Move with fewer emissions and healthier streets.','bicycle-outline','#5279A5','knowledge.topic.green_transportation',8),
('permaculture','Permaculture','Design resilient gardens and regenerative systems.','flower-outline','#778E3F','knowledge.topic.permaculture',9),
('sustainable-building','Sustainable Building','Create efficient, comfortable, lower-impact spaces.','business-outline','#8B7455','knowledge.topic.sustainable_building',10)
on conflict (slug) do update set name = excluded.name, description = excluded.description, icon = excluded.icon, accent = excluded.accent, sort_order = excluded.sort_order;

insert into public.feature_flags(key, enabled, updated_at) values
('knowledge_hub', true, now()),
('knowledge_personalization', true, now()),
('knowledge_offline', true, now()),
('knowledge_certificates', false, now()),
('knowledge_ai', false, now())
on conflict (key) do update set enabled = excluded.enabled, updated_at = now();
