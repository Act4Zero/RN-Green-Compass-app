import { initPaymentSheet, initStripe, presentPaymentSheet } from '@stripe/stripe-react-native';

export async function presentMarketplacePayment(input: {
  publishableKey: string;
  stripeAccountId: string;
  clientSecret: string;
  fullName: string;
  line1: string;
  city: string;
  postalCode: string;
  phone: string;
}): Promise<{ success: boolean; error?: string }> {
  await initStripe({ publishableKey: input.publishableKey, stripeAccountId: input.stripeAccountId, merchantIdentifier: 'merchant.com.act4zero.GreenCompass', urlScheme: 'greencompass' });
  const initialized = await initPaymentSheet({
    merchantDisplayName: 'Green Compass verified partner', paymentIntentClientSecret: input.clientSecret, returnURL: 'greencompass://stripe-redirect',
    applePay: { merchantCountryCode: 'BG' }, googlePay: { merchantCountryCode: 'BG', currencyCode: 'EUR', testEnv: input.publishableKey.startsWith('pk_test_') },
    defaultBillingDetails: { name: input.fullName, phone: input.phone, address: { line1: input.line1, city: input.city, postalCode: input.postalCode, country: 'BG' } },
    defaultShippingDetails: { name: input.fullName, phone: input.phone, address: { line1: input.line1, city: input.city, postalCode: input.postalCode, country: 'BG' } },
  });
  if (initialized.error) return { success: false, error: initialized.error.message };
  const presented = await presentPaymentSheet();
  if (presented.error) return { success: false, error: presented.error.message };
  return { success: true };
}
