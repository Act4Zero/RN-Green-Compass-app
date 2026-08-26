import supabase from '@/lib/supabase';
import { normalizeMarketplaceFilters, validateCartQuantity, validateReturnDetails } from './validation';
import type {
  LocalizedText,
  MarketplaceBusinessSummary,
  MarketplaceCart,
  MarketplaceCategory,
  MarketplaceCertification,
  MarketplaceFilters,
  MarketplaceHome,
  MarketplaceImpactClaim,
  MarketplaceOrder,
  MarketplaceProductDetail,
  MarketplaceProductSummary,
  MarketplaceReturnRequest,
  MarketplaceSearchResult,
} from './types';

const table = (name: string) => (supabase as any).from(name);
const rpc = (name: string, params: Record<string, unknown> = {}) => (supabase as any).rpc(name, params);
const localized = (row: any, field: string): LocalizedText => ({ en: row?.[`${field}_en`] || '', bg: row?.[`${field}_bg`] || row?.[`${field}_en`] || '' });

function categoryFromRow(row: any): MarketplaceCategory {
  return { id: String(row.id), slug: row.slug, name: localized(row, 'name'), description: localized(row, 'description'), icon: row.icon || 'leaf-outline' };
}

function certificationFromRow(row: any): MarketplaceCertification {
  return { id: String(row.id), slug: row.slug, name: row.name, issuer: row.issuer, evidenceUrl: row.evidence_url, validUntil: row.valid_until, verified: row.status === 'verified' || row.verified === true };
}

function businessFromRow(row: any): MarketplaceBusinessSummary {
  return {
    id: String(row.id), slug: row.slug, name: row.name, summary: localized(row, 'summary'), logoUrl: row.logo_url,
    verified: row.verification_status === 'verified' || row.verified === true,
    sustainabilityRating: Number(row.sustainability_rating || 0), shippingFeeCents: Number(row.shipping_fee_cents || 0),
    freeShippingThresholdCents: row.free_shipping_threshold_cents == null ? null : Number(row.free_shipping_threshold_cents),
  };
}

function impactFromRow(row: any): MarketplaceImpactClaim {
  return { id: String(row.id), metric: row.metric, value: Number(row.value), unit: row.unit, label: localized(row, 'label'), methodologyVersion: row.methodology_version, sourceUrl: row.source_url, assumptions: localized(row, 'assumptions') };
}

export function marketplaceProductFromRow(row: any): MarketplaceProductSummary {
  const business = businessFromRow(row.business || row.marketplace_businesses || {});
  const categories = (row.categories || row.marketplace_product_categories || []).map((entry: any) => categoryFromRow(entry.category || entry.marketplace_categories || entry));
  const certifications = (row.certifications || row.marketplace_product_certifications || []).map((entry: any) => certificationFromRow(entry.certification || entry.marketplace_certifications || entry)).filter((entry: MarketplaceCertification) => entry.verified);
  const impacts = (row.impact_claims || row.marketplace_product_impact_claims || []).map((entry: any) => impactFromRow(entry.impact_claim || entry.marketplace_impact_factors || entry));
  return {
    id: String(row.id), slug: row.slug, name: localized(row, 'name'), summary: localized(row, 'summary'),
    imageUrl: row.image_url || row.primary_image_url, imageAlt: localized(row, 'image_alt'), priceCents: Number(row.effective_price_cents ?? row.price_cents ?? 0),
    compareAtPriceCents: row.compare_at_price_cents == null ? null : Number(row.compare_at_price_cents), currency: 'EUR', stockQuantity: Number(row.stock_quantity || 0),
    productType: row.product_type || 'product', sustainabilityRating: Number(row.sustainability_rating || 0), customerRating: row.customer_rating == null ? null : Number(row.customer_rating),
    reviewCount: Number(row.review_count || 0), popularityScore: Number(row.popularity_score || 0), featured: Boolean(row.featured), business, categories, certifications, impactClaims: impacts,
  };
}

function cartFromValue(value: any): MarketplaceCart {
  const items = (value?.items || []).map((item: any) => ({ id: String(item.id), quantity: Number(item.quantity), unitPriceCents: Number(item.unit_price_cents), product: marketplaceProductFromRow(item.product || item) }));
  return { id: String(value?.id || ''), businessId: value?.business_id || null, business: value?.business ? businessFromRow(value.business) : null, items, subtotalCents: Number(value?.subtotal_cents || 0), shippingCents: Number(value?.shipping_cents || 0), totalCents: Number(value?.total_cents || 0), currency: 'EUR' };
}

