import { View } from 'react-native';
import { ProductCard } from './ProductCard';
import type { MarketplaceProductSummary } from '../types';

export function ProductGrid({ products }: { products: MarketplaceProductSummary[] }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>{products.map((product) => <ProductCard key={product.id} product={product} />)}</View>;
}
