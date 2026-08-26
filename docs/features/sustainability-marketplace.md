# Sustainability Marketplace v1

The Marketplace is an independent Green Compass domain for buying physical, lower-impact products from verified businesses. It does not read from or write to Sustainability Map tables, RPCs, routes, moderation queues, or Mapbox services.

## v1 scope

- Public BG/EN catalog, product details, verified certifications and evidence-backed sustainability scores.
- Search by text, category, certification, price, deal status and popularity.
- Daily Pick, trending products, seasonal/editorial placement, exclusive deals and weekly business spotlight.
- Authenticated wishlist, one-partner cart, order history, reviews and return requests.
- Exact server-managed stock with 15-minute checkout reservations.
- Stripe Connect direct charges. The verified partner is the seller of record; Green Compass can apply a per-partner platform fee (zero by default for the pilot).
- Stripe Checkout on web and PaymentSheet with card, Apple Pay and Google Pay on native builds.
- Purchase-impact estimates copied from versioned, published product factors and voided after a full refund.
- Publisher queues for business verification, Stripe onboarding, product publication, review moderation, fulfillment and refunds.

Services and Map-place cross-links are intentionally outside v1. Bundles are physical SKUs with their own stock.

## Architecture

The schema is created by `supabase/migrations/202608260004_sustainability_marketplace_v1.sql`. Public catalog reads go through security-definer RPCs that return an explicit safe projection. Private tables use owner-scoped RLS, while catalog and operational writes require an existing Knowledge `publisher`/`reviewer` role through `is_marketplace_editor`.

Commerce is server-authoritative:

1. The cart RPC enforces a single verified business per cart.
2. `prepare_marketplace_checkout` locks product rows, recomputes price and shipping, checks inventory, and reserves stock.
3. `create-marketplace-checkout` creates a direct charge on the partner's connected account.
4. `marketplace-stripe-webhook` verifies the raw Stripe signature and applies idempotent payment events.
5. Only a successful webhook commits inventory and creates purchase-impact records.
6. `marketplace-return-operation` submits refunds to the connected account; the refund webhook updates the order and voids impact estimates.

The public mobile routes live under `app/marketplace`; publisher operations live at `app/admin/marketplace`. Marketplace is a first-class navigation item. On mobile, `More` holds Hub, Community and Profile so the bottom navigation stays at five items.

## Configuration

Client/EAS/Vercel environment:

```text
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_or_test_value
```

Supabase Edge Function secrets:

```text
STRIPE_SECRET_KEY=sk_live_or_test_value
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_value
MARKETPLACE_RETURN_URL=https://app.example.com
MARKETPLACE_ADMIN_RETURN_URL=https://app.example.com
```

The standard `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` secrets are supplied by Supabase to deployed functions. Never expose the Stripe secret key, webhook secret, or service-role key through Expo public configuration.

Deploy these functions:

- `create-marketplace-checkout`
- `marketplace-stripe-webhook` (Stripe signature validation is performed by the function, so configure it without JWT verification)
- `marketplace-partner-onboarding`
- `marketplace-return-operation`

In Stripe, register the webhook as a Connect webhook and subscribe at minimum to `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, `charge.refunded`, and `charge.dispute.created`. Apple Pay also requires the production merchant identifier/domain setup. Google Pay availability depends on the device and Stripe account capabilities.

Schedule `release_expired_marketplace_reservations()` with a service-role database job at least every five minutes.

## Partner and catalog acceptance

The pilot is curated; no unverified demo businesses or invented claims are seeded. Before a product can be published, operations must provide:

- a verified business, seller/return terms and completed Stripe onboarding;
- BG and EN product copy and alt text;
- licensed HTTPS product media with owner and license metadata;
- at least one category;
- all five reviewed evidence dimensions: materials, production, packaging, durability and logistics;
- certification evidence and validity dates where a certification is shown;
- versioned impact methodology, source, assumptions and review date before an impact factor is published;
- exact stock and shipping fee/free-shipping threshold.

The database publication trigger rejects incomplete products. Reviews are moderated, and the database—not the client—derives `verified_purchase` from paid order history.

## Rollout

Both flags start disabled:

- `sustainability_marketplace_mvp` controls navigation and every customer Marketplace route.
- `marketplace_checkout_enabled` independently controls order creation.

Recommended release sequence:

1. Apply the migration and deploy the four Edge Functions.
2. Configure Stripe test mode and onboard the first 3–5 Bulgarian partners.
3. Load reviewed products, shipping rules, inventory and impact evidence.
4. Enable `sustainability_marketplace_mvp` for catalog QA while checkout remains disabled.
5. Complete web, iOS and Android test purchases, webhook, refund and inventory reconciliation checks.
6. Switch to live Stripe credentials, repeat one low-value smoke purchase, then enable `marketplace_checkout_enabled`.

Disable checkout first during an incident; disable the Marketplace flag as well when catalog access must be withdrawn. Existing orders remain accessible in the database for support and reconciliation.

## Verification

Unit tests cover filter/quantity validation and deterministic recommendation ranking. Navigation tests cover desktop/mobile placement and More-route activation. The Marketplace CI workflow starts PostgreSQL, applies the isolated migration, checks publication requirements, public-data projection, RLS isolation, feature defaults, and the absence of Map foreign keys.

The migration intentionally contains no fake partner or product data. Test fixtures exist only in `supabase/tests/marketplace_contract.sql` and run against the disposable CI database.
