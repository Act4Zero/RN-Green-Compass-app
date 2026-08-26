-- Sustainability Marketplace v1. Independent from the Sustainability Map.
-- Public bilingual catalog, verified evidence, owner-scoped commerce, Stripe
-- Connect order boundaries and conservative purchase-impact accounting.

create extension if not exists pgcrypto;
create extension if not exists unaccent;

create table if not exists public.marketplace_businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) between 2 and 160),
  legal_name text not null,
  summary_en text not null default '', summary_bg text not null default '',
  story_en text not null default '', story_bg text not null default '',
  logo_url text check (logo_url is null or logo_url ~ '^https://'),
  website_url text check (website_url is null or website_url ~ '^https://'),
  support_email text not null,
  verification_status text not null default 'pending' check (verification_status in ('pending','in_review','verified','suspended','rejected')),
  sustainability_rating numeric(3,2) not null default 0 check (sustainability_rating between 0 and 5),
  shipping_fee_cents integer not null default 0 check (shipping_fee_cents >= 0),
  free_shipping_threshold_cents integer check (free_shipping_threshold_cents is null or free_shipping_threshold_cents >= 0),
  platform_fee_bps integer not null default 0 check (platform_fee_bps between 0 and 10000),
  seller_terms_url text check (seller_terms_url is null or seller_terms_url ~ '^https://'),
  return_policy_url text check (return_policy_url is null or return_policy_url ~ '^https://'),
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_business_payment_accounts (
  business_id uuid primary key references public.marketplace_businesses(id) on delete cascade,
  stripe_account_id text not null unique,
  onboarding_complete boolean not null default false,
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_categories (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  name_en text not null, name_bg text not null, description_en text not null default '', description_bg text not null default '',
  icon text not null default 'leaf-outline', active boolean not null default true, sort_order integer not null default 0
);

create table if not exists public.marketplace_certifications (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null, issuer text not null,
  description_en text not null default '', description_bg text not null default '', canonical_url text not null check (canonical_url ~ '^https://'), active boolean not null default true
);

create table if not exists public.marketplace_business_certifications (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.marketplace_businesses(id) on delete cascade,
  certification_id uuid not null references public.marketplace_certifications(id), evidence_url text not null check (evidence_url ~ '^https://'),
  status text not null default 'pending' check (status in ('pending','verified','rejected','expired')),
  valid_from date, valid_until date, verified_by uuid references auth.users(id), verified_at timestamptz,
  unique(business_id,certification_id)
);

create table if not exists public.marketplace_products (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.marketplace_businesses(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'), product_type text not null default 'product' check (product_type in ('product','bundle')),
  status text not null default 'draft' check (status in ('draft','in_review','published','archived')),
  name_en text not null, name_bg text not null, summary_en text not null, summary_bg text not null,
  description_en text not null default '', description_bg text not null default '', materials_en text not null default '', materials_bg text not null default '',
  care_instructions_en text not null default '', care_instructions_bg text not null default '', included_items jsonb not null default '[]'::jsonb check (jsonb_typeof(included_items)='array'),
  image_url text check (image_url is null or image_url ~ '^https://'), image_alt_en text not null default '', image_alt_bg text not null default '', media_rights jsonb not null default '{}'::jsonb,
  price_cents integer not null check (price_cents >= 0), compare_at_price_cents integer check (compare_at_price_cents is null or compare_at_price_cents >= price_cents), currency text not null default 'EUR' check (currency='EUR'),
  stock_quantity integer not null default 0 check (stock_quantity >= 0), sustainability_rating numeric(3,2) not null default 0 check (sustainability_rating between 0 and 5),
  popularity_score numeric not null default 0, featured boolean not null default false, published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_product_categories (
  product_id uuid not null references public.marketplace_products(id) on delete cascade,
  category_id uuid not null references public.marketplace_categories(id), primary key(product_id,category_id)
);

create table if not exists public.marketplace_product_certifications (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.marketplace_products(id) on delete cascade,
  certification_id uuid not null references public.marketplace_certifications(id), evidence_url text not null check (evidence_url ~ '^https://'),
  status text not null default 'pending' check (status in ('pending','verified','rejected','expired')),
  valid_from date, valid_until date, verified_by uuid references auth.users(id), verified_at timestamptz,
  unique(product_id,certification_id)
);

create table if not exists public.marketplace_product_sustainability_evidence (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.marketplace_products(id) on delete cascade,
  dimension text not null check (dimension in ('materials','production','packaging','durability','logistics')),
  score numeric(3,2) not null check (score between 0 and 5), summary_en text not null, summary_bg text not null,
  evidence_url text not null check (evidence_url ~ '^https://'), reviewed_by uuid references auth.users(id), reviewed_at timestamptz,
  unique(product_id,dimension)
);

create table if not exists public.marketplace_deals (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.marketplace_products(id) on delete cascade,
  title_en text not null, title_bg text not null, discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value integer not null check (discount_value > 0), starts_at timestamptz not null, ends_at timestamptz not null check (ends_at > starts_at),
  active boolean not null default true, created_at timestamptz not null default now()
);

create table if not exists public.marketplace_impact_factors (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.marketplace_products(id) on delete cascade,
  metric text not null check (metric in ('co2e_kg','waste_kg','plastic_items','water_l')), value numeric not null check (value >= 0), unit text not null,
  label_en text not null, label_bg text not null, methodology_version text not null, source_url text not null check (source_url ~ '^https://'),
  assumptions_en text not null, assumptions_bg text not null, reviewed_at date not null, published boolean not null default false,
  unique(product_id,metric,methodology_version)
);

create table if not exists public.marketplace_reviews (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.marketplace_products(id) on delete cascade, rating integer not null check (rating between 1 and 5), body text not null check (length(body) between 20 and 2000),
  status text not null default 'pending' check (status in ('pending','approved','rejected','hidden')), verified_purchase boolean not null default false,
  reviewer_id uuid references auth.users(id), reviewer_notes text, reviewed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(user_id,product_id)
);

create table if not exists public.marketplace_wishlist_items (
  user_id uuid not null references auth.users(id) on delete cascade, product_id uuid not null references public.marketplace_products(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(user_id,product_id)
);

create table if not exists public.marketplace_carts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade,
  business_id uuid references public.marketplace_businesses(id), updated_at timestamptz not null default now(), created_at timestamptz not null default now()
);

create table if not exists public.marketplace_cart_items (
  id uuid primary key default gen_random_uuid(), cart_id uuid not null references public.marketplace_carts(id) on delete cascade,
  product_id uuid not null references public.marketplace_products(id), quantity integer not null check (quantity between 1 and 20),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(cart_id,product_id)
);

create sequence if not exists public.marketplace_order_number_seq start 1000;
create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(), order_number text not null unique default ('GC-'||to_char(now(),'YYYY')||'-'||lpad(nextval('public.marketplace_order_number_seq')::text,6,'0')),
  user_id uuid not null references auth.users(id), business_id uuid not null references public.marketplace_businesses(id),
  status text not null default 'payment_pending' check (status in ('payment_pending','paid','processing','shipped','delivered','cancelled','refund_requested','partially_refunded','refunded','disputed')),
  currency text not null default 'EUR' check(currency='EUR'), subtotal_cents integer not null check(subtotal_cents>=0), shipping_cents integer not null check(shipping_cents>=0), total_cents integer not null check(total_cents>=0),
  shipping_address jsonb not null, stripe_account_id text not null, stripe_payment_intent_id text unique, stripe_checkout_session_id text unique,
  application_fee_cents integer not null default 0, carrier text, tracking_code text, tracking_url text,
  paid_at timestamptz, shipped_at timestamptz, delivered_at timestamptz, cancelled_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  product_id uuid not null references public.marketplace_products(id), quantity integer not null check(quantity between 1 and 20), unit_price_cents integer not null,
  product_snapshot jsonb not null, created_at timestamptz not null default now()
);

create table if not exists public.marketplace_inventory_reservations (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  product_id uuid not null references public.marketplace_products(id), quantity integer not null check(quantity>0),
  status text not null default 'reserved' check(status in ('reserved','committed','released')), expires_at timestamptz not null,
  created_at timestamptz not null default now(), unique(order_id,product_id)
);

create table if not exists public.marketplace_payment_events (
  stripe_event_id text primary key, event_type text not null, order_id uuid references public.marketplace_orders(id),
  payload jsonb not null default '{}'::jsonb, processed_at timestamptz not null default now()
);

create table if not exists public.marketplace_purchase_impact (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id), order_id uuid not null references public.marketplace_orders(id),
  order_item_id uuid not null references public.marketplace_order_items(id), factor_id uuid not null references public.marketplace_impact_factors(id),
  estimated_value numeric not null check(estimated_value>=0), status text not null default 'potential' check(status in ('potential','observed','voided')),
  created_at timestamptz not null default now(), unique(order_item_id,factor_id)
);

create table if not exists public.marketplace_return_requests (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id), order_id uuid not null references public.marketplace_orders(id),
  reason text not null check(length(reason) between 1 and 80), details text not null check(length(details) between 10 and 1000),
  status text not null default 'requested' check(status in ('requested','approved','rejected','received','refunded')),
  reviewer_id uuid references auth.users(id), reviewer_notes text, reviewed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(user_id,order_id)
);

