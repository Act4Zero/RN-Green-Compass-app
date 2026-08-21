-- Knowledge Hub complete experience: visual delivery, interactive learning,
-- live sessions, widgets, offline manifests, translations and certificates.

alter type public.knowledge_content_type add value if not exists 'diy';
alter type public.knowledge_content_type add value if not exists 'tour';
alter type public.knowledge_content_type add value if not exists 'simulation';
alter type public.knowledge_content_type add value if not exists 'webinar';
alter type public.knowledge_content_type add value if not exists 'daily_fact';
alter type public.knowledge_content_type add value if not exists 'daily_quote';
alter type public.knowledge_content_type add value if not exists 'daily_tip';

alter table public.knowledge_topics add column if not exists visual jsonb not null default '{}'::jsonb;
alter table public.knowledge_item_versions add column if not exists visual jsonb not null default '{}'::jsonb;
alter table public.knowledge_item_versions add column if not exists translation_status text not null default 'needs_review' check (translation_status in ('needs_review','in_review','approved'));
alter table public.knowledge_item_versions add column if not exists easy_read_blocks jsonb not null default '[]'::jsonb check (jsonb_typeof(easy_read_blocks) = 'array');
alter table public.knowledge_daily_schedule add column if not exists entry_kind text not null default 'fact' check (entry_kind in ('fact','quote','tip'));

create table if not exists public.knowledge_tours (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null unique references public.knowledge_items(id) on delete cascade,
  duration_minutes integer not null check (duration_minutes between 1 and 180),
  stops jsonb not null check (jsonb_typeof(stops) = 'array' and jsonb_array_length(stops) >= 3),
  methodology_source_id uuid not null references public.knowledge_sources(id),
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_simulations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null unique references public.knowledge_items(id) on delete cascade,
  kind text not null check (kind in ('home-energy','food-waste','mobility')),
  configuration jsonb not null check (jsonb_typeof(configuration) = 'object'),
  methodology_source_id uuid not null references public.knowledge_sources(id),
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_webinars (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null unique references public.knowledge_items(id) on delete cascade,
  speaker text not null,
  speaker_role text not null,
  starts_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes between 10 and 480),
  timezone text not null default 'UTC',
  provider text not null check (provider in ('youtube','zoom','vimeo')),
  join_url text not null check (join_url ~ '^https://'),
  replay_url text check (replay_url is null or replay_url ~ '^https://'),
  transcript text,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_webinar_registrations (
  user_id uuid not null references auth.users(id) on delete cascade,
  webinar_id uuid not null references public.knowledge_webinars(id) on delete cascade,
  reminder_enabled boolean not null default true,
  registered_at timestamptz not null default now(),
  reminder_sent_at timestamptz,
  primary key (user_id, webinar_id)
);

create table if not exists public.knowledge_widget_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  locale text not null default 'en' check (locale in ('en','bg')),
  topic_slugs text[] not null default '{}',
  widget_size text not null default 'small' check (widget_size in ('small','medium')),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_download_manifests (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null unique references public.knowledge_item_versions(id) on delete cascade,
  checksum text not null,
  estimated_bytes bigint not null check (estimated_bytes >= 0),
  assets jsonb not null default '[]'::jsonb check (jsonb_typeof(assets) = 'array'),
  created_at timestamptz not null default now()
);

create table if not exists public.user_interactive_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.knowledge_items(id) on delete cascade,
  current_step integer not null default 0 check (current_step >= 0),
  state jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create or replace view public.published_knowledge_visuals with (security_invoker = true) as
select i.id as item_id, v.id as version_id, i.slug, v.locale,
       coalesce(nullif(v.visual, '{}'::jsonb), t.visual) as visual
  from public.knowledge_items i
  join public.knowledge_item_versions v on v.id = i.current_published_version_id
  left join lateral (
    select kt.visual
      from public.knowledge_item_topics kit
      join public.knowledge_topics kt on kt.id = kit.topic_id
     where kit.item_id = i.id
     order by kt.sort_order
     limit 1
  ) t on true
 where i.status = 'published' and v.published_at <= now();

create or replace function public.register_for_knowledge_webinar(p_webinar_id uuid, p_reminder_enabled boolean default true)
returns public.knowledge_webinar_registrations
language plpgsql security definer set search_path = public as $$
declare result public.knowledge_webinar_registrations;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.knowledge_webinars w join public.knowledge_items i on i.id = w.item_id where w.id = p_webinar_id and i.status = 'published') then raise exception 'Webinar unavailable'; end if;
  insert into public.knowledge_webinar_registrations(user_id, webinar_id, reminder_enabled)
  values (auth.uid(), p_webinar_id, p_reminder_enabled)
  on conflict (user_id, webinar_id) do update set reminder_enabled = excluded.reminder_enabled
  returning * into result;
  return result;
end $$;

