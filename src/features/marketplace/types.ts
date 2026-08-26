export type MarketplaceLocale = 'en' | 'bg';
export type MarketplaceProductStatus = 'draft' | 'in_review' | 'published' | 'archived';
export type MarketplaceOrderStatus =
  | 'payment_pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refund_requested'
  | 'partially_refunded'
  | 'refunded'
  | 'disputed';

export interface LocalizedText {
  en: string;
  bg: string;
}

export interface MarketplaceCategory {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  icon: string;
}

export interface MarketplaceCertification {
  id: string;
  slug: string;
  name: string;
  issuer: string;
  evidenceUrl: string;
  validUntil?: string | null;
  verified: boolean;
}

export interface MarketplaceBusinessSummary {
  id: string;
  slug: string;
  name: string;
  summary: LocalizedText;
  logoUrl?: string | null;
  verified: boolean;
  sustainabilityRating: number;
  shippingFeeCents: number;
  freeShippingThresholdCents?: number | null;
}

export interface MarketplaceImpactClaim {
  id: string;
  metric: 'co2e_kg' | 'waste_kg' | 'plastic_items' | 'water_l';
  value: number;
  unit: string;
  label: LocalizedText;
  methodologyVersion: string;
  sourceUrl: string;
  assumptions: LocalizedText;
}

export interface MarketplaceProductSummary {
  id: string;
  slug: string;
  name: LocalizedText;
  summary: LocalizedText;
  imageUrl?: string | null;
  imageAlt: LocalizedText;
  priceCents: number;
  compareAtPriceCents?: number | null;
  currency: 'EUR';
  stockQuantity: number;
  productType: 'product' | 'bundle';
  sustainabilityRating: number;
  customerRating?: number | null;
  reviewCount: number;
  popularityScore: number;
  featured: boolean;
  business: MarketplaceBusinessSummary;
  categories: MarketplaceCategory[];
  certifications: MarketplaceCertification[];
  impactClaims: MarketplaceImpactClaim[];
}

export interface MarketplaceProductDetail extends MarketplaceProductSummary {
  description: LocalizedText;
  materials: LocalizedText;
  careInstructions: LocalizedText;
  includedItems: LocalizedText[];
  sustainabilityEvidence: {
    dimension: 'materials' | 'production' | 'packaging' | 'durability' | 'logistics';
    score: number;
    evidenceUrl: string;
    summary: LocalizedText;
  }[];
}

export interface MarketplaceRecommendation {
  product: MarketplaceProductSummary;
  score: number;
  reasons: LocalizedText[];
}

export interface MarketplaceHome {
  dailyPick: MarketplaceRecommendation | null;
  featured: MarketplaceProductSummary[];
  trending: MarketplaceProductSummary[];
  deals: MarketplaceProductSummary[];
  categories: MarketplaceCategory[];
  businessSpotlight: MarketplaceBusinessSummary | null;
}

export interface MarketplaceFilters {
  query?: string;
  categorySlugs?: string[];
  certificationSlugs?: string[];
  minPriceCents?: number;
  maxPriceCents?: number;
  dealsOnly?: boolean;
  sort?: 'recommended' | 'popular' | 'price_asc' | 'price_desc' | 'newest';
  cursor?: string | null;
  limit?: number;
}

export interface MarketplaceSearchResult {
  products: MarketplaceProductSummary[];
  nextCursor: string | null;
}

export interface MarketplaceCartItem {
  id: string;
  quantity: number;
  product: MarketplaceProductSummary;
  unitPriceCents: number;
}

export interface MarketplaceCart {
  id: string;
  businessId: string | null;
  business: MarketplaceBusinessSummary | null;
  items: MarketplaceCartItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: 'EUR';
}

export interface MarketplaceOrder {
  id: string;
  orderNumber: string;
  status: MarketplaceOrderStatus;
  business: MarketplaceBusinessSummary;
  items: MarketplaceCartItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: 'EUR';
  trackingUrl?: string | null;
  createdAt: string;
  paidAt?: string | null;
  deliveredAt?: string | null;
  impactClaims: MarketplaceImpactClaim[];
}

export interface MarketplaceReturnRequest {
  id: string;
  orderId: string;
  status: 'requested' | 'approved' | 'rejected' | 'received' | 'refunded';
  reason: string;
  details: string;
  createdAt: string;
}

export interface RecommendationSignals {
  interests: string[];
  goalCategories: string[];
  habitCategories: string[];
  affinityCategories: string[];
}