create table if not exists public.marketplace_daily_picks (
  pick_date date not null, product_id uuid not null references public.marketplace_products(id), editorial_priority integer not null default 0,
  primary key(pick_date,product_id)
);

create table if not exists public.marketplace_business_spotlights (
  week_start date primary key, business_id uuid not null references public.marketplace_businesses(id), title_en text not null, title_bg text not null
);

create or replace function public.is_marketplace_editor(p_role text default 'reviewer') returns boolean
language sql stable security definer set search_path=public as $$
  select public.is_knowledge_editor(p_role);
$$;

create or replace function public.marketplace_effective_price(p_product public.marketplace_products) returns integer
language sql stable set search_path=public as $$
  select greatest(0,p_product.price_cents-coalesce((select case when d.discount_type='percent' then round(p_product.price_cents*d.discount_value/100.0)::integer else d.discount_value end
    from public.marketplace_deals d where d.product_id=p_product.id and d.active and now() between d.starts_at and d.ends_at order by d.discount_value desc limit 1),0));
$$;

create or replace function public.marketplace_product_json(p_product_id uuid) returns jsonb
language sql stable security definer set search_path=public as $$
  select jsonb_build_object(
    'id',p.id,'slug',p.slug,'product_type',p.product_type,'name_en',p.name_en,'name_bg',p.name_bg,'summary_en',p.summary_en,'summary_bg',p.summary_bg,
    'description_en',p.description_en,'description_bg',p.description_bg,'materials_en',p.materials_en,'materials_bg',p.materials_bg,
    'care_instructions_en',p.care_instructions_en,'care_instructions_bg',p.care_instructions_bg,'included_items',p.included_items,
    'image_url',p.image_url,'image_alt_en',p.image_alt_en,'image_alt_bg',p.image_alt_bg,'price_cents',p.price_cents,'effective_price_cents',public.marketplace_effective_price(p),
    'compare_at_price_cents',case when public.marketplace_effective_price(p)<p.price_cents then p.price_cents else p.compare_at_price_cents end,
    'currency','EUR','stock_quantity',p.stock_quantity,'sustainability_rating',p.sustainability_rating,'featured',p.featured,'popularity_score',p.popularity_score,
    'customer_rating',(select avg(r.rating)::numeric(3,2) from public.marketplace_reviews r where r.product_id=p.id and r.status='approved'),
    'review_count',(select count(*) from public.marketplace_reviews r where r.product_id=p.id and r.status='approved'),
    'business',to_jsonb(b)-'legal_name'-'support_email'-'platform_fee_bps',
    'categories',coalesce((select jsonb_agg(to_jsonb(c) order by c.sort_order) from public.marketplace_product_categories pc join public.marketplace_categories c on c.id=pc.category_id where pc.product_id=p.id and c.active),'[]'::jsonb),
    'certifications',coalesce((select jsonb_agg(to_jsonb(c)||jsonb_build_object('evidence_url',pc.evidence_url,'status',pc.status,'valid_until',pc.valid_until)) from public.marketplace_product_certifications pc join public.marketplace_certifications c on c.id=pc.certification_id where pc.product_id=p.id and pc.status='verified' and (pc.valid_until is null or pc.valid_until>=current_date)),'[]'::jsonb),
    'impact_claims',coalesce((select jsonb_agg(to_jsonb(f)) from public.marketplace_impact_factors f where f.product_id=p.id and f.published),'[]'::jsonb),
    'sustainability_evidence',coalesce((select jsonb_agg(to_jsonb(e)-'reviewed_by') from public.marketplace_product_sustainability_evidence e where e.product_id=p.id),'[]'::jsonb)
  ) from public.marketplace_products p join public.marketplace_businesses b on b.id=p.business_id
  where p.id=p_product_id and p.status='published' and b.verification_status='verified';
