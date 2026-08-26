\set ON_ERROR_STOP on

insert into auth.users(id, email) values
  ('00000000-0000-4000-8000-000000000001', 'map-owner@example.test'),
  ('00000000-0000-4000-8000-000000000002', 'map-other@example.test'),
  ('00000000-0000-4000-8000-000000000003', 'map-publisher@example.test')
on conflict(id) do nothing;

do $$
begin
  if (select count(*) from public.sustainability_categories) <> 7 then
    raise exception 'Expected exactly seven seeded sustainability categories';
  end if;
  if (select web_limit from public.map_runtime_config where id) <> 45000 then
    raise exception 'Unexpected default web budget';
  end if;
  if (select mobile_limit from public.map_runtime_config where id) <> 22500 then
    raise exception 'Unexpected default mobile budget';
  end if;
end
$$;

-- Public preview metadata is available without exposing the protected catalogue.
set role anon;
do $$
begin
  if jsonb_typeof(public.get_sustainability_map_preview()) <> 'object' then
    raise exception 'Anonymous preview must return an object';
  end if;
end
$$;
reset role;

-- A user can create and read their own pending submission, but another user
-- cannot see it through RLS.
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', false);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000001","app_metadata":{}}', false);
set role authenticated;
insert into public.sustainability_location_submissions(user_id, kind, proposed_data)
values (
  '00000000-0000-4000-8000-000000000001',
  'new_location',
  '{"name":"Community repair cafe","latitude":42.6977,"longitude":23.3219}'
);
do $$
begin
  if (select count(*) from public.sustainability_location_submissions) <> 1 then
    raise exception 'Owner should see their pending submission';
  end if;
end
$$;
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', false);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000002","app_metadata":{}}', false);
set role authenticated;
do $$
begin
  if (select count(*) from public.sustainability_location_submissions) <> 0 then
    raise exception 'RLS leaked another user''s pending submission';
  end if;
end
$$;
reset role;

-- Publisher-only budget configuration and exact serial reservation limits.
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000003', false);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000003","app_metadata":{"knowledge_roles":["publisher"]}}', false);
set role authenticated;
select public.set_map_runtime_config(true, 3, 2, current_date, current_date + 30, 'Budget paused for safety');

do $$
declare
  result jsonb;
begin
  result := public.reserve_map_session('web');
  if result->>'allowed' <> 'true' or (result->>'used')::integer <> 1 then raise exception 'First web reservation failed: %', result; end if;
  result := public.reserve_map_session('web');
  if result->>'allowed' <> 'true' or (result->>'used')::integer <> 2 then raise exception 'Second web reservation failed: %', result; end if;
  result := public.reserve_map_session('web');
  if result->>'allowed' <> 'true' or (result->>'used')::integer <> 3 then raise exception 'Third web reservation failed: %', result; end if;
  result := public.reserve_map_session('web');
  if result->>'allowed' <> 'false' or result->>'reason' <> 'budget' then raise exception 'Web limit was not enforced: %', result; end if;

  result := public.reserve_map_session('ios', 'installation-0000000001');
  if result->>'allowed' <> 'true' or (result->>'used')::integer <> 1 then raise exception 'First mobile reservation failed: %', result; end if;
  result := public.reserve_map_session('ios', 'installation-0000000001');
  if result->>'allowed' <> 'true' or (result->>'used')::integer <> 1 then raise exception 'Duplicate installation was counted twice: %', result; end if;
  result := public.reserve_map_session('android', 'installation-0000000002');
  if result->>'allowed' <> 'true' or (result->>'used')::integer <> 2 then raise exception 'Second mobile reservation failed: %', result; end if;
  result := public.reserve_map_session('android', 'installation-0000000003');
  if result->>'allowed' <> 'false' or result->>'reason' <> 'budget' then raise exception 'Mobile limit was not enforced: %', result; end if;

  perform public.set_map_runtime_config(false, 3, 2, current_date, current_date + 30, 'Emergency stop');
  result := public.reserve_map_session('web');
  if result->>'allowed' <> 'false' or result->>'reason' <> 'disabled' then raise exception 'Emergency switch was not enforced: %', result; end if;
end
$$;
reset role;

-- Prepare a fresh period for the parallel reservation test.
truncate table public.map_mobile_installations, public.map_usage_cycles;
update public.map_runtime_config
set interactive_map_enabled = true,
    web_limit = 25,
    mobile_limit = 25,
    billing_period_start = current_date,
    billing_period_end = current_date + 30,
    unavailable_message = 'Concurrency test budget';
