-- Living Planet public read surface and PMTiles delivery.
-- Legacy budget objects are intentionally retained for one rollback release.

create or replace function public.get_public_sustainability_map(
  p_west double precision default null,
  p_south double precision default null,
  p_east double precision default null,
  p_north double precision default null,
  p_categories text[] default null,
  p_query text default null,
  p_limit integer default 2000
)
returns table(
  id uuid,name text,name_bg text,description_en text,description_bg text,
  town text,state_or_province text,address_line_1 text,address_line_2 text,
  postcode text,country text,latitude double precision,longitude double precision,
  website text,opening_hours jsonb,sustainability_features jsonb,
  source text,licence text,source_url text,verified boolean,featured boolean,
  published_at timestamptz,category_ids text[],connectors jsonb,credentials jsonb,
  rating numeric,review_count bigint
)
language sql stable security definer
set search_path=public,extensions,pg_temp
as $$
  select
    l.id,l.name,l.name_bg,l.description_en,l.description_bg,
    l.town,l.state_or_province,l.address_line_1,l.address_line_2,
    l.postcode,l.country,l.latitude,l.longitude,l.website,l.opening_hours,
    l.sustainability_features,l.source,l.licence,l.source_url,l.verified,
    l.featured,l.published_at,
    array(select lc.category_id from public.sustainability_location_categories lc where lc.location_id=l.id order by lc.category_id),
    coalesce((select jsonb_agg(jsonb_build_object(
      'id',c.id,'connectionType',c.connection_type,'powerKw',c.power_kw,
      'level',c.level,'usageCost',c.usage_cost,'fastCharge',c.fast_charge
    ) order by c.power_kw desc nulls last) from public.sustainability_connectors c where c.location_id=l.id),'[]'::jsonb),
    coalesce((select jsonb_agg(jsonb_build_object(
      'id',cr.id,'type',cr.credential_type,'issuer',cr.issuer,
      'evidenceUrl',cr.evidence_url,'validFrom',cr.valid_from,'validUntil',cr.valid_until
    ) order by cr.verified_at desc) from public.sustainability_credentials cr
      where cr.location_id=l.id and cr.status='verified'),'[]'::jsonb),
    (select round(avg(r.rating)::numeric,2) from public.sustainability_reviews r where r.location_id=l.id and r.status='approved'),
    (select count(*) from public.sustainability_reviews r where r.location_id=l.id and r.status='approved')
  from public.sustainability_locations l
  where l.status='published'
    and (coalesce(array_length(p_categories,1),0)=0 or exists(
      select 1 from public.sustainability_location_categories lc
      where lc.location_id=l.id and lc.category_id=any(p_categories)
    ))
    and (coalesce(trim(p_query),'')<>'' or p_west is null or extensions.st_intersects(
      l.geo,extensions.st_makeenvelope(p_west,p_south,p_east,p_north,4326)::extensions.geography
    ))
    and (coalesce(trim(p_query),'')='' or extensions.unaccent(concat_ws(
      ' ',l.name,l.name_bg,l.town,l.address_line_1,l.address_line_2,l.postcode
    )) ilike '%'||extensions.unaccent(trim(p_query))||'%')
  order by l.featured desc,l.verified desc,l.name
  limit least(greatest(p_limit,1),2000)
$$;

create or replace function public.get_public_sustainability_reviews(
  p_location_id uuid,
  p_limit integer default 50
)
returns table(id uuid,location_id uuid,rating integer,body text,status text,author_name text,created_at timestamptz)
language sql stable security definer
set search_path=public,pg_temp
as $$
  select r.id,r.location_id,r.rating,r.body,r.status,p.display_name,r.created_at
  from public.sustainability_reviews r
  left join public.profiles p on p.id=r.user_id
  join public.sustainability_locations l on l.id=r.location_id and l.status='published'
  where r.location_id=p_location_id and r.status='approved'
  order by r.created_at desc
  limit least(greatest(p_limit,1),50)
$$;

revoke all on function public.get_public_sustainability_map(double precision,double precision,double precision,double precision,text[],text,integer) from public;
revoke all on function public.get_public_sustainability_reviews(uuid,integer) from public;
grant execute on function public.get_public_sustainability_map(double precision,double precision,double precision,double precision,text[],text,integer) to anon,authenticated;
grant execute on function public.get_public_sustainability_reviews(uuid,integer) to anon,authenticated;

drop policy if exists "Anonymous approved reviews" on public.sustainability_reviews;
create policy "Anonymous approved reviews" on public.sustainability_reviews
  for select to anon using(status='approved');
grant select(id,location_id,rating,body,status,created_at) on public.sustainability_reviews to anon;

-- Prevent client invocation while the old objects remain available for rollback.
revoke all on function public.reserve_map_session(text,text) from public,anon,authenticated;
revoke all on function public.get_map_budget_status() from public,anon,authenticated;
revoke all on function public.set_map_runtime_config(boolean,integer,integer,date,date,text) from public,anon,authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('sustainability-offline-maps','sustainability-offline-maps',true,2147483648,array['application/octet-stream','application/json'])
on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "Public reads sustainability offline maps" on storage.objects;
create policy "Public reads sustainability offline maps" on storage.objects
  for select to anon,authenticated
  using(bucket_id='sustainability-offline-maps');

comment on function public.get_public_sustainability_map is
  'Anonymous-safe published place catalogue. Contact data, moderation fields, check-ins and user data are excluded.';