$$;

create or replace function public.search_marketplace_products(p_query text default null,p_categories text[] default '{}',p_certifications text[] default '{}',p_min_price_cents integer default null,p_max_price_cents integer default null,p_deals_only boolean default false,p_sort text default 'recommended',p_cursor text default null,p_limit integer default 24)
returns setof jsonb language sql stable security definer set search_path=public,extensions,pg_temp as $$
  select public.marketplace_product_json(p.id)||jsonb_build_object('cursor',p.created_at::text||':'||p.id::text)
  from public.marketplace_products p join public.marketplace_businesses b on b.id=p.business_id
  where p.status='published' and b.verification_status='verified' and p.stock_quantity>0
    and (p_query is null or unaccent(lower(p.name_en||' '||p.name_bg||' '||p.summary_en||' '||p.summary_bg||' '||b.name)) like '%'||unaccent(lower(trim(p_query)))||'%')
    and (cardinality(p_categories)=0 or exists(select 1 from public.marketplace_product_categories pc join public.marketplace_categories c on c.id=pc.category_id where pc.product_id=p.id and c.slug=any(p_categories)))
    and (cardinality(p_certifications)=0 or exists(select 1 from public.marketplace_product_certifications pc join public.marketplace_certifications c on c.id=pc.certification_id where pc.product_id=p.id and c.slug=any(p_certifications) and pc.status='verified' and (pc.valid_until is null or pc.valid_until>=current_date)))
    and (p_min_price_cents is null or public.marketplace_effective_price(p)>=p_min_price_cents)
    and (p_max_price_cents is null or public.marketplace_effective_price(p)<=p_max_price_cents)
    and (not p_deals_only or public.marketplace_effective_price(p)<p.price_cents)
    and (p_cursor is null or p.created_at::text||':'||p.id::text<p_cursor)
  order by case when p_sort='price_asc' then public.marketplace_effective_price(p) end asc,
    case when p_sort='price_desc' then public.marketplace_effective_price(p) end desc,
    case when p_sort in ('popular','recommended') then p.popularity_score end desc, p.featured desc, p.created_at desc, p.id
  limit least(greatest(p_limit,1),48);
$$;

create or replace function public.get_marketplace_product(p_slug text) returns jsonb
language sql stable security definer set search_path=public as $$ select public.marketplace_product_json(id) from public.marketplace_products where slug=p_slug; $$;

create or replace function public.get_marketplace_business(p_slug text) returns jsonb
language sql stable security definer set search_path=public as $$
  select jsonb_build_object('business',to_jsonb(b)-'legal_name'-'support_email'-'platform_fee_bps',
    'products',coalesce((select jsonb_agg(public.marketplace_product_json(p.id)) from public.marketplace_products p where p.business_id=b.id and p.status='published'),'[]'::jsonb),
    'certifications',coalesce((select jsonb_agg(to_jsonb(c)||jsonb_build_object('evidence_url',bc.evidence_url,'status',bc.status,'valid_until',bc.valid_until)) from public.marketplace_business_certifications bc join public.marketplace_certifications c on c.id=bc.certification_id where bc.business_id=b.id and bc.status='verified' and (bc.valid_until is null or bc.valid_until>=current_date)),'[]'::jsonb))
  from public.marketplace_businesses b where b.slug=p_slug and b.verification_status='verified';
$$;

create or replace function public.get_marketplace_filter_options() returns jsonb
language sql stable security definer set search_path=public as $$
  select jsonb_build_object(
    'categories',coalesce((select jsonb_agg(to_jsonb(c) order by c.sort_order,c.name_en) from public.marketplace_categories c where c.active),'[]'::jsonb),
    'certifications',coalesce((select jsonb_agg(jsonb_build_object('slug',c.slug,'name',c.name,'issuer',c.issuer) order by c.name) from public.marketplace_certifications c where c.active),'[]'::jsonb)
  );
$$;

