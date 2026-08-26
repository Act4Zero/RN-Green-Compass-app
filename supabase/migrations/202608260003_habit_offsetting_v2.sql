-- Habit-based carbon offsetting V2: activity ledger, measurable goals,
-- transparent benchmarks, local reminder settings, and provider-confirmed offsets.
create extension if not exists pgcrypto;

alter table public.emission_factors add column if not exists activity text;
alter table public.emission_factors add column if not exists region_code text not null default 'GLOBAL';
alter table public.emission_factors add column if not exists valid_from date;
alter table public.emission_factors add column if not exists valid_to date;
alter table public.emission_factors add column if not exists reviewed_at timestamptz not null default now();
alter table public.user_green_identities add column if not exists country_code text not null default 'GLOBAL';
alter table public.user_green_identities add column if not exists factor_versions text[] not null default '{}';
alter table public.profiles add column if not exists leaderboard_opt_in boolean not null default false;

do $$ begin
 if to_regclass('public.leaderboard') is not null then
  execute 'create or replace view public.opt_in_leaderboard with (security_invoker=true) as select l.* from public.leaderboard l join public.profiles p on p.id=l.user_id where p.leaderboard_opt_in';
  execute 'grant select on public.opt_in_leaderboard to authenticated';
 end if;
end $$;

insert into public.emission_factors(code,version,label,unit,kg_co2e_per_unit,methodology,source_label,source_url,activity,region_code,valid_from,active) values
('car-km','DESNZ-2026-JULY-v1','Average car journey','km',0.2099,'Average unknown-fuel car, direct plus well-to-tank, per vehicle kilometre.','UK Government GHG Conversion Factors 2026','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026','transport','GB','2026-01-01',true),
('bus-passenger-km','DESNZ-2026-JULY-v1','Local bus journey','passenger km',0.128,'Average local bus, direct plus well-to-tank, per passenger kilometre.','UK Government GHG Conversion Factors 2026','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026','transport','GB','2026-01-01',true),
('train-passenger-km','DESNZ-2026-JULY-v1','National rail journey','passenger km',0.03989,'National rail, direct plus well-to-tank, per passenger kilometre.','UK Government GHG Conversion Factors 2026','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026','transport','GB','2026-01-01',true),
('electricity-uk-kwh','DESNZ-2026-JULY-v1','UK grid electricity','kWh',0.18436,'Generation, transmission and distribution, and well-to-tank components.','UK Government GHG Conversion Factors 2026','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026','electricity','GB','2026-01-01',true),
('natural-gas-kwh','DESNZ-2026-JULY-v1','Natural gas heating','kWh',0.20269,'Natural gas gross calorific value, direct plus well-to-tank estimate.','UK Government GHG Conversion Factors 2026','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026','heating','GB','2026-01-01',true),
('heating-oil-kwh','DESNZ-2026-JULY-v1','Heating oil','kWh',0.29877,'Burning oil energy estimate including upstream emissions.','UK Government GHG Conversion Factors 2026','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026','heating','GB','2026-01-01',true),
('beef-meal','GC-FOOD-2026-v1','Beef-based meal estimate','meal',5,'Directional meal template; not an inventory-grade lifecycle assessment.','Green Compass reviewed learning estimate','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026','food','GLOBAL','2026-01-01',true),
('plant-meal','GC-FOOD-2026-v1','Plant-forward meal estimate','meal',0.8,'Directional meal template; not an inventory-grade lifecycle assessment.','Green Compass reviewed learning estimate','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026','food','GLOBAL','2026-01-01',true),
('new-clothing-item','GC-CONSUMPTION-2026-v1','New clothing item estimate','item',12,'Directional consumption template; product-specific footprints vary.','Green Compass reviewed learning estimate','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026','purchases','GLOBAL','2026-01-01',true),
('reused-clothing-item','GC-CONSUMPTION-2026-v1','Reused clothing item estimate','item',1,'Directional estimate for acquisition and handling of a reused item.','Green Compass reviewed learning estimate','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026','purchases','GLOBAL','2026-01-01',true),
('landfill-waste-kg','GC-WASTE-2026-v1','Mixed waste sent to landfill','kg',0.467,'Directional mixed-waste treatment template.','Green Compass reviewed learning estimate','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026','waste','GB','2026-01-01',true),
('recycled-waste-kg','GC-WASTE-2026-v1','Material sent for recycling','kg',0.021,'Directional mixed-recycling treatment template.','Green Compass reviewed learning estimate','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026','waste','GB','2026-01-01',true)
on conflict(code,version) do update set label=excluded.label,unit=excluded.unit,kg_co2e_per_unit=excluded.kg_co2e_per_unit,methodology=excluded.methodology,source_label=excluded.source_label,source_url=excluded.source_url,activity=excluded.activity,region_code=excluded.region_code,valid_from=excluded.valid_from,active=excluded.active,reviewed_at=now();