drop function if exists public.issue_knowledge_certificate(uuid, text, text);
create or replace function public.issue_knowledge_certificate(p_path_slug text, p_holder_name text, p_locale text default 'en')
returns table(code uuid, status text, path_title text, holder_name text, issued_at timestamptz, version integer, accreditation_claim boolean)
language plpgsql security definer set search_path = public as $$
declare path_record public.knowledge_collections;
declare certificate_record public.knowledge_certificates;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into path_record from public.knowledge_collections where slug = p_path_slug and locale = p_locale and status = 'published' and certificate_enabled;
  if path_record.id is null then raise exception 'Learning path unavailable'; end if;
  if exists (
    select 1 from public.knowledge_collection_items ci
    left join public.user_knowledge_progress up on up.item_id = ci.item_id and up.user_id = auth.uid() and up.completed
    where ci.collection_id = path_record.id and ci.required and up.item_id is null
  ) then raise exception 'Required modules incomplete'; end if;
  insert into public.knowledge_certificates(user_id, collection_id, holder_name, public_name_consent)
  values (auth.uid(), path_record.id, nullif(trim(p_holder_name), ''), true)
  on conflict (user_id, collection_id, version) do update set holder_name = excluded.holder_name
  returning * into certificate_record;
  return query select certificate_record.verification_code, certificate_record.status, path_record.title,
    coalesce(certificate_record.holder_name, 'Green Compass Learner'), certificate_record.issued_at,
    certificate_record.version, false;
end $$;

alter table public.knowledge_tours enable row level security;
alter table public.knowledge_simulations enable row level security;
alter table public.knowledge_webinars enable row level security;
alter table public.knowledge_webinar_registrations enable row level security;
alter table public.knowledge_widget_preferences enable row level security;
alter table public.knowledge_download_manifests enable row level security;
alter table public.user_interactive_progress enable row level security;

create policy "Public published tours" on public.knowledge_tours for select using (exists (select 1 from public.knowledge_items i where i.id = item_id and i.status = 'published') or public.is_knowledge_editor());
create policy "Editors manage tours" on public.knowledge_tours for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Public published simulations" on public.knowledge_simulations for select using (exists (select 1 from public.knowledge_items i where i.id = item_id and i.status = 'published') or public.is_knowledge_editor());
create policy "Editors manage simulations" on public.knowledge_simulations for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Public published webinars" on public.knowledge_webinars for select using (exists (select 1 from public.knowledge_items i where i.id = item_id and i.status = 'published') or public.is_knowledge_editor());
create policy "Editors manage webinars" on public.knowledge_webinars for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Users own webinar registrations" on public.knowledge_webinar_registrations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own widget preferences" on public.knowledge_widget_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public published manifests" on public.knowledge_download_manifests for select using (exists (select 1 from public.knowledge_item_versions v join public.knowledge_items i on i.current_published_version_id = v.id where v.id = version_id and i.status = 'published') or public.is_knowledge_editor());
create policy "Editors manage manifests" on public.knowledge_download_manifests for all using (public.is_knowledge_editor()) with check (public.is_knowledge_editor());
create policy "Users own interactive progress" on public.user_interactive_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select on public.published_knowledge_visuals, public.knowledge_tours, public.knowledge_simulations, public.knowledge_webinars, public.knowledge_download_manifests to anon, authenticated;
grant execute on function public.register_for_knowledge_webinar(uuid, boolean) to authenticated;
grant execute on function public.issue_knowledge_certificate(text, text, text) to authenticated;

