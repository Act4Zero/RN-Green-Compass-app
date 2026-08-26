-- Habit-based carbon offsetting MVP: reviewed catalogs, owner-scoped state,
-- deterministic daily assignments, idempotent rewards, and impact summaries.
create extension if not exists pgcrypto;

create table if not exists public.emission_factors (
  code text not null,
  version text not null,
  label text not null,
  unit text not null,
  kg_co2e_per_unit numeric not null check (kg_co2e_per_unit >= 0),
  methodology text not null,
  source_label text not null,
  source_url text not null check (source_url like 'https://%'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (code, version)
);

create table if not exists public.daily_eco_challenges (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  description text not null,
  category text not null check (category in ('plastic','food','energy','mobility','water','reuse')),
  difficulty text not null check (difficulty in ('beginner','intermediate','advanced')),
  impact jsonb not null default '{}'::jsonb,
  knowledge_slug text not null,
  points integer not null default 5 check (points between 0 and 25),
  active boolean not null default true,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.sustainability_polls (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  question text not null,
  active boolean not null default true,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.sustainability_poll_options (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  poll_id text not null references public.sustainability_polls(id) on delete cascade,
  label text not null,
  sort_order integer not null default 0,
  unique (poll_id, id)
);

create table if not exists public.user_green_identities (
  user_id uuid primary key references auth.users(id) on delete cascade,
  assessment_version text not null,
  answers jsonb not null,
  identity_score integer not null check (identity_score between 0 and 100),
  identity_tier text not null check (identity_tier in ('eco_explorer','green_builder','impact_leader')),
  annual_baseline_kg_co2e numeric not null check (annual_baseline_kg_co2e >= 0),
  category_scores jsonb not null,
  category_footprint_kg_co2e jsonb not null,
  completed_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_daily_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id text not null references public.daily_eco_challenges(id),
  challenge_date date not null,
  completed_at timestamptz,
  completion_event_id uuid,
  created_at timestamptz not null default now(),
  unique (user_id, challenge_date),
  unique (completion_event_id)
);

create table if not exists public.user_daily_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reflection_date date not null,
  did_sustainable_action boolean,
  action_note text not null default '' check (char_length(action_note) <= 1000),
  gratitude_note text not null default '' check (char_length(gratitude_note) <= 1000),
  journal_note text not null default '' check (char_length(journal_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, reflection_date)
);

create table if not exists public.user_sustainability_poll_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  poll_id text not null references public.sustainability_polls(id),
  option_id text not null references public.sustainability_poll_options(id),
  response_date date not null,
  responded_at timestamptz not null default now(),
  unique (user_id, response_date)
);

create table if not exists public.travel_footprint_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  occurred_on date not null default current_date,
  distance_km numeric not null check (distance_km > 0),
  total_distance_km numeric not null check (total_distance_km > 0),
  round_trip boolean not null default false,
  car_occupancy integer not null default 1 check (car_occupancy between 1 and 9),
  selected_mode text not null check (selected_mode in ('plane','train','bus','boat','car')),
  comparison_mode text not null check (comparison_mode in ('plane','train','bus','boat','car')),
  emissions_kg_co2e numeric not null check (emissions_kg_co2e >= 0),
  comparison_emissions_kg_co2e numeric not null check (comparison_emissions_kg_co2e >= 0),
  avoided_kg_co2e numeric not null default 0 check (avoided_kg_co2e >= 0),
  factor_version text not null,
  created_at timestamptz not null default now()
);

insert into public.emission_factors(code, version, label, unit, kg_co2e_per_unit, methodology, source_label, source_url) values
  ('plane','DESNZ-2026-JULY-v1','Short-haul average passenger','passenger.km',0.15072,'Direct with radiative forcing (0.12786) plus well-to-tank (0.02286).','UK Government GHG Conversion Factors 2026','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026'),
  ('train','DESNZ-2026-JULY-v1','National rail','passenger.km',0.03989,'Direct (0.03092) plus well-to-tank (0.00897).','UK Government GHG Conversion Factors 2026','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026'),
  ('bus','DESNZ-2026-JULY-v1','Average local bus','passenger.km',0.12800,'Direct (0.10151) plus well-to-tank (0.02649).','UK Government GHG Conversion Factors 2026','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026'),
  ('boat','DESNZ-2026-JULY-v1','Average ferry passenger','passenger.km',0.13825,'Direct (0.11270) plus well-to-tank (0.02555).','UK Government GHG Conversion Factors 2026','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026'),
  ('car','DESNZ-2026-JULY-v1','Average car, unknown fuel','vehicle.km',0.20990,'Direct (0.16591) plus well-to-tank (0.04399), divided by entered occupancy in the app.','UK Government GHG Conversion Factors 2026','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026'),
  ('electricity-uk','DESNZ-2026-JULY-v1','UK grid electricity','kWh',0.18436,'Generation (0.13096), transmission and distribution (0.01299), and both well-to-tank components (0.03682 + 0.00359).','UK Government GHG Conversion Factors 2026','https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026')
on conflict (code, version) do update set unit = excluded.unit, kg_co2e_per_unit = excluded.kg_co2e_per_unit, methodology = excluded.methodology, source_url = excluded.source_url;

insert into public.daily_eco_challenges(id, slug, title, description, category, difficulty, impact, knowledge_slug) values
('plastic-beginner-1','plastic-beginner-1','Carry a reusable bottle','Skip one single-use drink bottle today.','plastic','beginner','{"plasticItemsAvoided":1}','zero-waste-starter-guide'),
('plastic-beginner-2','plastic-beginner-2','Refuse one plastic bag','Bring a reusable bag for one purchase.','plastic','beginner','{"plasticItemsAvoided":1}','zero-waste-starter-guide'),
('plastic-intermediate-1','plastic-intermediate-1','Pack a plastic-free lunch','Avoid disposable wrap, cutlery, and bottles for one meal.','plastic','intermediate','{"plasticItemsAvoided":4}','zero-waste-starter-guide'),
('plastic-intermediate-2','plastic-intermediate-2','Audit your bathroom plastics','Identify one packaged product to replace when it runs out.','plastic','intermediate','{"plasticItemsAvoided":1}','zero-waste-starter-guide'),
('plastic-advanced-1','plastic-advanced-1','Choose a refill purchase','Buy one staple from a refill or package-free source.','plastic','advanced','{"plasticItemsAvoided":3}','zero-waste-starter-guide'),
('food-beginner-1','food-beginner-1','Plan one plant-forward meal','Make one meal today centered on plants.','food','beginner','{"co2eKgAvoided":0.8}','sustainable-food-starter-guide'),
('food-beginner-2','food-beginner-2','Save one serving','Store or freeze one serving before it becomes waste.','food','beginner','{"wasteKgAvoided":0.25}','sustainable-food-starter-guide'),
('food-intermediate-1','food-intermediate-1','Use the eat-first shelf','Build a meal around food that needs using soon.','food','intermediate','{"wasteKgAvoided":0.4}','sustainable-food-starter-guide'),
('food-intermediate-2','food-intermediate-2','Choose seasonal produce','Pick one locally seasonal fruit or vegetable.','food','intermediate','{"co2eKgAvoided":0.3}','sustainable-food-starter-guide'),
('food-advanced-1','food-advanced-1','Run a zero-waste dinner','Use scraps and leftovers so the meal creates no edible waste.','food','advanced','{"wasteKgAvoided":0.7}','sustainable-food-starter-guide'),
('energy-beginner-1','energy-beginner-1','Switch off standby power','Unplug one unused device or use a switched power strip.','energy','beginner','{"co2eKgAvoided":0.1}','clean-energy-starter-guide'),
('energy-beginner-2','energy-beginner-2','Use daylight first','Keep lights off for one daylight hour.','energy','beginner','{"co2eKgAvoided":0.05}','clean-energy-starter-guide'),
('energy-intermediate-1','energy-intermediate-1','Lower heating or cooling','Adjust the thermostat by one degree for today.','energy','intermediate','{"co2eKgAvoided":0.6}','clean-energy-starter-guide'),
('energy-intermediate-2','energy-intermediate-2','Wash clothes cooler','Run one suitable load at 30°C or cold.','energy','intermediate','{"co2eKgAvoided":0.4}','clean-energy-starter-guide'),
('energy-advanced-1','energy-advanced-1','Measure an energy hotspot','Use a meter or bill data to find your highest avoidable load.','energy','advanced','{"co2eKgAvoided":0.5}','clean-energy-starter-guide'),
('mobility-beginner-1','mobility-beginner-1','Walk one short trip','Replace one short car trip with walking.','mobility','beginner','{"co2eKgAvoided":0.5}','green-transportation-starter-guide'),
('mobility-beginner-2','mobility-beginner-2','Combine two errands','Plan one route that avoids a separate journey.','mobility','beginner','{"co2eKgAvoided":0.7}','green-transportation-starter-guide'),
('mobility-intermediate-1','mobility-intermediate-1','Use public transport today','Replace one suitable car journey with bus or train.','mobility','intermediate','{"co2eKgAvoided":1.2}','green-transportation-starter-guide'),
('mobility-intermediate-2','mobility-intermediate-2','Share a car journey','Ride with another person instead of taking two cars.','mobility','intermediate','{"co2eKgAvoided":1}','green-transportation-starter-guide'),
('mobility-advanced-1','mobility-advanced-1','Plan a low-carbon route','Compare modes and choose the lowest practical option for a future trip.','mobility','advanced','{"co2eKgAvoided":2}','green-transportation-starter-guide'),
('water-beginner-1','water-beginner-1','Take a shorter shower','Reduce one shower by two minutes.','water','beginner','{"waterLitresSaved":20}','water-conservation-starter-guide'),
('water-beginner-2','water-beginner-2','Turn off the tap','Keep the tap off while brushing your teeth.','water','beginner','{"waterLitresSaved":8}','water-conservation-starter-guide'),
('water-intermediate-1','water-intermediate-1','Run only a full load','Wait for a full dishwasher or laundry load.','water','intermediate','{"waterLitresSaved":15}','water-conservation-starter-guide'),
('water-intermediate-2','water-intermediate-2','Reuse rinse water','Reuse safe rinse water for plants or cleaning.','water','intermediate','{"waterLitresSaved":5}','water-conservation-starter-guide'),
('water-advanced-1','water-advanced-1','Check for a silent leak','Inspect a toilet or tap and arrange a fix if needed.','water','advanced','{"waterLitresSaved":30}','water-conservation-starter-guide'),
('reuse-beginner-1','reuse-beginner-1','Repair before replacing','Spend ten minutes assessing or fixing one item.','reuse','beginner','{"wasteKgAvoided":0.2}','ethical-fashion-starter-guide'),
('reuse-beginner-2','reuse-beginner-2','Use what you already own','Borrow or reuse instead of buying one new item.','reuse','beginner','{"wasteKgAvoided":0.3}','ethical-fashion-starter-guide'),
('reuse-intermediate-1','reuse-intermediate-1','List one item for reuse','Donate, swap, or sell one useful item.','reuse','intermediate','{"wasteKgAvoided":0.8}','ethical-fashion-starter-guide'),
('reuse-intermediate-2','reuse-intermediate-2','Choose second-hand first','Search second-hand before one planned purchase.','reuse','intermediate','{"wasteKgAvoided":0.5}','ethical-fashion-starter-guide'),
('reuse-advanced-1','reuse-advanced-1','Host a mini swap','Invite someone to exchange an item, book, or tool.','reuse','advanced','{"wasteKgAvoided":1.5}','ethical-fashion-starter-guide')
on conflict (id) do update set title = excluded.title, description = excluded.description, impact = excluded.impact, reviewed_at = now();

insert into public.sustainability_polls(id, slug, question) values
('poll-hardest-habit','hardest-habit','Which habit feels hardest to change right now?'),
('poll-next-focus','next-focus','Where would one small change feel most achievable?'),
('poll-motivation','motivation','What keeps you motivated to act sustainably?'),
('poll-learning','learning','How do you prefer to learn a new sustainable habit?'),
('poll-progress','progress','Which progress signal is most useful to you?'),
('poll-transport','transport','Which lower-impact travel option could you use more?'),
('poll-gratitude','gratitude','Which part of nature lifted your day?')
on conflict (id) do update set question = excluded.question, reviewed_at = now();

insert into public.sustainability_poll_options(id, poll_id, label, sort_order) values
('hardest-travel','poll-hardest-habit','Travel',1),('hardest-food','poll-hardest-habit','Food',2),('hardest-energy','poll-hardest-habit','Home energy',3),('hardest-waste','poll-hardest-habit','Waste',4),
('focus-plastic','poll-next-focus','Less plastic',1),('focus-water','poll-next-focus','Save water',2),('focus-reuse','poll-next-focus','Reuse more',3),('focus-mobility','poll-next-focus','Greener travel',4),
('motivation-nature','poll-motivation','Protecting nature',1),('motivation-health','poll-motivation','Health',2),('motivation-saving','poll-motivation','Saving money',3),('motivation-community','poll-motivation','Community',4),
('learning-tip','poll-learning','Quick tip',1),('learning-guide','poll-learning','Step-by-step guide',2),('learning-quiz','poll-learning','Quiz',3),('learning-challenge','poll-learning','Try a challenge',4),
('progress-co2e','poll-progress','CO₂e avoided',1),('progress-streak','poll-progress','Streak',2),('progress-actions','poll-progress','Actions completed',3),('progress-community','poll-progress','Community impact',4),
('transport-walk','poll-transport','Walking',1),('transport-bike','poll-transport','Cycling',2),('transport-bus','poll-transport','Bus',3),('transport-train','poll-transport','Train',4),
('gratitude-air','poll-gratitude','Fresh air',1),('gratitude-green','poll-gratitude','Green space',2),('gratitude-water','poll-gratitude','Water',3),('gratitude-wildlife','poll-gratitude','Wildlife',4)
on conflict (id) do update set label = excluded.label, sort_order = excluded.sort_order;

create or replace function public.assign_daily_eco_challenge(p_local_date date, p_interests text[] default '{}', p_learning_stage text default 'beginner')
returns jsonb language plpgsql security definer set search_path = public as $$
declare assignment public.user_daily_challenges; chosen public.daily_eco_challenges; allowed text[]; preferred text[];
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_local_date < current_date - 1 or p_local_date > current_date + 1 then raise exception 'Invalid local date'; end if;
  allowed := case p_learning_stage when 'advanced' then array['beginner','intermediate','advanced'] when 'intermediate' then array['beginner','intermediate'] else array['beginner'] end;
  preferred := array_remove(array[
    case when p_interests && array['Zero Waste','Ethical Fashion'] then 'reuse' end,
    case when p_interests && array['Zero Waste'] then 'plastic' end,
    case when p_interests && array['Clean Energy','Sustainable Building'] then 'energy' end,
    case when p_interests && array['Sustainable Food','Permaculture'] then 'food' end,
    case when p_interests && array['Green Transportation','Climate Action'] then 'mobility' end,
    case when p_interests && array['Water Conservation','Conservation'] then 'water' end
  ], null);
  select * into assignment from public.user_daily_challenges where user_id = auth.uid() and challenge_date = p_local_date;
  if assignment.id is null then
    select * into chosen from public.daily_eco_challenges
     where active and difficulty = any(allowed) and (cardinality(preferred) = 0 or category = any(preferred))
     order by md5(auth.uid()::text || p_local_date::text || id) limit 1;
    if chosen.id is null then select * into chosen from public.daily_eco_challenges where active and difficulty = any(allowed) order by md5(auth.uid()::text || p_local_date::text || id) limit 1; end if;
    insert into public.user_daily_challenges(user_id, challenge_id, challenge_date) values(auth.uid(), chosen.id, p_local_date) returning * into assignment;
  else select * into chosen from public.daily_eco_challenges where id = assignment.challenge_id; end if;
  return jsonb_build_object('assignment_id', assignment.id, 'challenge_date', assignment.challenge_date, 'completed_at', assignment.completed_at, 'challenge', to_jsonb(chosen));
end $$;

create or replace function public.complete_daily_eco_challenge(p_challenge_id text, p_challenge_date date, p_event_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare assignment public.user_daily_challenges; challenge public.daily_eco_challenges;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into assignment from public.user_daily_challenges where user_id = auth.uid() and challenge_date = p_challenge_date for update;
  if assignment.id is null or assignment.challenge_id <> p_challenge_id then raise exception 'Challenge assignment not found'; end if;
  if assignment.completed_at is null then
    update public.user_daily_challenges set completed_at = now(), completion_event_id = p_event_id where id = assignment.id returning * into assignment;
    select * into challenge from public.daily_eco_challenges where id = p_challenge_id;
    if to_regclass('public.user_points') is not null then
      execute 'insert into public.user_points(user_id, source, points, reference_id, created_at)
        select $1, ''daily_challenge'', $2, $3, now()
        where not exists (select 1 from public.user_points where user_id = $1 and source = ''daily_challenge'' and reference_id = $3)'
        using auth.uid(), challenge.points, assignment.id::text;
    end if;
  end if;
  return jsonb_build_object('id', assignment.id, 'completed_at', assignment.completed_at);
end $$;

create or replace function public.get_daily_sustainability_poll(p_local_date date)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare chosen public.sustainability_polls; selected text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into chosen from public.sustainability_polls where active order by md5(auth.uid()::text || p_local_date::text || id) limit 1;
  select option_id into selected from public.user_sustainability_poll_responses where user_id = auth.uid() and poll_id = chosen.id and response_date = p_local_date;
  return jsonb_build_object('id', chosen.id, 'slug', chosen.slug, 'question', chosen.question, 'selected_option_id', selected,
    'options', (select jsonb_agg(jsonb_build_object('id', o.id, 'label', o.label, 'count', (select count(*) from public.user_sustainability_poll_responses r where r.option_id = o.id)) order by o.sort_order) from public.sustainability_poll_options o where o.poll_id = chosen.id));
end $$;

create or replace function public.respond_to_sustainability_poll(p_poll_id text, p_option_id text, p_local_date date)
returns jsonb language plpgsql security definer set search_path = public as $$
declare expected_poll_id text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_local_date < current_date - 1 or p_local_date > current_date + 1 then raise exception 'Invalid local date'; end if;
  select id into expected_poll_id from public.sustainability_polls where active order by md5(auth.uid()::text || p_local_date::text || id) limit 1;
  if expected_poll_id is distinct from p_poll_id then raise exception 'Poll is not assigned for this date'; end if;
  if not exists(select 1 from public.sustainability_poll_options where id = p_option_id and poll_id = p_poll_id) then raise exception 'Invalid poll option'; end if;
  insert into public.user_sustainability_poll_responses(user_id, poll_id, option_id, response_date) values(auth.uid(), p_poll_id, p_option_id, p_local_date)
  on conflict (user_id, response_date) do update set poll_id = excluded.poll_id, option_id = excluded.option_id, responded_at = now();
  return (select jsonb_agg(jsonb_build_object('id', o.id, 'label', o.label, 'count', (select count(*) from public.user_sustainability_poll_responses r where r.option_id = o.id)) order by o.sort_order) from public.sustainability_poll_options o where o.poll_id = p_poll_id);
end $$;

create or replace function public.get_user_offsetting_impact(p_period text default 'week')
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare start_date date; habit_co2 numeric; travel_co2 numeric; challenge_co2 numeric; plastic_items numeric; waste_kg numeric; water_litres numeric; action_count integer; completed_dates date[]; streak integer := 0; cursor_date date;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  start_date := case p_period when 'day' then current_date when 'month' then current_date - 29 else current_date - 6 end;
  select coalesce(sum(co2_saving),0), count(*) into habit_co2, action_count from public.habit_logs where user_id = auth.uid() and completed and log_date::date >= start_date;
  select coalesce(sum(avoided_kg_co2e),0) into travel_co2 from public.travel_footprint_entries where user_id = auth.uid() and occurred_on >= start_date;
  select coalesce(sum((c.impact->>'co2eKgAvoided')::numeric),0), coalesce(sum((c.impact->>'plasticItemsAvoided')::numeric),0), coalesce(sum((c.impact->>'wasteKgAvoided')::numeric),0), coalesce(sum((c.impact->>'waterLitresSaved')::numeric),0)
    into challenge_co2, plastic_items, waste_kg, water_litres
    from public.user_daily_challenges u join public.daily_eco_challenges c on c.id = u.challenge_id
   where u.user_id = auth.uid() and u.completed_at is not null and u.challenge_date >= start_date;
  select array_agg(challenge_date order by challenge_date desc) into completed_dates from public.user_daily_challenges where user_id = auth.uid() and completed_at is not null;
  cursor_date := current_date;
  if not (cursor_date = any(coalesce(completed_dates,'{}'))) then cursor_date := cursor_date - 1; end if;
  while cursor_date = any(coalesce(completed_dates,'{}')) loop streak := streak + 1; cursor_date := cursor_date - 1; end loop;
  return jsonb_build_object('period', p_period, 'metrics', jsonb_build_object('co2eKgAvoided', round((habit_co2 + travel_co2 + challenge_co2)::numeric,2), 'plasticItemsAvoided', plastic_items, 'wasteKgAvoided', round(waste_kg,2), 'waterLitresSaved', round(water_litres,1)), 'totalActions', action_count + (select count(*) from public.user_daily_challenges where user_id = auth.uid() and completed_at is not null and challenge_date >= start_date) + (select count(*) from public.travel_footprint_entries where user_id = auth.uid() and occurred_on >= start_date), 'challengeStreak', streak,
    'byCategory', coalesce((select jsonb_object_agg(category, metrics) from (select c.category, jsonb_build_object('co2eKgAvoided', coalesce(sum((c.impact->>'co2eKgAvoided')::numeric),0), 'plasticItemsAvoided', coalesce(sum((c.impact->>'plasticItemsAvoided')::numeric),0), 'wasteKgAvoided', coalesce(sum((c.impact->>'wasteKgAvoided')::numeric),0), 'waterLitresSaved', coalesce(sum((c.impact->>'waterLitresSaved')::numeric),0)) metrics from public.user_daily_challenges u join public.daily_eco_challenges c on c.id = u.challenge_id where u.user_id = auth.uid() and u.completed_at is not null and u.challenge_date >= start_date group by c.category) category_metrics),'{}'::jsonb),
    'series', coalesce((select jsonb_agg(jsonb_build_object('date', day::date, 'co2eKgAvoided', coalesce(daily.co2,0), 'actions', coalesce(daily.actions,0)) order by day) from generate_series(start_date::timestamp,current_date::timestamp,'1 day') day left join (select log_date::date d, sum(co2_saving) co2, count(*) actions from public.habit_logs where user_id = auth.uid() and completed and log_date::date >= start_date group by 1) daily on daily.d = day::date),'[]'::jsonb));
end $$;

alter table public.emission_factors enable row level security;
alter table public.daily_eco_challenges enable row level security;
alter table public.sustainability_polls enable row level security;
alter table public.sustainability_poll_options enable row level security;
alter table public.user_green_identities enable row level security;
alter table public.user_daily_challenges enable row level security;
alter table public.user_daily_reflections enable row level security;
alter table public.user_sustainability_poll_responses enable row level security;
alter table public.travel_footprint_entries enable row level security;

create policy "Public active emission factors" on public.emission_factors for select using (active);
create policy "Public active eco challenges" on public.daily_eco_challenges for select using (active);
create policy "Public active sustainability polls" on public.sustainability_polls for select using (active);
create policy "Public sustainability poll options" on public.sustainability_poll_options for select using (exists(select 1 from public.sustainability_polls p where p.id = poll_id and p.active));
create policy "Users own green identity" on public.user_green_identities for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users read own daily challenges" on public.user_daily_challenges for select using (auth.uid() = user_id);
create policy "Users own reflections" on public.user_daily_reflections for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users read own poll response" on public.user_sustainability_poll_responses for select using (auth.uid() = user_id);
create policy "Users own travel entries" on public.travel_footprint_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select on public.emission_factors, public.daily_eco_challenges, public.sustainability_polls, public.sustainability_poll_options to anon, authenticated;
grant select, insert, update on public.user_green_identities, public.user_daily_reflections, public.travel_footprint_entries to authenticated;
grant select on public.user_daily_challenges, public.user_sustainability_poll_responses to authenticated;
grant execute on function public.assign_daily_eco_challenge(date,text[],text), public.complete_daily_eco_challenge(text,date,uuid), public.get_daily_sustainability_poll(date), public.respond_to_sustainability_poll(text,text,date), public.get_user_offsetting_impact(text) to authenticated;
