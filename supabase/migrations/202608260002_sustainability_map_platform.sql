-- Sustainability Map platform: authenticated map sessions, curated places,
-- moderation, visits, conservative impact, events and curated eco-routes.

create extension if not exists postgis with schema extensions;
create extension if not exists unaccent with schema extensions;

create table if not exists public.sustainability_categories (
  id text primary key check (id in ('renewable_energy','local_organic','zero_waste','ev_charging','recycling','green_spaces','community_events')),
  name_en text not null,
  name_bg text not null,
  icon text not null,
  sort_order integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.sustainability_categories(id,name_en,name_bg,icon,sort_order) values
('renewable_energy','Renewable energy','Възобновяема енергия','sunny-outline',10),
('local_organic','Local & organic','Местни и био продукти','leaf-outline',20),
('zero_waste','Zero-waste','Нулев отпадък','infinite-outline',30),
('ev_charging','EV charging','Зареждане на електромобили','flash-outline',40),
('recycling','Recycling','Рециклиране','refresh-circle-outline',50),
('green_spaces','Green spaces','Зелени места','trail-sign-outline',60),
('community_events','Community & events','Общност и събития','people-outline',70)
on conflict(id) do update set name_en=excluded.name_en,name_bg=excluded.name_bg,icon=excluded.icon,sort_order=excluded.sort_order;

create table if not exists public.sustainability_locations (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_ref text not null,
  licence text not null,
  source_url text check (source_url is null or source_url ~ '^https://'),
  name text not null check (char_length(name) between 2 and 160),
  name_bg text,
  description_en text not null default '' check (char_length(description_en) <= 5000),
  description_bg text not null default '' check (char_length(description_bg) <= 5000),
  town text not null default '',
  state_or_province text,
  address_line_1 text,
  address_line_2 text,
  postcode text,
  country text not null default 'Bulgaria',
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  geo extensions.geography(point,4326) generated always as (extensions.st_setsrid(extensions.st_makepoint(longitude,latitude),4326)::extensions.geography) stored,
  phone text,
  email text check (email is null or email ~ '^[^@[:space:]]+@[^@[:space:]]+$'),
  website text check (website is null or website ~ '^https://'),
  opening_hours jsonb not null default '{}'::jsonb,
  sustainability_features jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','pending','published','rejected')),
  verified boolean not null default false,
  featured boolean not null default false,
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source,source_ref)
);

create index if not exists sustainability_locations_geo_idx on public.sustainability_locations using gist(geo);
create index if not exists sustainability_locations_published_idx on public.sustainability_locations(status,featured desc,published_at desc);

create table if not exists public.sustainability_location_categories (
  location_id uuid not null references public.sustainability_locations(id) on delete cascade,
  category_id text not null references public.sustainability_categories(id),
  primary key(location_id,category_id)
);

create table if not exists public.sustainability_connectors (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.sustainability_locations(id) on delete cascade,
  connection_type text,
  power_kw numeric(8,2) check (power_kw is null or power_kw >= 0),
  level text,
  usage_cost text,
  fast_charge boolean not null default false,
  source_ref text not null,
  created_at timestamptz not null default now(),
  unique(location_id,source_ref)
);

create table if not exists public.sustainability_credentials (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.sustainability_locations(id) on delete cascade,
  credential_type text not null check (char_length(credential_type) between 2 and 100),
  issuer text not null check (char_length(issuer) between 2 and 160),
  evidence_url text not null check (evidence_url ~ '^https://'),
  valid_from date,
  valid_until date,
  status text not null default 'pending' check (status in ('pending','verified','expired','rejected')),
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  check (valid_until is null or valid_from is null or valid_until >= valid_from)
);

create table if not exists public.sustainability_media (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.sustainability_locations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  storage_path text not null,
  alt_text text not null default '' check (char_length(alt_text) <= 300),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('sustainability-media','sustainability-media',false,8388608,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create table if not exists public.sustainability_location_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('new_location','correction')),
  location_id uuid references public.sustainability_locations(id) on delete set null,
  proposed_data jsonb not null,
  evidence_urls text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','in_review','approved','rejected')),
  reviewer_id uuid references auth.users(id) on delete set null,
  reviewer_notes text check (reviewer_notes is null or char_length(reviewer_notes) <= 1000),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sustainability_reviews (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.sustainability_locations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 20 and 2000),
  status text not null default 'pending' check (status in ('pending','in_review','approved','rejected')),
  reviewer_id uuid references auth.users(id) on delete set null,
  reviewer_notes text check (reviewer_notes is null or char_length(reviewer_notes) <= 1000),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(location_id,user_id)
);