create or replace function public.validate_knowledge_publication()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status <> 'published' or old.status = 'published' then return new; end if;
  if not public.is_knowledge_editor('publisher') then raise exception 'Publisher role required'; end if;
  if not exists (select 1 from public.knowledge_item_topics where item_id = new.id) then raise exception 'Publication blocked: topic required'; end if;
  if exists (
    select 1 from public.knowledge_item_topics it join public.knowledge_topics t on t.id = it.topic_id
    where it.item_id = new.id and (
      t.visual = '{}'::jsonb or coalesce(t.visual->>'illustrationKey', '') = ''
      or coalesce(t.visual#>>'{alt,en}', '') = '' or coalesce(t.visual#>>'{alt,bg}', '') = ''
      or coalesce(t.visual#>>'{rights,owner}', '') = '' or coalesce(t.visual#>>'{rights,license}', '') = ''
    )
  ) then raise exception 'Publication blocked: topic visual, bilingual alt text and rights are required'; end if;
  if (select count(distinct locale) from public.knowledge_item_versions where item_id = new.id and locale in ('en','bg') and translation_status = 'approved') < 2
    then raise exception 'Publication blocked: approved English and Bulgarian versions are required'; end if;
  if exists (
    select 1 from public.knowledge_item_versions v
    where v.item_id = new.id and v.locale in ('en','bg') and v.translation_status = 'approved' and (
      trim(v.title) = '' or trim(v.summary) = '' or trim(v.author) = '' or trim(v.reviewer) = ''
      or coalesce(v.hero_alt_text, '') = '' or v.media_rights = '{}'::jsonb
      or coalesce(v.media_rights->>'owner', '') = '' or coalesce(v.media_rights->>'license', '') = ''
      or not exists (select 1 from public.knowledge_citations c where c.version_id = v.id)
      or exists (select 1 from jsonb_array_elements(v.body_blocks) block where block->>'type' = 'video' and (coalesce(block->>'transcript', '') = '' or coalesce(block->>'captionsUrl', '') = ''))
    )
  ) then raise exception 'Publication blocked: editorial, citation, media rights, alt text, captions or transcript validation failed'; end if;
  return new;
end $$;

drop trigger if exists validate_knowledge_publication_trigger on public.knowledge_items;
create trigger validate_knowledge_publication_trigger before update of status on public.knowledge_items
for each row execute function public.validate_knowledge_publication();

create or replace function public.audit_knowledge_editorial_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status is distinct from new.status then
    insert into public.knowledge_editorial_audit(actor_id, entity_type, entity_id, action, change_summary)
    values (auth.uid(), 'knowledge_item', new.id, 'status_changed', jsonb_build_object('from', old.status, 'to', new.status));
  end if;
  return new;
end $$;

drop trigger if exists audit_knowledge_editorial_change_trigger on public.knowledge_items;
create trigger audit_knowledge_editorial_change_trigger after update on public.knowledge_items
for each row execute function public.audit_knowledge_editorial_change();

create table if not exists public.knowledge_job_queue (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('webinar_reminder','broken_link_check')),
  payload jsonb not null,
  run_after timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (kind, payload)
);
alter table public.knowledge_job_queue enable row level security;

create or replace function public.enqueue_knowledge_webinar_reminders()
returns integer language plpgsql security definer set search_path = public as $$
declare inserted_count integer;
begin
  insert into public.knowledge_job_queue(kind, payload, run_after)
  select 'webinar_reminder', jsonb_build_object('userId', r.user_id, 'webinarId', r.webinar_id), now()
  from public.knowledge_webinar_registrations r join public.knowledge_webinars w on w.id = r.webinar_id
  where r.reminder_enabled and r.reminder_sent_at is null and w.starts_at between now() + interval '45 minutes' and now() + interval '75 minutes'
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  return inserted_count;
end $$;

create or replace function public.enqueue_knowledge_link_checks()
returns integer language plpgsql security definer set search_path = public as $$
declare inserted_count integer;
begin
  insert into public.knowledge_job_queue(kind, payload, run_after)
  select 'broken_link_check', jsonb_build_object('sourceId', id, 'url', canonical_url), now()
  from public.knowledge_sources
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  return inserted_count;
end $$;

do $$ begin
  if exists (select 1 from pg_namespace where nspname = 'cron') then
    execute $cron$select cron.schedule('knowledge-webinar-reminders', '*/15 * * * *', 'select public.enqueue_knowledge_webinar_reminders()')$cron$;
    execute $cron$select cron.schedule('knowledge-broken-link-checks', '0 4 * * 1', 'select public.enqueue_knowledge_link_checks()')$cron$;
  end if;
exception when others then
  raise notice 'Knowledge scheduled jobs require pg_cron configuration: %', sqlerrm;
end $$;

create or replace view public.published_knowledge_items with (security_invoker = true) as
with ranked_versions as (
  select v.*, row_number() over (partition by v.item_id, v.locale order by v.version desc) as locale_rank
  from public.knowledge_item_versions v
  where v.published_at is not null and v.published_at <= now() and v.translation_status = 'approved'
)
select i.id, v.id as version_id, i.slug, v.locale, i.type::text as type, v.title, v.summary,
       coalesce((select jsonb_agg(t.slug order by t.sort_order) from public.knowledge_item_topics it join public.knowledge_topics t on t.id = it.topic_id where it.item_id = i.id), '[]'::jsonb) as topic_slugs,
       i.difficulty::text as difficulty, i.estimated_minutes, v.published_at, v.reviewed_at, v.next_review_at,
       i.downloadable, i.editor_pick, v.action, v.author, v.reviewer, v.body_blocks,
       coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'publisher', s.publisher, 'title', s.title, 'url', s.canonical_url, 'sourceType', s.source_type, 'publishedOn', s.published_on, 'accessedOn', s.accessed_on, 'license', s.license) order by c.sort_order) from public.knowledge_citations c join public.knowledge_sources s on s.id = c.source_id where c.version_id = v.id), '[]'::jsonb) as sources,
       v.search_text, v.version, v.checksum,
       coalesce(nullif(v.visual, '{}'::jsonb), (select t.visual from public.knowledge_item_topics it join public.knowledge_topics t on t.id = it.topic_id where it.item_id = i.id order by t.sort_order limit 1)) as visual,
       v.easy_read_blocks
from public.knowledge_items i join ranked_versions v on v.item_id = i.id and v.locale_rank = 1
where i.status = 'published' and (v.next_review_at >= current_date or i.editor_pick = true);

grant select on public.published_knowledge_items to anon, authenticated;

insert into public.feature_flags(key, enabled, updated_at) values
('knowledge_certificates', true, now()),
('knowledge_interactives', true, now()),
('knowledge_live_sessions', true, now()),
('knowledge_daily_widget', true, now()),
('knowledge_bulgarian', true, now())
on conflict (key) do update set enabled = excluded.enabled, updated_at = now();