function orderFromRow(row: any): MarketplaceOrder {
  return {
    id: String(row.id), orderNumber: row.order_number, status: row.status, business: businessFromRow(row.business || row.marketplace_businesses || {}),
    items: (row.items || row.marketplace_order_items || []).map((item: any) => ({ id: String(item.id), quantity: Number(item.quantity), unitPriceCents: Number(item.unit_price_cents), product: marketplaceProductFromRow(item.product_snapshot || item.product || item) })),
    subtotalCents: Number(row.subtotal_cents), shippingCents: Number(row.shipping_cents), totalCents: Number(row.total_cents), currency: 'EUR', trackingUrl: row.tracking_url,
    createdAt: row.created_at, paidAt: row.paid_at, deliveredAt: row.delivered_at, impactClaims: (row.impact_claims || []).map(impactFromRow),
  };
}

export const marketplaceService = {
  async getFilterOptions(): Promise<{ categories: MarketplaceCategory[]; certifications: { slug: string; name: string; issuer: string }[] }> {
    const { data, error } = await rpc('get_marketplace_filter_options');
    if (error) throw new Error(error.message || 'Unable to load marketplace filters.');
    const value = Array.isArray(data) ? data[0] : data || {};
    return {
      categories: (value.categories || []).map(categoryFromRow),
      certifications: (value.certifications || []).map((row: any) => ({ slug: row.slug, name: row.name, issuer: row.issuer })),
    };
  },

  async getHome(locale: 'en' | 'bg', localDate: string): Promise<MarketplaceHome> {
    const { data, error } = await rpc('get_marketplace_home', { p_locale: locale, p_local_date: localDate });
    if (error) throw new Error(error.message || 'Unable to load the marketplace.');
    const value = Array.isArray(data) ? data[0] : data || {};
    return {
      dailyPick: value.daily_pick ? { product: marketplaceProductFromRow(value.daily_pick.product || value.daily_pick), score: Number(value.daily_pick.score || 0), reasons: value.daily_pick.reasons || [] } : null,
      featured: (value.featured || []).map(marketplaceProductFromRow), trending: (value.trending || []).map(marketplaceProductFromRow), deals: (value.deals || []).map(marketplaceProductFromRow),
      categories: (value.categories || []).map(categoryFromRow), businessSpotlight: value.business_spotlight ? businessFromRow(value.business_spotlight) : null,
    };
  },

  async search(filters: MarketplaceFilters = {}): Promise<MarketplaceSearchResult> {
    const input = normalizeMarketplaceFilters(filters);
    const { data, error } = await rpc('search_marketplace_products', {
      p_query: input.query || null, p_categories: input.categorySlugs || [], p_certifications: input.certificationSlugs || [],
      p_min_price_cents: input.minPriceCents ?? null, p_max_price_cents: input.maxPriceCents ?? null, p_deals_only: input.dealsOnly || false,
      p_sort: input.sort, p_cursor: input.cursor, p_limit: input.limit,
    });
    if (error) throw new Error(error.message || 'Unable to search products.');
    const rows = data || [];
    return { products: rows.map(marketplaceProductFromRow), nextCursor: rows.length === input.limit ? rows[rows.length - 1]?.cursor || null : null };
  },

  async getProduct(slug: string): Promise<MarketplaceProductDetail | null> {
    const { data, error } = await rpc('get_marketplace_product', { p_slug: slug });
    if (error) throw new Error(error.message || 'Unable to load this product.');
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;
    return { ...marketplaceProductFromRow(row), description: localized(row, 'description'), materials: localized(row, 'materials'), careInstructions: localized(row, 'care_instructions'), includedItems: row.included_items || [], sustainabilityEvidence: row.sustainability_evidence || [] };
  },

  async getBusiness(slug: string): Promise<{ business: MarketplaceBusinessSummary; products: MarketplaceProductSummary[]; certifications: MarketplaceCertification[] } | null> {
    const { data, error } = await rpc('get_marketplace_business', { p_slug: slug });
    if (error) throw new Error(error.message || 'Unable to load this business.');
    const value = Array.isArray(data) ? data[0] : data;
    if (!value) return null;
    return { business: businessFromRow(value.business || value), products: (value.products || []).map(marketplaceProductFromRow), certifications: (value.certifications || []).map(certificationFromRow) };
  },

  async listWishlistIds(): Promise<string[]> {
    const { data, error } = await table('marketplace_wishlist_items').select('product_id');
    if (error) throw new Error(error.message || 'Unable to load your wishlist.');
    return (data || []).map((row: any) => row.product_id);
  },

  async listWishlistProducts(): Promise<MarketplaceProductSummary[]> {
    const { data, error } = await rpc('get_my_marketplace_wishlist');
    if (error) throw new Error(error.message || 'Unable to load your wishlist.');
    return (data || []).map(marketplaceProductFromRow);
  },

  async toggleWishlist(userId: string, productId: string, selected: boolean): Promise<void> {
    const query = table('marketplace_wishlist_items');
    const { error } = selected ? await query.upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id' }) : await query.delete().eq('user_id', userId).eq('product_id', productId);
    if (error) throw new Error(error.message || 'Unable to update your wishlist.');
  },

  async getCart(): Promise<MarketplaceCart> {
    const { data, error } = await rpc('get_marketplace_cart');
    if (error) throw new Error(error.message || 'Unable to load your cart.');
    return cartFromValue(Array.isArray(data) ? data[0] : data);
  },

  async setCartItem(productId: string, quantity: number, knownStock: number, replaceBusiness = false): Promise<MarketplaceCart> {
    validateCartQuantity(quantity, knownStock);
    const { data, error } = await rpc('set_marketplace_cart_item', { p_product_id: productId, p_quantity: quantity, p_replace_business: replaceBusiness });
    if (error) throw new Error(error.message || 'Unable to update your cart.');
    return cartFromValue(Array.isArray(data) ? data[0] : data);
  },

  async removeCartItem(productId: string): Promise<MarketplaceCart> {
    const { data, error } = await rpc('remove_marketplace_cart_item', { p_product_id: productId });
    if (error) throw new Error(error.message || 'Unable to update your cart.');
    return cartFromValue(Array.isArray(data) ? data[0] : data);
  },

  async createCheckout(input: { address: Record<string, string>; platform: 'web' | 'ios' | 'android' }): Promise<{ orderId: string; checkoutUrl?: string; paymentIntentClientSecret?: string; stripeAccountId?: string; businessName?: string }> {
    const { data, error } = await supabase.functions.invoke('create-marketplace-checkout', { body: input });
    if (error) throw new Error(error.message || 'Unable to start checkout.');
    return data;
  },

  async listOrders(): Promise<MarketplaceOrder[]> {
    const { data, error } = await rpc('get_my_marketplace_orders');
    if (error) throw new Error(error.message || 'Unable to load your orders.');
    return (data || []).map(orderFromRow);
  },

  async getOrder(orderId: string): Promise<MarketplaceOrder | null> {
    const { data, error } = await rpc('get_my_marketplace_order', { p_order_id: orderId });
    if (error) throw new Error(error.message || 'Unable to load this order.');
    const row = Array.isArray(data) ? data[0] : data;
    return row ? orderFromRow(row) : null;
  },

  async submitReview(userId: string, productId: string, rating: number, body: string): Promise<void> {
    const cleanBody = body.trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('Choose a rating between 1 and 5.');
    if (cleanBody.length < 20 || cleanBody.length > 2000) throw new Error('Review must be between 20 and 2,000 characters.');
    const { error } = await table('marketplace_reviews').upsert({ user_id: userId, product_id: productId, rating, body: cleanBody, status: 'pending' }, { onConflict: 'user_id,product_id' });
    if (error) throw new Error(error.message || 'Unable to submit your review.');
  },

  async listApprovedReviews(productId: string): Promise<{ id: string; rating: number; body: string; verifiedPurchase: boolean; authorName: string; createdAt: string }[]> {
    const { data, error } = await table('marketplace_reviews').select('id,rating,body,verified_purchase,created_at,profiles:user_id(display_name)').eq('product_id', productId).eq('status', 'approved').order('created_at', { ascending: false }).limit(50);
    if (error) throw new Error(error.message || 'Unable to load product reviews.');
    return (data || []).map((row: any) => ({ id: row.id, rating: Number(row.rating), body: row.body, verifiedPurchase: Boolean(row.verified_purchase), authorName: row.profiles?.display_name || 'Green Compass member', createdAt: row.created_at }));
  },

  async requestReturn(userId: string, orderId: string, reason: string, details: string): Promise<MarketplaceReturnRequest> {
    const clean = validateReturnDetails(reason, details);
    const { data, error } = await table('marketplace_return_requests').insert({ user_id: userId, order_id: orderId, ...clean }).select().single();
    if (error) throw new Error(error.message || 'Unable to submit your return request.');
    return { id: data.id, orderId: data.order_id, status: data.status, reason: data.reason, details: data.details, createdAt: data.created_at };
  },
};