create table if not exists public.sustainability_review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.sustainability_reviews(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('spam','harassment','misinformation','privacy','other')),
  details text not null default '' check (char_length(details) <= 500),
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(review_id,reporter_id)
);

create table if not exists public.sustainability_checkins (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.sustainability_locations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_day date not null default current_date,
  created_at timestamptz not null default now(),
  unique(location_id,user_id,checkin_day)
);

create table if not exists public.sustainability_impact_factors (
  id uuid primary key default gen_random_uuid(),
  category_id text not null references public.sustainability_categories(id),
  metric text not null check (metric in ('co2e_kg','water_l','waste_kg','plastic_kg')),
  unit text not null,
  factor numeric(14,6) not null check (factor >= 0),
  methodology_version text not null,
  source_url text not null check (source_url ~ '^https://'),
  valid_from date not null,
  valid_until date,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  check (valid_until is null or valid_until >= valid_from),
  unique(category_id,metric,methodology_version)
);

create table if not exists public.sustainability_impact_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_id uuid not null references public.sustainability_checkins(id) on delete cascade,
  factor_id uuid not null references public.sustainability_impact_factors(id),
  quantity numeric(14,4) not null check (quantity > 0),
  estimated_value numeric(14,4) not null check (estimated_value >= 0),
  created_at timestamptz not null default now(),
  unique(checkin_id,factor_id)
);

create table if not exists public.sustainability_user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  category_ids text[] not null default '{}',
  category_affinities jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.sustainability_routes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null,
  title_bg text not null,
  description_en text not null,
  description_bg text not null,
  category_id text references public.sustainability_categories(id),
  duration_minutes integer not null check (duration_minutes between 15 and 1440),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  featured boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sustainability_route_stops (
  route_id uuid not null references public.sustainability_routes(id) on delete cascade,
  location_id uuid not null references public.sustainability_locations(id) on delete cascade,
  stop_order integer not null check (stop_order > 0),
  note_en text not null default '',
  note_bg text not null default '',
  primary key(route_id,stop_order),
  unique(route_id,location_id)
);

alter table public.community_projects add column if not exists latitude double precision check (latitude is null or latitude between -90 and 90);
alter table public.community_projects add column if not exists longitude double precision check (longitude is null or longitude between -180 and 180);
alter table public.community_projects add column if not exists sustainability_location_id uuid references public.sustainability_locations(id) on delete set null;
alter table public.community_projects add column if not exists event_type text not null default 'community' check (event_type in ('community','market','cleanup','tree_planting','workshop','repair'));

create table if not exists public.map_runtime_config (
  id boolean primary key default true check (id),
  interactive_map_enabled boolean not null default true,
  web_limit integer not null default 45000 check (web_limit between 1 and 50000),
  mobile_limit integer not null default 22500 check (mobile_limit between 1 and 25000),
  billing_period_start date not null default date_trunc('month',current_date)::date,
  billing_period_end date not null default (date_trunc('month',current_date) + interval '1 month')::date,
  unavailable_message text not null default 'The interactive globe is temporarily paused to protect the monthly map budget.',
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  check (billing_period_end > billing_period_start)
);
insert into public.map_runtime_config(id) values(true) on conflict(id) do nothing;