create table if not exists public.footprint_benchmarks (
  region_code text not null,
  version text not null,
  region_name text not null,
  benchmark_year integer not null check(benchmark_year between 1990 and 2100),
  tonnes_co2e_per_capita numeric not null check(tonnes_co2e_per_capita >= 0),
  scope text not null check(scope='territorial_ghg_excluding_lulucf'),
  source_label text not null,
  source_url text not null check(source_url like 'https://%'),
  active boolean not null default true,
  reviewed_at timestamptz not null default now(),
  primary key(region_code,version)
);

insert into public.footprint_benchmarks values
('GLOBAL','EDGAR-2025-GHG','Global',2024,6.56,'territorial_ghg_excluding_lulucf','EDGAR 2025 report','https://edgar.jrc.ec.europa.eu/report_2025?vis=ghgpop',true,now()),
('BG','EDGAR-2025-GHG','Bulgaria',2024,6.92,'territorial_ghg_excluding_lulucf','EDGAR 2025 report','https://edgar.jrc.ec.europa.eu/report_2025?vis=ghgpop',true,now()),
('GB','EDGAR-2025-GHG','United Kingdom',2024,5.63,'territorial_ghg_excluding_lulucf','EDGAR 2025 report','https://edgar.jrc.ec.europa.eu/report_2025?vis=ghgpop',true,now()),
('US','EDGAR-2025-GHG','United States',2024,17.34,'territorial_ghg_excluding_lulucf','EDGAR 2025 report','https://edgar.jrc.ec.europa.eu/report_2025?vis=ghgpop',true,now()),
('DE','EDGAR-2025-GHG','Germany',2024,8.17,'territorial_ghg_excluding_lulucf','EDGAR 2025 report','https://edgar.jrc.ec.europa.eu/report_2025?vis=ghgpop',true,now())
on conflict(region_code,version) do update set tonnes_co2e_per_capita=excluded.tonnes_co2e_per_capita,reviewed_at=now();

create table if not exists public.impact_equivalencies (
  code text not null,
  version text not null,
  label text not null,
  kg_co2e_per_unit numeric not null check(kg_co2e_per_unit > 0),
  methodology text not null,
  source_label text not null,
  source_url text not null check(source_url like 'https://%'),
  active boolean not null default true,
  reviewed_at timestamptz not null default now(),
  primary key(code,version)
);
insert into public.impact_equivalencies values ('urban-tree-seedling-10-years','EPA-2024-v1','urban tree seedlings grown for 10 years (annual sequestration equivalent)',60,'Approximate probability-weighted annual sequestration after EPA growth and survival assumptions; not a tree-planting claim.','US EPA Greenhouse Gas Equivalencies Calculator','https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator-calculations-and-references',true,now()) on conflict(code,version) do nothing;

create table if not exists public.carbon_activity_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  factor_code text not null,
  factor_version text not null,
  category text not null check(category in ('transport','electricity','heating','food','purchases','waste')),
  label text not null,
  quantity numeric not null check(quantity > 0),
  unit text not null,
  gross_kg_co2e numeric not null check(gross_kg_co2e >= 0),
  comparison_kg_co2e numeric check(comparison_kg_co2e is null or comparison_kg_co2e >= 0),
  avoided_kg_co2e numeric not null default 0 check(avoided_kg_co2e >= 0),
  occurred_on date not null,
  notes text not null default '' check(char_length(notes)<=500),
  source_event_id text,
  created_at timestamptz not null default now(),
  unique(user_id,source_event_id)
);
create index if not exists carbon_activity_user_date_idx on public.carbon_activity_entries(user_id,occurred_on desc);