create or replace function public.get_marketplace_home(p_locale text default 'en',p_local_date date default current_date) returns jsonb
language plpgsql stable security definer set search_path=public as $$
declare pick_id uuid; spotlight jsonb; user_interests text[]; begin
  select coalesce(interests,'{}') into user_interests from public.profiles where id=auth.uid();
  select p.id into pick_id from public.marketplace_products p join public.marketplace_businesses b on b.id=p.business_id
    left join public.marketplace_product_categories pc on pc.product_id=p.id left join public.marketplace_categories c on c.id=pc.category_id
    where p.status='published' and b.verification_status='verified' and p.stock_quantity>0
    group by p.id order by max(case when lower(replace(c.slug,'-',' '))=any(select lower(x) from unnest(coalesce(user_interests,'{}')) x) then 1 else 0 end) desc,
      p.featured desc, p.popularity_score desc, md5(coalesce(auth.uid()::text,'anonymous')||p_local_date::text||p.id::text) limit 1;
  select to_jsonb(b)-'legal_name'-'support_email'-'platform_fee_bps' into spotlight from public.marketplace_business_spotlights s join public.marketplace_businesses b on b.id=s.business_id
    where s.week_start<=p_local_date and s.week_start>p_local_date-7 and b.verification_status='verified' order by s.week_start desc limit 1;
  return jsonb_build_object('daily_pick',case when pick_id is null then null else jsonb_build_object('product',public.marketplace_product_json(pick_id),'score',0,'reasons',jsonb_build_array(jsonb_build_object('en','Selected for your daily sustainable choice','bg','Избрано за ежедневния ви устойчив избор'))) end,
    'featured',coalesce((select jsonb_agg(public.marketplace_product_json(id)) from (select p.id from public.marketplace_products p join public.marketplace_businesses b on b.id=p.business_id where p.status='published' and p.featured and b.verification_status='verified' order by p.updated_at desc limit 8) x),'[]'::jsonb),
    'trending',coalesce((select jsonb_agg(public.marketplace_product_json(id)) from (select p.id from public.marketplace_products p join public.marketplace_businesses b on b.id=p.business_id where p.status='published' and b.verification_status='verified' order by p.popularity_score desc,p.updated_at desc limit 8) x),'[]'::jsonb),
    'deals',coalesce((select jsonb_agg(public.marketplace_product_json(p.id)) from public.marketplace_products p join public.marketplace_businesses b on b.id=p.business_id where p.status='published' and b.verification_status='verified' and public.marketplace_effective_price(p)<p.price_cents limit 8),'[]'::jsonb),
    'categories',coalesce((select jsonb_agg(to_jsonb(c) order by sort_order) from public.marketplace_categories c where active),'[]'::jsonb),'business_spotlight',spotlight);
end $$;

create or replace function public.marketplace_cart_json(p_cart_id uuid) returns jsonb
language sql stable security definer set search_path=public as $$
  select jsonb_build_object('id',c.id,'business_id',c.business_id,'business',case when b.id is null then null else to_jsonb(b)-'legal_name'-'support_email'-'platform_fee_bps' end,
    'items',coalesce((select jsonb_agg(jsonb_build_object('id',ci.id,'quantity',ci.quantity,'unit_price_cents',public.marketplace_effective_price(p),'product',public.marketplace_product_json(p.id))) from public.marketplace_cart_items ci join public.marketplace_products p on p.id=ci.product_id where ci.cart_id=c.id),'[]'::jsonb),
    'subtotal_cents',coalesce((select sum(ci.quantity*public.marketplace_effective_price(p)) from public.marketplace_cart_items ci join public.marketplace_products p on p.id=ci.product_id where ci.cart_id=c.id),0),
    'shipping_cents',case when b.id is null then 0 when b.free_shipping_threshold_cents is not null and coalesce((select sum(ci.quantity*public.marketplace_effective_price(p)) from public.marketplace_cart_items ci join public.marketplace_products p on p.id=ci.product_id where ci.cart_id=c.id),0)>=b.free_shipping_threshold_cents then 0 else b.shipping_fee_cents end,
    'total_cents',coalesce((select sum(ci.quantity*public.marketplace_effective_price(p)) from public.marketplace_cart_items ci join public.marketplace_products p on p.id=ci.product_id where ci.cart_id=c.id),0)+case when b.id is null then 0 when b.free_shipping_threshold_cents is not null and coalesce((select sum(ci.quantity*public.marketplace_effective_price(p)) from public.marketplace_cart_items ci join public.marketplace_products p on p.id=ci.product_id where ci.cart_id=c.id),0)>=b.free_shipping_threshold_cents then 0 else b.shipping_fee_cents end)
  from public.marketplace_carts c left join public.marketplace_businesses b on b.id=c.business_id where c.id=p_cart_id;
$$;

create or replace function public.get_marketplace_cart() returns jsonb language plpgsql security definer set search_path=public as $$
declare cart_id uuid; begin if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.marketplace_carts(user_id) values(auth.uid()) on conflict(user_id) do update set updated_at=now() returning id into cart_id;
  return public.marketplace_cart_json(cart_id); end $$;

create or replace function public.get_my_marketplace_wishlist() returns setof jsonb
language sql stable security definer set search_path=public as $$
  select public.marketplace_product_json(w.product_id) from public.marketplace_wishlist_items w where w.user_id=auth.uid() order by w.created_at desc;
$$;

create or replace function public.set_marketplace_cart_item(p_product_id uuid,p_quantity integer,p_replace_business boolean default false) returns jsonb
language plpgsql security definer set search_path=public as $$
declare cart public.marketplace_carts; product public.marketplace_products; begin if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into product from public.marketplace_products where id=p_product_id and status='published' for update;
  if product.id is null or product.stock_quantity<p_quantity or p_quantity<1 or p_quantity>20 then raise exception 'Product quantity unavailable'; end if;
  insert into public.marketplace_carts(user_id,business_id) values(auth.uid(),product.business_id) on conflict(user_id) do update set updated_at=now() returning * into cart;
  if cart.business_id is not null and cart.business_id<>product.business_id then
    if not p_replace_business then raise exception 'CART_BUSINESS_MISMATCH'; end if;
    delete from public.marketplace_cart_items where cart_id=cart.id; update public.marketplace_carts set business_id=product.business_id where id=cart.id;
  elsif cart.business_id is null then update public.marketplace_carts set business_id=product.business_id where id=cart.id; end if;
  insert into public.marketplace_cart_items(cart_id,product_id,quantity) values(cart.id,p_product_id,p_quantity)
    on conflict(cart_id,product_id) do update set quantity=excluded.quantity,updated_at=now();
  return public.marketplace_cart_json(cart.id); end $$;

