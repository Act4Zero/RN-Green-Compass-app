-- Living Ecosystem v2: selectable forest meadow, savanna and rainforest.

alter table public.ecosystem_species
  add column if not exists biome text not null default 'forest_meadow';

alter table public.ecosystem_species
  drop constraint if exists ecosystem_species_biome_check;
alter table public.ecosystem_species
  add constraint ecosystem_species_biome_check
  check (biome in ('forest_meadow', 'savanna', 'rainforest'));

alter table public.ecosystem_species
  drop constraint if exists ecosystem_species_sort_order_key;
create unique index if not exists ecosystem_species_biome_sort_idx
  on public.ecosystem_species(biome, sort_order);

alter table public.user_ecosystems
  drop constraint if exists user_ecosystems_biome_check;
alter table public.user_ecosystems
  add constraint user_ecosystems_biome_check
  check (biome in ('forest_meadow', 'savanna', 'rainforest'));

insert into public.ecosystem_species(slug, scientific_name, name_en, name_bg, unlock_at, sort_order, biome) values
  ('umbrella-thorn', 'Vachellia tortilis', 'Umbrella thorn', 'Чадъровидна акация', 0, 1, 'savanna'),
  ('african-baobab', 'Adansonia digitata', 'African baobab', 'Африкански баобаб', 96, 2, 'savanna'),
  ('marula', 'Sclerocarya birrea', 'Marula', 'Марула', 168, 3, 'savanna'),
  ('silver-cluster-leaf', 'Terminalia sericea', 'Silver cluster-leaf', 'Сребриста терминалия', 240, 4, 'savanna'),
  ('red-oat-grass', 'Themeda triandra', 'Red oat grass', 'Червена овесена трева', 312, 5, 'savanna'),
  ('elephant-grass', 'Cenchrus purpureus', 'Elephant grass', 'Слонска трева', 384, 6, 'savanna'),
  ('devils-thorn', 'Tribulus terrestris', 'Devil''s thorn', 'Бабини зъби', 456, 7, 'savanna'),
  ('african-wild-sage', 'Leonotis leonurus', 'African wild sage', 'Африканска лъвска опашка', 528, 8, 'savanna'),
  ('kapok-tree', 'Ceiba pentandra', 'Kapok tree', 'Капоково дърво', 0, 1, 'rainforest'),
  ('brazil-nut-tree', 'Bertholletia excelsa', 'Brazil nut tree', 'Бразилски орех', 96, 2, 'rainforest'),
  ('cacao-tree', 'Theobroma cacao', 'Cacao tree', 'Какаово дърво', 168, 3, 'rainforest'),
  ('rubber-tree', 'Hevea brasiliensis', 'Rubber tree', 'Каучуково дърво', 240, 4, 'rainforest'),
  ('acai-palm', 'Euterpe oleracea', 'Açaí palm', 'Асаи палма', 312, 5, 'rainforest'),
  ('lobster-claw-heliconia', 'Heliconia rostrata', 'Lobster-claw heliconia', 'Хеликония „омарова щипка“', 384, 6, 'rainforest'),
  ('vanilla-orchid', 'Vanilla planifolia', 'Vanilla orchid', 'Ванилова орхидея', 456, 7, 'rainforest'),
  ('giant-taro', 'Alocasia macrorrhizos', 'Giant taro', 'Гигантска алоказия', 528, 8, 'rainforest')
on conflict (slug) do update set
  scientific_name = excluded.scientific_name,
  name_en = excluded.name_en,
  name_bg = excluded.name_bg,
  unlock_at = excluded.unlock_at,
  sort_order = excluded.sort_order,
  biome = excluded.biome,
  active = true;

create or replace function public.select_ecosystem_biome(p_biome text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare first_species text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_biome not in ('forest_meadow', 'savanna', 'rainforest') then raise exception 'Unknown biome'; end if;

  select slug into first_species
    from public.ecosystem_species
   where biome = p_biome and active
   order by sort_order
   limit 1;
  if first_species is null then raise exception 'Biome has no active species'; end if;

  insert into public.user_ecosystems(user_id) values(auth.uid()) on conflict (user_id) do nothing;
  update public.user_ecosystems
     set biome = p_biome, active_species_slug = first_species, updated_at = now()
   where user_id = auth.uid();
  return true;
end;
$$;

create or replace function public.select_ecosystem_species(p_species_slug text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare required_growth integer;
declare species_biome text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select unlock_at, biome into required_growth, species_biome
    from public.ecosystem_species
   where slug = p_species_slug and active;
  if required_growth is null then raise exception 'Unknown species'; end if;
  insert into public.user_ecosystems(user_id) values(auth.uid()) on conflict (user_id) do nothing;
  if (select growth_units from public.user_ecosystems where user_id = auth.uid()) < required_growth then return false; end if;
  update public.user_ecosystems
     set biome = species_biome, active_species_slug = p_species_slug, updated_at = now()
   where user_id = auth.uid();
  return true;
end;
$$;

revoke all on function public.select_ecosystem_biome(text) from public;
grant execute on function public.select_ecosystem_biome(text) to authenticated;