create table if not exists public.carbon_goal_details (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check(char_length(title) between 1 and 120),
  category text not null check(category in ('transport','electricity','heating','food','purchases','waste')),
  goal_type text not null check(goal_type in ('actions','frequency','kg_co2e','absolute_reduction','percent_reduction')),
  target_value numeric not null check(target_value > 0),
  unit text not null,
  starts_on date not null,
  ends_on date not null check(ends_on>=starts_on),
  baseline_value numeric check(baseline_value is null or baseline_value > 0),
  baseline_source text check(baseline_source is null or baseline_source in ('history','self_reported')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(goal_type<>'percent_reduction' or baseline_value is not null)
);
create table if not exists public.carbon_goal_steps (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.carbon_goal_details(id) on delete cascade,
  title text not null check(char_length(title) between 1 and 160),
  knowledge_slug text,
  sort_order integer not null default 0,
  completed_at timestamptz
);

create table if not exists public.sustainability_reminder_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  hour integer not null default 9 check(hour between 0 and 23),
  minute integer not null default 0 check(minute between 0 and 59),
  weekdays integer[] not null default '{2,3,4,5,6}' check(weekdays <@ array[1,2,3,4,5,6,7]),
  timezone text not null default 'UTC',
  updated_at timestamptz not null default now()
);

create table if not exists public.offset_projects (
  id text primary key check(id ~ '^[a-z0-9-]+$'),
  provider text not null check(provider='cloverly'),
  provider_project_id text not null,
  name text not null,
  summary text not null,
  country text not null,
  technology text not null,
  standard text not null,
  registry_url text not null check(registry_url like 'https://%'),
  permanence text not null,
  price_per_tonne_minor integer not null check(price_per_tonne_minor>0),
  currency text not null check(char_length(currency)=3),
  image_url text,
  active boolean not null default false,
  reviewed_at timestamptz not null default now(),
  unique(provider,provider_project_id)
);
insert into public.offset_projects(id,provider,provider_project_id,name,summary,country,technology,standard,registry_url,permanence,price_per_tonne_minor,currency,active) values
('cloverly-forest-restoration','cloverly','forest-restoration','Verified forest restoration portfolio','Sandbox project. Production metadata must be refreshed and reviewed before feature activation.','Multiple regions','Afforestation and forest restoration','Provider-verified registry credits','https://cloverly.com/','Project-specific; inspect the registry record before checkout.',2200,'USD',true),
('cloverly-renewable-energy','cloverly','renewable-energy','Verified renewable energy portfolio','Sandbox project. Production inventory and certification remain provider-authoritative.','Multiple regions','Renewable energy','Provider-verified registry credits','https://cloverly.com/','Avoidance credit; project-specific documentation applies.',1800,'USD',true)
on conflict(id) do update set name=excluded.name,summary=excluded.summary,price_per_tonne_minor=excluded.price_per_tonne_minor,reviewed_at=now();