create or replace function public.remove_marketplace_cart_item(p_product_id uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare cart_id uuid; begin select id into cart_id from public.marketplace_carts where user_id=auth.uid(); if cart_id is null then return public.get_marketplace_cart(); end if;
  delete from public.marketplace_cart_items where cart_id=cart_id and product_id=p_product_id;
  if not exists(select 1 from public.marketplace_cart_items where cart_id=cart_id) then update public.marketplace_carts set business_id=null where id=cart_id; end if;
  return public.marketplace_cart_json(cart_id); end $$;

create or replace function public.get_my_marketplace_orders() returns setof jsonb language sql stable security definer set search_path=public as $$
  select to_jsonb(o)||jsonb_build_object(
    'business',to_jsonb(b)-'legal_name'-'support_email'-'platform_fee_bps',
    'items',(select coalesce(jsonb_agg(to_jsonb(i)),'[]'::jsonb) from public.marketplace_order_items i where i.order_id=o.id),
    'impact_claims',(select coalesce(jsonb_agg(to_jsonb(f)||jsonb_build_object('id',pi.id,'value',pi.estimated_value,'status',pi.status)),'[]'::jsonb) from public.marketplace_purchase_impact pi join public.marketplace_impact_factors f on f.id=pi.factor_id where pi.order_id=o.id and pi.status<>'voided'))
  from public.marketplace_orders o join public.marketplace_businesses b on b.id=o.business_id where o.user_id=auth.uid() order by o.created_at desc;
$$;
create or replace function public.get_my_marketplace_order(p_order_id uuid) returns jsonb language sql stable security definer set search_path=public as $$
  select x from public.get_my_marketplace_orders() x where x->>'id'=p_order_id::text limit 1;
$$;

create or replace function public.prepare_marketplace_checkout(p_shipping_address jsonb,p_platform text) returns jsonb
language plpgsql security definer set search_path=public as $$
declare cart public.marketplace_carts; business public.marketplace_businesses; payment public.marketplace_business_payment_accounts;
  item record; order_id uuid; subtotal integer:=0; shipping integer:=0; total integer:=0; fee integer:=0; available integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_platform not in ('web','ios','android') then raise exception 'Unsupported platform'; end if;
  if coalesce(trim(p_shipping_address->>'fullName'),'')='' or coalesce(trim(p_shipping_address->>'line1'),'')='' or coalesce(trim(p_shipping_address->>'city'),'')='' or coalesce(trim(p_shipping_address->>'postalCode'),'')='' or upper(coalesce(p_shipping_address->>'country',''))<>'BG' then raise exception 'A complete Bulgarian shipping address is required'; end if;
  if not coalesce((select enabled from public.feature_flags where key='marketplace_checkout_enabled'),false) then raise exception 'Marketplace checkout is not enabled'; end if;
  select * into cart from public.marketplace_carts where user_id=auth.uid() for update;
  if cart.id is null or not exists(select 1 from public.marketplace_cart_items where cart_id=cart.id) then raise exception 'Cart is empty'; end if;
  select * into business from public.marketplace_businesses where id=cart.business_id and verification_status='verified' for update;
  select * into payment from public.marketplace_business_payment_accounts where business_id=business.id and onboarding_complete and charges_enabled;
  if payment.business_id is null then raise exception 'This partner cannot accept payments yet'; end if;
  for item in select ci.product_id,ci.quantity,p.status,p.business_id,p.stock_quantity,public.marketplace_effective_price(p) effective_price from public.marketplace_cart_items ci join public.marketplace_products p on p.id=ci.product_id where ci.cart_id=cart.id order by p.id for update of p loop
    if item.status<>'published' or item.business_id<>business.id then raise exception 'Cart contains an unavailable product'; end if;
    select item.stock_quantity-coalesce(sum(r.quantity) filter(where r.status='reserved' and r.expires_at>now()),0) into available from public.marketplace_inventory_reservations r where r.product_id=item.product_id;
    if available<item.quantity then raise exception 'A cart item is no longer available'; end if;
    subtotal:=subtotal+item.quantity*item.effective_price;
  end loop;
  shipping:=case when business.free_shipping_threshold_cents is not null and subtotal>=business.free_shipping_threshold_cents then 0 else business.shipping_fee_cents end;
  total:=subtotal+shipping; fee:=round(total*business.platform_fee_bps/10000.0);
  insert into public.marketplace_orders(user_id,business_id,subtotal_cents,shipping_cents,total_cents,shipping_address,stripe_account_id,application_fee_cents)
    values(auth.uid(),business.id,subtotal,shipping,total,p_shipping_address,payment.stripe_account_id,fee) returning id into order_id;
  for item in select ci.product_id,ci.quantity,public.marketplace_effective_price(p) effective_price from public.marketplace_cart_items ci join public.marketplace_products p on p.id=ci.product_id where ci.cart_id=cart.id loop
    insert into public.marketplace_order_items(order_id,product_id,quantity,unit_price_cents,product_snapshot)
      values(order_id,item.product_id,item.quantity,item.effective_price,public.marketplace_product_json(item.product_id));
    insert into public.marketplace_inventory_reservations(order_id,product_id,quantity,expires_at) values(order_id,item.product_id,item.quantity,now()+interval '15 minutes');
  end loop;
  return jsonb_build_object('orderId',order_id,'amountCents',total,'applicationFeeCents',fee,'stripeAccountId',payment.stripe_account_id,'businessName',business.name,'currency','eur','customerEmail',auth.jwt()->>'email');
end $$;

create or replace function public.attach_marketplace_payment_reference(p_order_id uuid,p_payment_intent_id text default null,p_checkout_session_id text default null) returns void
language plpgsql security definer set search_path=public as $$
begin update public.marketplace_orders set stripe_payment_intent_id=coalesce(p_payment_intent_id,stripe_payment_intent_id),stripe_checkout_session_id=coalesce(p_checkout_session_id,stripe_checkout_session_id),updated_at=now()
  where id=p_order_id and user_id=auth.uid() and status='payment_pending'; if not found then raise exception 'Order unavailable'; end if; end $$;

create or replace function public.process_marketplace_payment_event(p_event_id text,p_event_type text,p_order_id uuid,p_payload jsonb) returns boolean
language plpgsql security definer set search_path=public as $$
declare order_row public.marketplace_orders; item record; begin
  if current_user not in ('service_role','postgres','supabase_admin') and auth.role()<>'service_role' then raise exception 'Service role required'; end if;
  insert into public.marketplace_payment_events(stripe_event_id,event_type,order_id,payload) values(p_event_id,p_event_type,p_order_id,p_payload) on conflict do nothing;
  if not found then return false; end if;
  select * into order_row from public.marketplace_orders where id=p_order_id for update; if order_row.id is null then raise exception 'Order not found'; end if;
  if p_event_type='payment_intent.succeeded' and order_row.status='payment_pending' then
    update public.marketplace_orders set status='paid',paid_at=now(),updated_at=now() where id=p_order_id;
    for item in select * from public.marketplace_inventory_reservations where order_id=p_order_id and status='reserved' for update loop
      update public.marketplace_products set stock_quantity=greatest(0,stock_quantity-item.quantity),updated_at=now() where id=item.product_id;
    end loop;
    update public.marketplace_inventory_reservations set status='committed' where order_id=p_order_id and status='reserved';
    insert into public.marketplace_purchase_impact(user_id,order_id,order_item_id,factor_id,estimated_value)
      select order_row.user_id,p_order_id,oi.id,f.id,f.value*oi.quantity from public.marketplace_order_items oi join public.marketplace_impact_factors f on f.product_id=oi.product_id and f.published where oi.order_id=p_order_id on conflict do nothing;
    delete from public.marketplace_cart_items where cart_id=(select id from public.marketplace_carts where user_id=order_row.user_id);
    update public.marketplace_carts set business_id=null,updated_at=now() where user_id=order_row.user_id;
  elsif p_event_type in ('payment_intent.payment_failed','payment_intent.canceled') and order_row.status='payment_pending' then
    update public.marketplace_orders set status='cancelled',cancelled_at=now(),updated_at=now() where id=p_order_id;
    update public.marketplace_inventory_reservations set status='released' where order_id=p_order_id and status='reserved';
  elsif p_event_type in ('charge.refunded','payment_intent.refunded') then
    update public.marketplace_orders set status=case when coalesce((p_payload#>>'{data,object,amount_refunded}')::integer,order_row.total_cents)>=order_row.total_cents then 'refunded' else 'partially_refunded' end,updated_at=now() where id=p_order_id;
    update public.marketplace_purchase_impact set status='voided' where order_id=p_order_id;
  elsif p_event_type='charge.dispute.created' then update public.marketplace_orders set status='disputed',updated_at=now() where id=p_order_id; end if;
  return true;
end $$;

create or replace function public.release_expired_marketplace_reservations() returns integer
language plpgsql security definer set search_path=public as $$ declare changed integer; begin
  update public.marketplace_inventory_reservations set status='released' where status='reserved' and expires_at<=now(); get diagnostics changed=row_count;
  update public.marketplace_orders o set status='cancelled',cancelled_at=now(),updated_at=now() where status='payment_pending' and exists(select 1 from public.marketplace_inventory_reservations r where r.order_id=o.id and r.status='released'); return changed; end $$;

create or replace function public.mark_marketplace_return_requested() returns trigger language plpgsql set search_path=public as $$
begin update public.marketplace_orders set status='refund_requested',updated_at=now() where id=new.order_id and status in ('shipped','delivered'); return new; end $$;
create trigger marketplace_return_requested after insert on public.marketplace_return_requests for each row execute function public.mark_marketplace_return_requested();

create or replace function public.mark_marketplace_verified_purchase() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  new.verified_purchase:=exists(
    select 1 from public.marketplace_order_items oi
    join public.marketplace_orders o on o.id=oi.order_id
    where oi.product_id=new.product_id and o.user_id=new.user_id
      and o.status in ('paid','processing','shipped','delivered','refund_requested','partially_refunded','refunded')
  );
  return new;
end $$;
create trigger marketplace_verified_purchase before insert or update on public.marketplace_reviews for each row execute function public.mark_marketplace_verified_purchase();

create or replace function public.refresh_marketplace_sustainability_rating() returns trigger language plpgsql set search_path=public as $$
begin update public.marketplace_products set sustainability_rating=(select coalesce(avg(score),0) from public.marketplace_product_sustainability_evidence where product_id=coalesce(new.product_id,old.product_id)),updated_at=now() where id=coalesce(new.product_id,old.product_id); return coalesce(new,old); end $$;
create trigger marketplace_refresh_rating after insert or update or delete on public.marketplace_product_sustainability_evidence for each row execute function public.refresh_marketplace_sustainability_rating();

create or replace function public.validate_marketplace_publication() returns trigger language plpgsql set search_path=public as $$
begin if new.status='published' and old.status is distinct from 'published' then
  if not public.is_marketplace_editor('publisher') then raise exception 'Publisher role required'; end if;
  if (select count(*) from public.marketplace_product_sustainability_evidence where product_id=new.id and reviewed_at is not null)<>5 then raise exception 'Five reviewed sustainability dimensions are required'; end if;
  if new.image_url is null or trim(new.image_alt_en)='' or trim(new.image_alt_bg)='' or coalesce(new.media_rights->>'owner','')='' or coalesce(new.media_rights->>'license','')='' then raise exception 'Image rights and bilingual alt text are required'; end if;
  if not exists(select 1 from public.marketplace_product_categories where product_id=new.id) then raise exception 'Category required'; end if;
  new.published_at=coalesce(new.published_at,now()); end if; new.updated_at=now(); return new; end $$;
create trigger marketplace_validate_publication before update of status on public.marketplace_products for each row execute function public.validate_marketplace_publication();

alter table public.marketplace_businesses enable row level security; alter table public.marketplace_business_payment_accounts enable row level security;
alter table public.marketplace_categories enable row level security; alter table public.marketplace_certifications enable row level security; alter table public.marketplace_business_certifications enable row level security;
alter table public.marketplace_products enable row level security; alter table public.marketplace_product_categories enable row level security; alter table public.marketplace_product_certifications enable row level security;
alter table public.marketplace_product_sustainability_evidence enable row level security; alter table public.marketplace_deals enable row level security; alter table public.marketplace_impact_factors enable row level security;
alter table public.marketplace_reviews enable row level security; alter table public.marketplace_wishlist_items enable row level security; alter table public.marketplace_carts enable row level security; alter table public.marketplace_cart_items enable row level security;
alter table public.marketplace_orders enable row level security; alter table public.marketplace_order_items enable row level security; alter table public.marketplace_inventory_reservations enable row level security;
alter table public.marketplace_payment_events enable row level security; alter table public.marketplace_purchase_impact enable row level security; alter table public.marketplace_return_requests enable row level security;
alter table public.marketplace_daily_picks enable row level security; alter table public.marketplace_business_spotlights enable row level security;

create policy "Editors manage marketplace businesses" on public.marketplace_businesses for all to authenticated using(public.is_marketplace_editor()) with check(public.is_marketplace_editor());
create policy "Editors manage marketplace payments" on public.marketplace_business_payment_accounts for all to authenticated using(public.is_marketplace_editor('publisher')) with check(public.is_marketplace_editor('publisher'));
create policy "Public marketplace categories" on public.marketplace_categories for select to anon,authenticated using(active);
create policy "Editors manage marketplace categories" on public.marketplace_categories for all to authenticated using(public.is_marketplace_editor()) with check(public.is_marketplace_editor());
create policy "Public certification definitions" on public.marketplace_certifications for select to anon,authenticated using(active);
create policy "Editors manage certification definitions" on public.marketplace_certifications for all to authenticated using(public.is_marketplace_editor()) with check(public.is_marketplace_editor());
create policy "Editors manage marketplace catalog" on public.marketplace_products for all to authenticated using(public.is_marketplace_editor()) with check(public.is_marketplace_editor());
create policy "Editors manage business credentials" on public.marketplace_business_certifications for all to authenticated using(public.is_marketplace_editor()) with check(public.is_marketplace_editor());
create policy "Editors manage product categories" on public.marketplace_product_categories for all to authenticated using(public.is_marketplace_editor()) with check(public.is_marketplace_editor());
create policy "Editors manage product credentials" on public.marketplace_product_certifications for all to authenticated using(public.is_marketplace_editor()) with check(public.is_marketplace_editor());
create policy "Editors manage sustainability evidence" on public.marketplace_product_sustainability_evidence for all to authenticated using(public.is_marketplace_editor()) with check(public.is_marketplace_editor());
create policy "Editors manage deals" on public.marketplace_deals for all to authenticated using(public.is_marketplace_editor()) with check(public.is_marketplace_editor());
create policy "Editors manage impact factors" on public.marketplace_impact_factors for all to authenticated using(public.is_marketplace_editor()) with check(public.is_marketplace_editor());
create policy "Approved or own marketplace reviews" on public.marketplace_reviews for select to anon,authenticated using(status='approved' or user_id=auth.uid() or public.is_marketplace_editor());
create policy "Users submit marketplace reviews" on public.marketplace_reviews for insert to authenticated with check(user_id=auth.uid() and status='pending');
create policy "Users update pending marketplace reviews" on public.marketplace_reviews for update to authenticated using(user_id=auth.uid() and status='pending') with check(user_id=auth.uid() and status='pending');
create policy "Editors moderate marketplace reviews" on public.marketplace_reviews for update to authenticated using(public.is_marketplace_editor()) with check(public.is_marketplace_editor());
create policy "Users own marketplace wishlist" on public.marketplace_wishlist_items for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "Users read own marketplace carts" on public.marketplace_carts for select to authenticated using(user_id=auth.uid());
create policy "Users read own marketplace cart items" on public.marketplace_cart_items for select to authenticated using(exists(select 1 from public.marketplace_carts c where c.id=cart_id and c.user_id=auth.uid()));
create policy "Users read own marketplace orders" on public.marketplace_orders for select to authenticated using(user_id=auth.uid() or public.is_marketplace_editor());
create policy "Editors update marketplace orders" on public.marketplace_orders for update to authenticated using(public.is_marketplace_editor()) with check(public.is_marketplace_editor());
create policy "Users read own marketplace order items" on public.marketplace_order_items for select to authenticated using(exists(select 1 from public.marketplace_orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_marketplace_editor())));
create policy "Users read own purchase impact" on public.marketplace_purchase_impact for select to authenticated using(user_id=auth.uid() or public.is_marketplace_editor());
create policy "Users create own return requests" on public.marketplace_return_requests for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.marketplace_orders o where o.id=order_id and o.user_id=auth.uid() and o.status in ('delivered','shipped')));
create policy "Users read own return requests" on public.marketplace_return_requests for select to authenticated using(user_id=auth.uid() or public.is_marketplace_editor());
create policy "Editors update return requests" on public.marketplace_return_requests for update to authenticated using(public.is_marketplace_editor()) with check(public.is_marketplace_editor());
create policy "Editors manage daily picks" on public.marketplace_daily_picks for all to authenticated using(public.is_marketplace_editor()) with check(public.is_marketplace_editor());
create policy "Editors manage spotlights" on public.marketplace_business_spotlights for all to authenticated using(public.is_marketplace_editor()) with check(public.is_marketplace_editor());

