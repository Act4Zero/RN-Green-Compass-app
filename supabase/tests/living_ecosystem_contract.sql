begin;

select plan(16);
select has_table('public', 'ecosystem_species');
select has_table('public', 'user_ecosystems');
select has_table('public', 'ecosystem_growth_events');
select has_function('public', 'record_ecosystem_growth', array['uuid']);
select has_function('public', 'get_my_ecosystem', array[]::text[]);
select has_function('public', 'select_ecosystem_species', array['text']);
select has_function('public', 'select_ecosystem_biome', array['text']);
select col_is_pk('public', 'user_ecosystems', 'user_id');
select col_has_check('public', 'user_ecosystems', 'growth_units');
select policies_are('public', 'user_ecosystems', array['Users read own ecosystem']);
select policies_are('public', 'ecosystem_growth_events', array['Users read own ecosystem growth']);
select policies_are('public', 'ecosystem_species', array['Active ecosystem species are public']);
select results_eq('select count(*)::bigint from public.ecosystem_species where active', array[24::bigint]);
select results_eq('select count(distinct biome)::bigint from public.ecosystem_species where active', array[3::bigint]);
select results_eq($$select count(*)::bigint from public.feature_flags where key = 'living_ecosystem_v1'$$, array[1::bigint]);
select results_eq($$select count(*)::bigint from public.ecosystem_growth_events$$, array[0::bigint]);

select * from finish();
rollback;
