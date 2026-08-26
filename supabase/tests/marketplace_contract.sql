\set ON_ERROR_STOP on
insert into auth.users(id,email) values
('00000000-0000-4000-8000-000000000011','shopper@example.test'),
('00000000-0000-4000-8000-000000000012','other@example.test'),
('00000000-0000-4000-8000-000000000013','publisher@example.test');
insert into public.profiles(id,interests) values('00000000-0000-4000-8000-000000000011',array['Zero Waste']);

do $$ begin
  if (select count(*) from public.marketplace_categories)<>6 then raise exception 'Expected six marketplace categories'; end if;
  if (select enabled from public.feature_flags where key='sustainability_marketplace_mvp') then raise exception 'Catalog must ship disabled'; end if;
  if exists(select 1 from pg_constraint c join pg_class target on target.oid=c.confrelid where c.conrelid in (select oid from pg_class where relname like 'marketplace_%') and target.relname like 'sustainability_%') then raise exception 'Marketplace must not depend on Sustainability Map tables'; end if;
end $$;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000013',false);
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000013","app_metadata":{"knowledge_roles":["publisher"]}}',false);
set role authenticated;
insert into public.marketplace_businesses(id,slug,name,legal_name,summary_en,summary_bg,support_email,verification_status,sustainability_rating,shipping_fee_cents)
values('10000000-0000-4000-8000-000000000001','verified-pilot','Verified Pilot','Verified Pilot Ltd','Evidence-backed essentials.','Продукти с доказателства.','support@example.test','verified',4.5,399);
insert into public.marketplace_products(id,business_id,slug,name_en,name_bg,summary_en,summary_bg,description_en,description_bg,image_url,image_alt_en,image_alt_bg,media_rights,price_cents,stock_quantity,status)
values('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','reusable-test-bottle','Reusable test bottle','Тестова бутилка','A durable test product.','Издръжлив тестов продукт.','Test description','Тестово описание','https://example.test/bottle.jpg','Reusable bottle','Бутилка за многократна употреба','{"owner":"Verified Pilot","license":"partner-provided"}',1999,5,'draft');
insert into public.marketplace_product_categories(product_id,category_id) select '20000000-0000-4000-8000-000000000001',id from public.marketplace_categories where slug='zero-waste';
insert into public.marketplace_product_sustainability_evidence(product_id,dimension,score,summary_en,summary_bg,evidence_url,reviewed_by,reviewed_at)
select '20000000-0000-4000-8000-000000000001',dimension,4,'Reviewed evidence','Проверени доказателства','https://example.test/evidence','00000000-0000-4000-8000-000000000013',now()
from unnest(array['materials','production','packaging','durability','logistics']) dimension;
update public.marketplace_products set status='published' where id='20000000-0000-4000-8000-000000000001';
reset role;

insert into public.marketplace_orders(id,user_id,business_id,status,subtotal_cents,shipping_cents,total_cents,shipping_address,stripe_account_id,paid_at,delivered_at)
values('30000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000011','10000000-0000-4000-8000-000000000001','delivered',1999,399,2398,'{"country":"BG"}','acct_contract_test',now(),now());
insert into public.marketplace_order_items(order_id,product_id,quantity,unit_price_cents,product_snapshot)
values('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',1,1999,'{}');

do $$ begin
  if has_function_privilege('anon','public.process_marketplace_payment_event(text,text,uuid,jsonb)','EXECUTE') then raise exception 'Anonymous role can execute internal payment processing'; end if;
  if has_function_privilege('authenticated','public.release_expired_marketplace_reservations()','EXECUTE') then raise exception 'Authenticated role can release reservations'; end if;
end $$;

set role anon;
do $$ declare product jsonb; begin
  product:=public.get_marketplace_product('reusable-test-bottle');
  if product->>'name_en'<>'Reusable test bottle' then raise exception 'Anonymous published product missing'; end if;
  if product::text like '%legal_name%' or product::text like '%support_email%' or product::text like '%stripe_account%' then raise exception 'Public catalog leaked private business data'; end if;
  if jsonb_array_length(public.get_marketplace_filter_options()->'certifications')<>3 then raise exception 'Public certification filters are missing'; end if;
end $$;
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000011',false);
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000011","app_metadata":{}}',false);
set role authenticated;
insert into public.marketplace_wishlist_items(user_id,product_id) values('00000000-0000-4000-8000-000000000011','20000000-0000-4000-8000-000000000001');
insert into public.marketplace_reviews(user_id,product_id,rating,body)
values('00000000-0000-4000-8000-000000000011','20000000-0000-4000-8000-000000000001',5,'A durable product from a completed test purchase.');
do $$ begin
  if (select count(*) from public.marketplace_wishlist_items)<>1 then raise exception 'Wishlist owner cannot read their item'; end if;
  if not (select verified_purchase from public.marketplace_reviews where user_id=auth.uid()) then raise exception 'Verified purchase was not derived on the server'; end if;
end $$;
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000012',false);
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000012","app_metadata":{}}',false);
set role authenticated;
do $$ begin if (select count(*) from public.marketplace_wishlist_items)<>0 then raise exception 'Wishlist RLS leaked another user item'; end if; end $$;
reset role;