revoke execute on function public.is_marketplace_editor(text),public.marketplace_effective_price(public.marketplace_products),public.marketplace_product_json(uuid),public.marketplace_cart_json(uuid),public.process_marketplace_payment_event(text,text,uuid,jsonb),public.release_expired_marketplace_reservations(),public.mark_marketplace_return_requested(),public.mark_marketplace_verified_purchase(),public.refresh_marketplace_sustainability_rating(),public.validate_marketplace_publication() from public,anon,authenticated;
grant execute on function public.is_marketplace_editor(text) to authenticated,service_role;
grant execute on function public.process_marketplace_payment_event(text,text,uuid,jsonb),public.release_expired_marketplace_reservations() to service_role;
grant execute on function public.get_marketplace_home(text,date),public.search_marketplace_products(text,text[],text[],integer,integer,boolean,text,text,integer),public.get_marketplace_product(text),public.get_marketplace_business(text),public.get_marketplace_filter_options() to anon,authenticated;
grant execute on function public.get_marketplace_cart(),public.set_marketplace_cart_item(uuid,integer,boolean),public.remove_marketplace_cart_item(uuid),public.get_my_marketplace_orders(),public.get_my_marketplace_order(uuid) to authenticated;
grant execute on function public.get_my_marketplace_wishlist() to authenticated;
grant execute on function public.prepare_marketplace_checkout(jsonb,text),public.attach_marketplace_payment_reference(uuid,text,text) to authenticated;
grant select on public.marketplace_categories,public.marketplace_certifications to anon,authenticated;
grant select,insert,delete on public.marketplace_wishlist_items to authenticated; grant select,insert,update on public.marketplace_reviews to authenticated; grant select,insert on public.marketplace_return_requests to authenticated;
grant select,insert,update,delete on public.marketplace_businesses,public.marketplace_business_payment_accounts,public.marketplace_products,public.marketplace_product_categories,public.marketplace_product_certifications,public.marketplace_product_sustainability_evidence,public.marketplace_deals,public.marketplace_impact_factors to authenticated;
grant select,update on public.marketplace_orders to authenticated; grant select,update on public.marketplace_return_requests to authenticated;

