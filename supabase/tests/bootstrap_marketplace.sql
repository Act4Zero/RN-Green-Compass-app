create schema if not exists auth;
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin; exception when duplicate_object then null; end $$;

create table if not exists auth.users(id uuid primary key,email text);
create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create or replace function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb) $$;
create or replace function auth.role() returns text language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claim.role',true),''),'anon') $$;

create table public.profiles(id uuid primary key references auth.users(id),interests text[] not null default '{}');
create table public.feature_flags(key text primary key,enabled boolean not null,updated_at timestamptz not null default now());
create or replace function public.is_knowledge_editor(required_role text default 'editor') returns boolean language sql stable security definer set search_path=public as $$
  select coalesce((auth.jwt()->'app_metadata'->'knowledge_roles') ? required_role,false) or coalesce((auth.jwt()->'app_metadata'->'knowledge_roles') ? 'publisher',false)
$$;
grant usage on schema auth to anon,authenticated,service_role;