create table if not exists public.offset_checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null references public.offset_projects(id),
  provider_session_id text unique,
  quantity_kg_co2e numeric not null check(quantity_kg_co2e>=1),
  checkout_url text,
  status text not null default 'pending' check(status in ('pending','failed','cancelled','fulfilled','retired')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.offset_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null references public.offset_projects(id),
  checkout_session_id uuid references public.offset_checkout_sessions(id),
  provider_reference text not null unique,
  status text not null check(status in ('pending','failed','cancelled','fulfilled','retired')),
  quantity_kg_co2e numeric not null check(quantity_kg_co2e>=0),
  amount_minor integer not null default 0 check(amount_minor>=0),
  currency text not null default 'USD' check(char_length(currency)=3),
  certificate_url text,
  registry_reference text,
  fulfilled_at timestamptz,
  retired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.offset_webhook_events (
  provider text not null,
  event_id text not null,
  payload_hash text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  primary key(provider,event_id)
);

create or replace function public.log_carbon_activity(p_factor_code text,p_quantity numeric,p_occurred_on date,p_comparison_factor_code text default null,p_notes text default '',p_source_event_id text default null)
returns public.carbon_activity_entries language plpgsql security definer set search_path=public as $$
declare f public.emission_factors; c public.emission_factors; existing public.carbon_activity_entries; gross numeric; comparison numeric; saved public.carbon_activity_entries;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_quantity is null or p_quantity<=0 then raise exception 'Quantity must be greater than zero'; end if;
  if p_source_event_id is not null then select * into existing from public.carbon_activity_entries where user_id=auth.uid() and source_event_id=p_source_event_id; if existing.id is not null then return existing; end if; end if;
  select * into f from public.emission_factors where code=p_factor_code and active order by valid_from desc nulls last,version desc limit 1;
  if f.code is null or f.activity is null then raise exception 'Unknown emission factor'; end if;
  gross:=round(p_quantity*f.kg_co2e_per_unit,3);
  if p_comparison_factor_code is not null then
    select * into c from public.emission_factors where code=p_comparison_factor_code and active order by valid_from desc nulls last,version desc limit 1;
    if c.code is null or c.unit<>f.unit then raise exception 'Comparison factors must use the same unit'; end if;
    comparison:=round(p_quantity*c.kg_co2e_per_unit,3);
  end if;
  insert into public.carbon_activity_entries(user_id,factor_code,factor_version,category,label,quantity,unit,gross_kg_co2e,comparison_kg_co2e,avoided_kg_co2e,occurred_on,notes,source_event_id)
  values(auth.uid(),f.code,f.version,f.activity,f.label,p_quantity,f.unit,gross,comparison,case when comparison is null then 0 else greatest(0,comparison-gross) end,p_occurred_on,left(trim(coalesce(p_notes,'')),500),p_source_event_id) returning * into saved;
  return saved;
end $$;

create or replace function public.create_carbon_goal(p_title text,p_category text,p_goal_type text,p_target_value numeric,p_unit text,p_starts_on date,p_ends_on date,p_baseline_value numeric default null,p_baseline_source text default null,p_steps jsonb default '[]')
returns jsonb language plpgsql security definer set search_path=public as $$
declare goal public.carbon_goal_details; step jsonb; position integer:=0;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.carbon_goal_details(user_id,title,category,goal_type,target_value,unit,starts_on,ends_on,baseline_value,baseline_source)
  values(auth.uid(),trim(p_title),p_category,p_goal_type,p_target_value,p_unit,p_starts_on,p_ends_on,p_baseline_value,p_baseline_source) returning * into goal;
  for step in select * from jsonb_array_elements(coalesce(p_steps,'[]')) loop
    insert into public.carbon_goal_steps(goal_id,title,knowledge_slug,sort_order) values(goal.id,left(trim(step->>'title'),160),nullif(step->>'knowledgeSlug',''),position); position:=position+1;
  end loop;
  return jsonb_build_object('id',goal.id,'title',goal.title,'category',goal.category,'goal_type',goal.goal_type,'target_value',goal.target_value,'unit',goal.unit,'starts_on',goal.starts_on,'ends_on',goal.ends_on,'baseline_value',goal.baseline_value,'baseline_source',goal.baseline_source,'current_value',0,'percent_complete',0,'status','active','steps',(select coalesce(jsonb_agg(to_jsonb(s) order by s.sort_order),'[]') from public.carbon_goal_steps s where s.goal_id=goal.id));
end $$;

create or replace function public.get_carbon_goals() returns jsonb language sql security definer set search_path=public as $$
with progress as (
 select g.*,
  case g.goal_type
   when 'actions' then count(a.id)::numeric
   when 'frequency' then count(distinct a.occurred_on)::numeric
   when 'kg_co2e' then coalesce(sum(a.avoided_kg_co2e),0)
   when 'absolute_reduction' then coalesce(sum(a.avoided_kg_co2e),0)
   when 'percent_reduction' then greatest(0,((g.baseline_value-coalesce(sum(a.gross_kg_co2e),0))/g.baseline_value)*100)
  end current_value
 from public.carbon_goal_details g left join public.carbon_activity_entries a on a.user_id=g.user_id and a.category=g.category and a.occurred_on between g.starts_on and g.ends_on
 where g.user_id=auth.uid() group by g.id
)
select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'title',p.title,'category',p.category,'goal_type',p.goal_type,'target_value',p.target_value,'unit',p.unit,'starts_on',p.starts_on,'ends_on',p.ends_on,'baseline_value',p.baseline_value,'baseline_source',p.baseline_source,'current_value',round(p.current_value,2),'percent_complete',least(100,round((p.current_value/p.target_value)*100,1)),'status',case when p.current_value>=p.target_value then 'completed' when current_date>p.ends_on then 'expired' else 'active' end,'steps',(select coalesce(jsonb_agg(to_jsonb(s) order by s.sort_order),'[]') from public.carbon_goal_steps s where s.goal_id=p.id)) order by p.created_at desc),'[]') from progress p;
$$;