export const marketplaceAdminService = {
  async getQueue(): Promise<{ businesses: any[]; products: any[]; reviews: any[]; returns: any[]; orders: any[] }> {
    const [businesses, products, reviews, returns, orders] = await Promise.all([
      table('marketplace_businesses').select('*,marketplace_business_payment_accounts(onboarding_complete,charges_enabled,payouts_enabled)').neq('verification_status', 'rejected').order('created_at'),
      table('marketplace_products').select('*,marketplace_businesses(name)').in('status', ['draft','in_review']).order('created_at'),
      table('marketplace_reviews').select('*,marketplace_products(name_en),profiles:user_id(display_name)').eq('status', 'pending').order('created_at'),
      table('marketplace_return_requests').select('*,marketplace_orders(order_number)').in('status', ['requested','approved','received']).order('created_at'),
      table('marketplace_orders').select('*,marketplace_businesses(name)').in('status', ['paid','processing','shipped','refund_requested']).order('created_at'),
    ]);
    const error = businesses.error || products.error || reviews.error || returns.error || orders.error;
    if (error) throw new Error(error.message || 'Unable to load the marketplace queue.');
    return { businesses: businesses.data || [], products: products.data || [], reviews: reviews.data || [], returns: returns.data || [], orders: orders.data || [] };
  },
  async setBusinessStatus(id: string, status: 'verified' | 'rejected' | 'suspended'): Promise<void> {
    const { error } = await table('marketplace_businesses').update({ verification_status: status, published_at: status === 'verified' ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw new Error(error.message || 'Unable to update this business.');
  },
  async createPartnerOnboarding(businessId: string): Promise<{ onboardingUrl: string }> {
    const { data, error } = await supabase.functions.invoke('marketplace-partner-onboarding', { body: { businessId } });
    if (error) throw new Error(error.message || 'Unable to start Stripe onboarding.');
    return data;
  },
  async setProductStatus(id: string, status: 'published' | 'in_review' | 'archived'): Promise<void> {
    const { error } = await table('marketplace_products').update({ status }).eq('id', id);
    if (error) throw new Error(error.message || 'Unable to update this product.');
  },
  async moderateReview(id: string, status: 'approved' | 'rejected'): Promise<void> {
    const { error } = await table('marketplace_reviews').update({ status, reviewer_id: (await supabase.auth.getUser()).data.user?.id, reviewed_at: new Date().toISOString() }).eq('id', id);
    if (error) throw new Error(error.message || 'Unable to moderate this review.');
  },
  async updateOrder(id: string, status: 'processing' | 'shipped' | 'delivered', tracking?: { carrier: string; code: string; url: string }): Promise<void> {
    const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === 'shipped') Object.assign(update, { shipped_at: new Date().toISOString(), carrier: tracking?.carrier || null, tracking_code: tracking?.code || null, tracking_url: tracking?.url || null });
    if (status === 'delivered') update.delivered_at = new Date().toISOString();
    const { error } = await table('marketplace_orders').update(update).eq('id', id);
    if (error) throw new Error(error.message || 'Unable to update this order.');
  },
  async decideReturn(returnRequestId: string, decision: 'refund' | 'reject'): Promise<void> {
    const { error } = await supabase.functions.invoke('marketplace-return-operation', { body: { returnRequestId, decision } });
    if (error) throw new Error(error.message || 'Unable to process this return.');
  },
};