create table if not exists public.map_usage_cycles (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null,
  web_sessions integer not null default 0 check (web_sessions >= 0),
  mobile_installations integer not null default 0 check (mobile_installations >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(period_start,period_end)
);

create table if not exists public.map_mobile_installations (
  cycle_id uuid not null references public.map_usage_cycles(id) on delete cascade,
  platform text not null check (platform in ('ios','android')),
  installation_hash text not null check (char_length(installation_hash) between 16 and 160),
  created_at timestamptz not null default now(),
  primary key(cycle_id,platform,installation_hash)
);

create index if not exists sustainability_location_categories_category_idx on public.sustainability_location_categories(category_id,location_id);
create index if not exists sustainability_reviews_moderation_idx on public.sustainability_reviews(status,created_at);
create index if not exists sustainability_submissions_moderation_idx on public.sustainability_location_submissions(status,created_at);
create index if not exists sustainability_checkins_user_idx on public.sustainability_checkins(user_id,created_at desc);
create index if not exists sustainability_projects_geo_idx on public.community_projects(latitude,longitude) where latitude is not null and longitude is not null;

do $$ begin
  if to_regclass('public.badges') is not null then
    insert into public.badges(code,name,description,icon_url,category) values
      ('map_explorer_1','Green Explorer','Checked in at a first verified sustainability location',null,'community'),
      ('map_explorer_5','Conscious Navigator','Checked in at five unique verified locations',null,'community'),
      ('map_explorer_15','Sustainability Trailblazer','Checked in at fifteen unique verified locations',null,'community'),
      ('map_contributor_1','Map Contributor','Published a first approved map contribution',null,'community'),
      ('map_contributor_5','Local Knowledge Keeper','Published five approved map contributions',null,'community'),
      ('map_contributor_15','Community Cartographer','Published fifteen approved map contributions',null,'community')
    on conflict(code) do update set name=excluded.name,description=excluded.description,category=excluded.category;
  end if;
end $$;

create or replace function public.is_sustainability_editor(p_role text default 'reviewer')
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select public.is_knowledge_editor(p_role)
$$;

create or replace function public.get_sustainability_map_preview()
returns jsonb language sql stable security definer set search_path=public,extensions,pg_temp as $$
  select jsonb_build_object(
    'location_count',(select count(*) from public.sustainability_locations where status='published'),
    'category_count',(select count(distinct lc.category_id) from public.sustainability_location_categories lc join public.sustainability_locations l on l.id=lc.location_id where l.status='published'),
    'featured',coalesce((select jsonb_agg(x) from (select l.id,l.name,l.town,lc.category_id from public.sustainability_locations l join public.sustainability_location_categories lc on lc.location_id=l.id where l.status='published' order by l.featured desc,l.published_at desc nulls last limit 3) x),'[]'::jsonb)
  )
$$;

create or replace function public.reserve_map_session(p_platform text,p_installation_hash text default null)
returns jsonb language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare cfg public.map_runtime_config; usage_row public.map_usage_cycles; current_count integer; target_limit integer; inserted_count integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_platform not in ('web','ios','android') then raise exception 'Unsupported map platform'; end if;
  select * into cfg from public.map_runtime_config where id=true for update;
  if not cfg.interactive_map_enabled then
    return jsonb_build_object('allowed',false,'reason','disabled','message',cfg.unavailable_message);
  end if;
  insert into public.map_usage_cycles(period_start,period_end) values(cfg.billing_period_start,cfg.billing_period_end)
  on conflict(period_start,period_end) do update set updated_at=now() returning * into usage_row;
  if p_platform='web' then
    if usage_row.web_sessions >= cfg.web_limit then return jsonb_build_object('allowed',false,'reason','budget','message',cfg.unavailable_message,'used',usage_row.web_sessions,'limit',cfg.web_limit); end if;
    update public.map_usage_cycles set web_sessions=web_sessions+1,updated_at=now() where id=usage_row.id returning web_sessions into current_count;
    target_limit := cfg.web_limit;
  else
    if coalesce(length(trim(p_installation_hash)),0) < 16 then raise exception 'Installation identifier required'; end if;
    insert into public.map_mobile_installations(cycle_id,platform,installation_hash) values(usage_row.id,p_platform,trim(p_installation_hash)) on conflict do nothing;
    get diagnostics inserted_count = row_count;
    if inserted_count=1 then
      if usage_row.mobile_installations >= cfg.mobile_limit then
        delete from public.map_mobile_installations where cycle_id=usage_row.id and platform=p_platform and installation_hash=trim(p_installation_hash);
        return jsonb_build_object('allowed',false,'reason','budget','message',cfg.unavailable_message,'used',usage_row.mobile_installations,'limit',cfg.mobile_limit);
      end if;
      update public.map_usage_cycles set mobile_installations=mobile_installations+1,updated_at=now() where id=usage_row.id returning mobile_installations into current_count;
    else current_count := usage_row.mobile_installations;
    end if;
    target_limit := cfg.mobile_limit;
  end if;
  return jsonb_build_object('allowed',true,'reason','reserved','used',current_count,'limit',target_limit,'percent',round((current_count::numeric/target_limit::numeric)*100,2),'period_start',cfg.billing_period_start,'period_end',cfg.billing_period_end);
end $$;

create or replace function public.get_map_budget_status()
returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare cfg public.map_runtime_config; usage_row public.map_usage_cycles;
begin
  if not public.is_sustainability_editor('reviewer') then raise exception 'Reviewer access required'; end if;
  select * into cfg from public.map_runtime_config where id=true;
  select * into usage_row from public.map_usage_cycles where period_start=cfg.billing_period_start and period_end=cfg.billing_period_end;
  return jsonb_build_object('enabled',cfg.interactive_map_enabled,'web_used',coalesce(usage_row.web_sessions,0),'web_limit',cfg.web_limit,'mobile_used',coalesce(usage_row.mobile_installations,0),'mobile_limit',cfg.mobile_limit,'period_start',cfg.billing_period_start,'period_end',cfg.billing_period_end,'message',cfg.unavailable_message);
end $$;

create or replace function public.set_map_runtime_config(p_enabled boolean,p_web_limit integer,p_mobile_limit integer,p_period_start date,p_period_end date,p_message text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if not public.is_sustainability_editor('publisher') then raise exception 'Publisher access required'; end if;
  if p_web_limit not between 1 and 50000 or p_mobile_limit not between 1 and 25000 or p_period_end<=p_period_start then raise exception 'Invalid map budget configuration'; end if;
  update public.map_runtime_config set interactive_map_enabled=p_enabled,web_limit=p_web_limit,mobile_limit=p_mobile_limit,billing_period_start=p_period_start,billing_period_end=p_period_end,unavailable_message=left(trim(p_message),500),updated_by=auth.uid(),updated_at=now() where id=true;
end $$;

create or replace function public.get_sustainability_map(p_west double precision default null,p_south double precision default null,p_east double precision default null,p_north double precision default null,p_categories text[] default null,p_query text default null,p_limit integer default 2000)
returns table(id uuid,name text,name_bg text,description_en text,description_bg text,town text,state_or_province text,address_line_1 text,address_line_2 text,postcode text,country text,latitude double precision,longitude double precision,phone text,email text,website text,opening_hours jsonb,sustainability_features jsonb,source text,licence text,source_url text,verified boolean,featured boolean,published_at timestamptz,category_ids text[],connectors jsonb,credentials jsonb,rating numeric,review_count bigint)
language sql stable security definer set search_path=public,extensions,pg_temp as $$
  select l.id,l.name,l.name_bg,l.description_en,l.description_bg,l.town,l.state_or_province,l.address_line_1,l.address_line_2,l.postcode,l.country,l.latitude,l.longitude,l.phone,l.email,l.website,l.opening_hours,l.sustainability_features,l.source,l.licence,l.source_url,l.verified,l.featured,l.published_at,
    array(select lc.category_id from public.sustainability_location_categories lc where lc.location_id=l.id order by lc.category_id),
    coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'connectionType',c.connection_type,'powerKw',c.power_kw,'level',c.level,'usageCost',c.usage_cost,'fastCharge',c.fast_charge) order by c.power_kw desc nulls last) from public.sustainability_connectors c where c.location_id=l.id),'[]'::jsonb),
    coalesce((select jsonb_agg(jsonb_build_object('id',cr.id,'type',cr.credential_type,'issuer',cr.issuer,'evidenceUrl',cr.evidence_url,'validFrom',cr.valid_from,'validUntil',cr.valid_until) order by cr.verified_at desc) from public.sustainability_credentials cr where cr.location_id=l.id and cr.status='verified'),'[]'::jsonb),
    (select round(avg(r.rating)::numeric,2) from public.sustainability_reviews r where r.location_id=l.id and r.status='approved'),
    (select count(*) from public.sustainability_reviews r where r.location_id=l.id and r.status='approved')
  from public.sustainability_locations l
  where auth.uid() is not null and l.status='published'
    and (coalesce(array_length(p_categories,1),0)=0 or exists(select 1 from public.sustainability_location_categories lc where lc.location_id=l.id and lc.category_id=any(p_categories)))
    and (coalesce(trim(p_query),'')<>'' or p_west is null or extensions.st_intersects(l.geo,extensions.st_makeenvelope(p_west,p_south,p_east,p_north,4326)::extensions.geography))
    and (coalesce(trim(p_query),'')='' or extensions.unaccent(concat_ws(' ',l.name,l.name_bg,l.town,l.address_line_1,l.address_line_2,l.postcode)) ilike '%'||extensions.unaccent(trim(p_query))||'%')
  order by l.featured desc,l.verified desc,l.name
  limit least(greatest(p_limit,1),2000)