create or replace function public.set_carbon_goal_step_completed(p_goal_id uuid,p_step_id uuid,p_completed boolean) returns void language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from public.carbon_goal_details where id=p_goal_id and user_id=auth.uid()) then raise exception 'Goal not found'; end if;
 update public.carbon_goal_steps set completed_at=case when p_completed then now() else null end where id=p_step_id and goal_id=p_goal_id;
end $$;

create or replace function public.get_user_carbon_balance(p_period text default 'week') returns jsonb language plpgsql security definer set search_path=public as $$
declare start_date date; gross numeric; avoided numeric; retired numeric;
begin
 if p_period not in ('day','week','month') then raise exception 'Invalid period'; end if;
 start_date:=case p_period when 'day' then current_date when 'week' then current_date-6 else current_date-29 end;
 select coalesce(sum(gross_kg_co2e),0),coalesce(sum(avoided_kg_co2e),0) into gross,avoided from public.carbon_activity_entries where user_id=auth.uid() and occurred_on>=start_date;
 select coalesce(sum(quantity_kg_co2e),0) into retired from public.offset_contributions where user_id=auth.uid() and status in ('fulfilled','retired') and coalesce(retired_at,fulfilled_at,created_at)::date>=start_date;
 return jsonb_build_object('period',p_period,'grossTrackedKgCo2e',round(gross,2),'avoidedKgCo2e',round(avoided,2),'retiredOffsetKgCo2e',round(retired,2),'netBalanceKgCo2e',round(greatest(0,gross-avoided-retired),2));
end $$;

create or replace function public.evaluate_carbon_badges(p_user_id uuid default auth.uid()) returns text[] language plpgsql security definer set search_path=public as $$
declare codes text[]:='{}'; badge_code text; activity_days integer; completed_goal boolean;
begin
 if p_user_id is null or (auth.role()<>'service_role' and auth.uid()<>p_user_id) then raise exception 'Not allowed'; end if;
 if to_regclass('public.badges') is null or to_regclass('public.user_badges') is null then return codes; end if;
 if exists(select 1 from public.carbon_activity_entries where user_id=p_user_id) then codes:=array_append(codes,'carbon_first_activity'); end if;
 select count(distinct occurred_on) into activity_days from public.carbon_activity_entries where user_id=p_user_id and occurred_on between current_date-6 and current_date;
 if activity_days=7 then codes:=array_append(codes,'carbon_seven_day'); end if;
 select exists(
  select 1 from public.carbon_goal_details g where g.user_id=p_user_id and (
   (g.goal_type='actions' and (select count(*) from public.carbon_activity_entries a where a.user_id=p_user_id and a.category=g.category and a.occurred_on between g.starts_on and g.ends_on)>=g.target_value) or
   (g.goal_type='frequency' and (select count(distinct a.occurred_on) from public.carbon_activity_entries a where a.user_id=p_user_id and a.category=g.category and a.occurred_on between g.starts_on and g.ends_on)>=g.target_value) or
   (g.goal_type in ('kg_co2e','absolute_reduction') and (select coalesce(sum(a.avoided_kg_co2e),0) from public.carbon_activity_entries a where a.user_id=p_user_id and a.category=g.category and a.occurred_on between g.starts_on and g.ends_on)>=g.target_value) or
   (g.goal_type='percent_reduction' and (select greatest(0,((g.baseline_value-coalesce(sum(a.gross_kg_co2e),0))/g.baseline_value)*100) from public.carbon_activity_entries a where a.user_id=p_user_id and a.category=g.category and a.occurred_on between g.starts_on and g.ends_on)>=g.target_value)
  )
 ) into completed_goal;
 if completed_goal then codes:=array_append(codes,'carbon_goal_complete'); end if;
 if exists(select 1 from public.offset_contributions where user_id=p_user_id and status in ('fulfilled','retired')) then codes:=array_append(codes,'carbon_first_offset'); end if;
 foreach badge_code in array codes loop
  execute 'insert into public.user_badges(user_id,badge_id) select $1,id from public.badges where code=$2 and not exists(select 1 from public.user_badges ub join public.badges b on b.id=ub.badge_id where ub.user_id=$1 and b.code=$2)' using p_user_id,badge_code;
 end loop;
 return codes;