insert into public.marketplace_categories(slug,name_en,name_bg,description_en,description_bg,icon,sort_order) values
('eco-friendly-home','Eco-Friendly Home','Екологичен дом','Lower-waste essentials for everyday spaces.','Решения с по-малко отпадък за ежедневните пространства.','home-outline',10),
('zero-waste','Zero Waste','Нулев отпадък','Reusable and refillable alternatives.','Алтернативи за многократна употреба и презареждане.','repeat-outline',20),
('sustainable-travel','Sustainable Travel','Устойчиво пътуване','Durable choices for lower-impact journeys.','Издръжливи решения за пътувания с по-малък отпечатък.','airplane-outline',30),
('renewable-energy-tools','Renewable Energy Tools','Инструменти за чиста енергия','Energy-saving and renewable-energy products.','Енергоспестяващи продукти и решения за чиста енергия.','flash-outline',40),
('ethical-fashion','Ethical Fashion','Етична мода','Long-life, repairable and responsibly made essentials.','Дълготрайни и отговорно произведени продукти.','shirt-outline',50),
('sustainable-garden','Sustainable Garden','Устойчива градина','Seasonal tools for regenerative growing.','Сезонни инструменти за регенеративно отглеждане.','flower-outline',60)
on conflict(slug) do update set name_en=excluded.name_en,name_bg=excluded.name_bg,description_en=excluded.description_en,description_bg=excluded.description_bg,icon=excluded.icon,sort_order=excluded.sort_order;

insert into public.marketplace_certifications(slug,name,issuer,description_en,description_bg,canonical_url) values
('fairtrade','FAIRTRADE','Fairtrade International','Independent social, economic and environmental standards.','Независими социални, икономически и екологични стандарти.','https://www.fairtrade.net/'),
('eu-organic','EU Organic','European Union','EU certification for organic production.','Сертификация на ЕС за биологично производство.','https://agriculture.ec.europa.eu/farming/organic-farming/organic-logo_en'),
('energy-star','ENERGY STAR','U.S. Environmental Protection Agency','Energy-efficiency certification where applicable.','Сертификация за енергийна ефективност, когато е приложима.','https://www.energystar.gov/')
on conflict(slug) do update set name=excluded.name,issuer=excluded.issuer,description_en=excluded.description_en,description_bg=excluded.description_bg,canonical_url=excluded.canonical_url;

do $$ begin if to_regclass('public.feature_flags') is not null then
  insert into public.feature_flags(key,enabled,updated_at) values('sustainability_marketplace_mvp',false,now()),('marketplace_checkout_enabled',false,now())
  on conflict(key) do update set enabled=excluded.enabled,updated_at=excluded.updated_at; end if; end $$;