$$;

create or replace function public.award_sustainability_badges(p_user_id uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare visit_total integer; contribution_total integer; badge_code text;
begin
  if to_regclass('public.badges') is null or to_regclass('public.user_badges') is null then return; end if;
  select count(distinct location_id) into visit_total from public.sustainability_checkins where user_id=p_user_id;
  select (select count(*) from public.sustainability_location_submissions where user_id=p_user_id and status='approved')+(select count(*) from public.sustainability_reviews where user_id=p_user_id and status='approved')+(select count(*) from public.sustainability_media where user_id=p_user_id and status='approved') into contribution_total;
  for badge_code in select code from (values ('map_explorer_1',visit_total>=1),('map_explorer_5',visit_total>=5),('map_explorer_15',visit_total>=15),('map_contributor_1',contribution_total>=1),('map_contributor_5',contribution_total>=5),('map_contributor_15',contribution_total>=15)) as thresholds(code,earned) where earned loop
    execute 'insert into public.user_badges(user_id,badge_id,awarded_at) select $1,b.id,now() from public.badges b where b.code=$2 and not exists(select 1 from public.user_badges ub where ub.user_id=$1 and ub.badge_id=b.id)' using p_user_id,badge_code;
  end loop;
end $$;

create or replace function public.check_in_sustainability_location(p_location_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare checkin_id uuid; is_first boolean; inserted_count integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists(select 1 from public.sustainability_locations where id=p_location_id and status='published') then raise exception 'Location unavailable'; end if;
  is_first := not exists(select 1 from public.sustainability_checkins where user_id=auth.uid() and location_id=p_location_id);
  insert into public.sustainability_checkins(location_id,user_id) values(p_location_id,auth.uid()) on conflict(location_id,user_id,checkin_day) do nothing returning id into checkin_id;
  get diagnostics inserted_count = row_count;
  if inserted_count=0 then raise exception 'You already checked in here today'; end if;
  if is_first and to_regclass('public.user_points') is not null then
    execute 'insert into public.user_points(user_id,source,points,reference_id,created_at) select $1,''map_first_visit'',5,$2,now() where not exists(select 1 from public.user_points where user_id=$1 and source=''map_first_visit'' and reference_id=$2)' using auth.uid(),p_location_id::text;
  end if;
  perform public.award_sustainability_badges(auth.uid());
  return jsonb_build_object('id',checkin_id,'first_visit',is_first,'points_awarded',case when is_first then 5 else 0 end);
end $$;

create or replace function public.review_sustainability_content(p_kind text,p_id uuid,p_status text,p_notes text default '')
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare owner_id uuid; reward_points integer; reward_source text; submission_row public.sustainability_location_submissions; new_location_id uuid; category_value text;
begin
  if not public.is_sustainability_editor('reviewer') then raise exception 'Reviewer access required'; end if;
  if p_status not in ('approved','rejected') or p_kind not in ('submission','review','media') then raise exception 'Invalid moderation action'; end if;
  if p_kind='submission' then
    update public.sustainability_location_submissions set status=p_status,reviewer_id=auth.uid(),reviewer_notes=left(trim(p_notes),1000),reviewed_at=now(),updated_at=now() where id=p_id returning * into submission_row;
    owner_id:=submission_row.user_id; reward_points:=50; reward_source:='map_location_approved';
    if p_status='approved' and submission_row.kind='new_location' then
      if coalesce(trim(submission_row.proposed_data->>'name'),'')='' or not (submission_row.proposed_data ? 'latitude') or not (submission_row.proposed_data ? 'longitude') then raise exception 'Name and coordinates are required before approval'; end if;
      insert into public.sustainability_locations(source,source_ref,licence,source_url,name,description_en,town,address_line_1,country,latitude,longitude,status,verified,published_at,created_by)
      values('Green Compass Community','submission:'||p_id::text,'Community-submitted listing metadata',case when submission_row.evidence_urls[1]~'^https://' then submission_row.evidence_urls[1] else null end,trim(submission_row.proposed_data->>'name'),coalesce(submission_row.proposed_data->>'description',''),coalesce(submission_row.proposed_data->>'town',''),nullif(trim(submission_row.proposed_data->>'address'),''),'Bulgaria',(submission_row.proposed_data->>'latitude')::double precision,(submission_row.proposed_data->>'longitude')::double precision,'published',false,now(),owner_id)
      on conflict(source,source_ref) do update set name=excluded.name,description_en=excluded.description_en,town=excluded.town,address_line_1=excluded.address_line_1,latitude=excluded.latitude,longitude=excluded.longitude,status='published',updated_at=now() returning id into new_location_id;
      for category_value in select jsonb_array_elements_text(coalesce(submission_row.proposed_data->'category_ids','["community_events"]'::jsonb)) loop
        if exists(select 1 from public.sustainability_categories where id=category_value) then insert into public.sustainability_location_categories(location_id,category_id) values(new_location_id,category_value) on conflict do nothing; end if;
      end loop;
      update public.sustainability_location_submissions set location_id=new_location_id where id=p_id;
    elsif p_status='approved' and submission_row.kind='correction' then
      update public.sustainability_locations set
        name=coalesce(nullif(trim(submission_row.proposed_data->>'name'),''),name),
        description_en=coalesce(nullif(trim(submission_row.proposed_data->>'description'),''),description_en),
        town=coalesce(nullif(trim(submission_row.proposed_data->>'town'),''),town),
        address_line_1=coalesce(nullif(trim(submission_row.proposed_data->>'address'),''),address_line_1),updated_at=now()
      where id=submission_row.location_id;
    end if;
  elsif p_kind='review' then update public.sustainability_reviews set status=p_status,reviewer_id=auth.uid(),reviewer_notes=left(trim(p_notes),1000),reviewed_at=now(),updated_at=now() where id=p_id returning user_id into owner_id; reward_points:=10; reward_source:='map_review_approved';
  else update public.sustainability_media set status=p_status,reviewed_by=auth.uid(),reviewed_at=now() where id=p_id returning user_id into owner_id; reward_points:=5; reward_source:='map_photo_approved'; end if;
  if owner_id is null then raise exception 'Content not found'; end if;
  if p_status='approved' and to_regclass('public.user_points') is not null then
    execute 'insert into public.user_points(user_id,source,points,reference_id,created_at) select $1,$2,$3,$4,now() where not exists(select 1 from public.user_points where user_id=$1 and source=$2 and reference_id=$4)' using owner_id,reward_source,reward_points,p_id::text;
  end if;
  if p_status='approved' then perform public.award_sustainability_badges(owner_id); end if;
end $$;

create or replace function public.get_my_sustainability_impact()
returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
  select jsonb_build_object(
    'visit_count',(select count(*) from public.sustainability_checkins where user_id=auth.uid()),
    'unique_locations',(select count(distinct location_id) from public.sustainability_checkins where user_id=auth.uid()),
    'by_category',coalesce((select jsonb_object_agg(category_id,total) from (select lc.category_id,count(distinct c.id) total from public.sustainability_checkins c join public.sustainability_location_categories lc on lc.location_id=c.location_id where c.user_id=auth.uid() group by lc.category_id) s),'{}'::jsonb),
    'estimates',coalesce((select jsonb_agg(x) from (select f.metric,sum(e.estimated_value) value,f.unit,f.methodology_version,f.source_url from public.sustainability_impact_entries e join public.sustainability_impact_factors f on f.id=e.factor_id where e.user_id=auth.uid() and f.published group by f.metric,f.unit,f.methodology_version,f.source_url) x),'[]'::jsonb)
  )
$$;

create or replace function public.get_sustainability_recommendations(p_lat double precision,p_lng double precision,p_limit integer default 12)
returns table(location_id uuid,score numeric,reasons text[]) language sql stable security definer set search_path=public,extensions,pg_temp as $$
  with stats as (
    select l.id,l.published_at,l.geo,
      coalesce((select count(*) from public.sustainability_checkins c where c.location_id=l.id),0) visits,
      exists(select 1 from public.sustainability_location_categories lc where lc.location_id=l.id and lc.category_id=any(coalesce((select p.category_ids from public.sustainability_user_preferences p where p.user_id=auth.uid()),'{}'::text[]))) preferred,
      least(1,extensions.st_distance(l.geo,extensions.st_setsrid(extensions.st_makepoint(p_lng,p_lat),4326)::extensions.geography)/200000.0) distance_ratio
    from public.sustainability_locations l where auth.uid() is not null and l.status='published'
  ), ranked as (
    select id,round((case when preferred then 40 else 0 end)+(30*(1-distance_ratio))+(20*(visits::numeric/greatest(1,max(visits) over())))+(case when published_at>now()-interval '90 days' then 10 else 0 end),2) score,preferred,distance_ratio,visits,published_at from stats
  )
  select id,score,array_remove(array[case when preferred then 'Matches your preferences' end,case when distance_ratio<0.25 then 'Nearby' end,case when visits>0 then 'Popular with the community' end,case when published_at>now()-interval '90 days' then 'Newly verified' end],null) from ranked order by score desc,id limit least(greatest(p_limit,1),50)
$$;

alter table public.sustainability_categories enable row level security;
alter table public.sustainability_locations enable row level security;
alter table public.sustainability_location_categories enable row level security;
alter table public.sustainability_connectors enable row level security;
alter table public.sustainability_credentials enable row level security;
alter table public.sustainability_media enable row level security;
alter table public.sustainability_location_submissions enable row level security;
alter table public.sustainability_reviews enable row level security;
alter table public.sustainability_review_reports enable row level security;
alter table public.sustainability_checkins enable row level security;
alter table public.sustainability_impact_factors enable row level security;
alter table public.sustainability_impact_entries enable row level security;
alter table public.sustainability_user_preferences enable row level security;
alter table public.sustainability_routes enable row level security;
alter table public.sustainability_route_stops enable row level security;
alter table public.map_runtime_config enable row level security;
alter table public.map_usage_cycles enable row level security;
alter table public.map_mobile_installations enable row level security;

create policy "Authenticated category catalog" on public.sustainability_categories for select to authenticated using(active or public.is_sustainability_editor());
create policy "Authenticated published locations" on public.sustainability_locations for select to authenticated using(status='published' or public.is_sustainability_editor());
create policy "Editors manage locations" on public.sustainability_locations for all to authenticated using(public.is_sustainability_editor()) with check(public.is_sustainability_editor());
create policy "Authenticated location categories" on public.sustainability_location_categories for select to authenticated using(exists(select 1 from public.sustainability_locations l where l.id=location_id and (l.status='published' or public.is_sustainability_editor())));
create policy "Editors manage location categories" on public.sustainability_location_categories for all to authenticated using(public.is_sustainability_editor()) with check(public.is_sustainability_editor());
create policy "Authenticated connectors" on public.sustainability_connectors for select to authenticated using(exists(select 1 from public.sustainability_locations l where l.id=location_id and (l.status='published' or public.is_sustainability_editor())));
create policy "Editors manage connectors" on public.sustainability_connectors for all to authenticated using(public.is_sustainability_editor()) with check(public.is_sustainability_editor());
create policy "Authenticated verified credentials" on public.sustainability_credentials for select to authenticated using(status='verified' or public.is_sustainability_editor());
create policy "Editors manage credentials" on public.sustainability_credentials for all to authenticated using(public.is_sustainability_editor()) with check(public.is_sustainability_editor());
create policy "Authenticated approved media" on public.sustainability_media for select to authenticated using(status='approved' or user_id=auth.uid() or public.is_sustainability_editor());
create policy "Users submit media" on public.sustainability_media for insert to authenticated with check(user_id=auth.uid() and status='pending');
create policy "Users upload own sustainability photos" on storage.objects for insert to authenticated with check(bucket_id='sustainability-media' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Users and reviewers read sustainability photos" on storage.objects for select to authenticated using(bucket_id='sustainability-media' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_sustainability_editor() or exists(select 1 from public.sustainability_media m where m.storage_path=name and m.status='approved')));
create policy "Users read own submissions" on public.sustainability_location_submissions for select to authenticated using(user_id=auth.uid() or public.is_sustainability_editor());
create policy "Users create submissions" on public.sustainability_location_submissions for insert to authenticated with check(user_id=auth.uid() and status='pending');
create policy "Users update pending submissions" on public.sustainability_location_submissions for update to authenticated using(user_id=auth.uid() and status='pending') with check(user_id=auth.uid() and status='pending');
create policy "Approved or own reviews" on public.sustainability_reviews for select to authenticated using(status='approved' or user_id=auth.uid() or public.is_sustainability_editor());
create policy "Users create reviews" on public.sustainability_reviews for insert to authenticated with check(user_id=auth.uid() and status='pending');
create policy "Users update pending reviews" on public.sustainability_reviews for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and status='pending');
create policy "Users create review reports" on public.sustainability_review_reports for insert to authenticated with check(reporter_id=auth.uid());
create policy "Users read own review reports" on public.sustainability_review_reports for select to authenticated using(reporter_id=auth.uid() or public.is_sustainability_editor());
create policy "Users read own checkins" on public.sustainability_checkins for select to authenticated using(user_id=auth.uid());
create policy "Users read published impact factors" on public.sustainability_impact_factors for select to authenticated using(published or public.is_sustainability_editor());
create policy "Users read own impact" on public.sustainability_impact_entries for select to authenticated using(user_id=auth.uid());
create policy "Users own map preferences" on public.sustainability_user_preferences for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "Authenticated published routes" on public.sustainability_routes for select to authenticated using(status='published' or public.is_sustainability_editor());
create policy "Editors manage routes" on public.sustainability_routes for all to authenticated using(public.is_sustainability_editor()) with check(public.is_sustainability_editor());
create policy "Authenticated route stops" on public.sustainability_route_stops for select to authenticated using(exists(select 1 from public.sustainability_routes r where r.id=route_id and (r.status='published' or public.is_sustainability_editor())));
create policy "Editors manage route stops" on public.sustainability_route_stops for all to authenticated using(public.is_sustainability_editor()) with check(public.is_sustainability_editor());

grant execute on function public.get_sustainability_map_preview() to anon,authenticated;
grant execute on function public.reserve_map_session(text,text),public.get_sustainability_map(double precision,double precision,double precision,double precision,text[],text,integer),public.check_in_sustainability_location(uuid),public.get_my_sustainability_impact(),public.get_sustainability_recommendations(double precision,double precision,integer) to authenticated;
grant execute on function public.get_map_budget_status(),public.set_map_runtime_config(boolean,integer,integer,date,date,text),public.review_sustainability_content(text,uuid,text,text) to authenticated;
grant select on public.sustainability_categories,public.sustainability_locations,public.sustainability_location_categories,public.sustainability_connectors,public.sustainability_credentials,public.sustainability_media,public.sustainability_reviews,public.sustainability_impact_factors,public.sustainability_routes,public.sustainability_route_stops to authenticated;
grant select,insert,update on public.sustainability_location_submissions,public.sustainability_reviews,public.sustainability_media,public.sustainability_review_reports,public.sustainability_user_preferences to authenticated;
grant insert,update,delete on public.sustainability_locations,public.sustainability_location_categories,public.sustainability_connectors,public.sustainability_credentials,public.sustainability_routes,public.sustainability_route_stops to authenticated;