end $$;

alter table public.footprint_benchmarks enable row level security;
alter table public.impact_equivalencies enable row level security;
alter table public.carbon_activity_entries enable row level security;
alter table public.carbon_goal_details enable row level security;
alter table public.carbon_goal_steps enable row level security;
alter table public.sustainability_reminder_preferences enable row level security;
alter table public.offset_projects enable row level security;
alter table public.offset_checkout_sessions enable row level security;
alter table public.offset_contributions enable row level security;
alter table public.offset_webhook_events enable row level security;

create policy "Public reviewed footprint benchmarks" on public.footprint_benchmarks for select using(active);
create policy "Public reviewed impact equivalencies" on public.impact_equivalencies for select using(active);
create policy "Users own carbon activities" on public.carbon_activity_entries for select using(auth.uid()=user_id);
create policy "Users own carbon goals" on public.carbon_goal_details for select using(auth.uid()=user_id);
create policy "Users read own carbon goal steps" on public.carbon_goal_steps for select using(exists(select 1 from public.carbon_goal_details g where g.id=goal_id and g.user_id=auth.uid()));
create policy "Users own reminder preference" on public.sustainability_reminder_preferences for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "Public reviewed offset projects" on public.offset_projects for select using(active);
create policy "Users read own checkout sessions" on public.offset_checkout_sessions for select using(auth.uid()=user_id);
create policy "Users read own offset contributions" on public.offset_contributions for select using(auth.uid()=user_id);

grant select on public.footprint_benchmarks,public.impact_equivalencies,public.offset_projects to anon,authenticated;
grant select on public.carbon_activity_entries,public.carbon_goal_details,public.carbon_goal_steps,public.offset_checkout_sessions,public.offset_contributions to authenticated;
grant select,insert,update on public.sustainability_reminder_preferences to authenticated;
grant execute on function public.log_carbon_activity(text,numeric,date,text,text,text),public.create_carbon_goal(text,text,text,numeric,text,date,date,numeric,text,jsonb),public.get_carbon_goals(),public.set_carbon_goal_step_completed(uuid,uuid,boolean),public.get_user_carbon_balance(text),public.evaluate_carbon_badges(uuid) to authenticated;

do $$ begin
 if to_regclass('public.badges') is not null then
  insert into public.badges(id,code,name,description,category) values
   (gen_random_uuid(),'carbon_first_activity','Carbon Tracker','Logged a first measured carbon activity.','habit_tracker'),
   (gen_random_uuid(),'carbon_seven_day','Seven-Day Carbon Rhythm','Logged measured activities on seven consecutive days.','habit_tracker'),
   (gen_random_uuid(),'carbon_goal_complete','Carbon Goal Achieved','Completed a measurable carbon goal.','goals_challenges'),
   (gen_random_uuid(),'carbon_first_offset','Verified Climate Contribution','Received a fulfilled or retired provider contribution.','meta')
  on conflict(code) do nothing;
 end if;
exception when undefined_column then null; end $$;
