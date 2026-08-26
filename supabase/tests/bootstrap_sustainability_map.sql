-- Minimal Supabase-compatible surface for exercising the sustainability map
-- migration in CI. Production migrations that precede the map migration own
-- these objects; this fixture deliberately contains only their public contract.

create schema if not exists extensions;
create schema if not exists auth;
create schema if not exists storage;

do $$
begin
  if exists(select 1 from pg_extension where extname = 'postgis') then
    if (select n.nspname from pg_extension e join pg_namespace n on n.oid = e.extnamespace where e.extname = 'postgis') <> 'extensions' then
      alter extension postgis set schema extensions;
    end if;
  else
    create extension postgis with schema extensions;
  end if;
end
$$;
create extension if not exists unaccent with schema extensions;

do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;

create table if not exists auth.users (
  id uuid primary key,
  email text
);

create or replace function auth.uid()
returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

create or replace function auth.jwt()
returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb)
$$;

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text not null,
  owner_id uuid references auth.users(id)
);

create or replace function storage.foldername(name text)
returns text[] language sql immutable as $$
  select string_to_array(name, '/')
$$;

alter table storage.objects enable row level security;
grant usage on schema auth, storage to anon, authenticated;
grant select, insert on storage.objects to authenticated;

create table if not exists public.community_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  description text not null,
  scope text not null default 'local',
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'draft',
  featured boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_knowledge_editor(required_role text default 'editor')
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((auth.jwt() -> 'app_metadata' -> 'knowledge_roles') ? required_role, false)
    or coalesce((auth.jwt() -> 'app_metadata' -> 'knowledge_roles') ? 'publisher', false)
$$;
