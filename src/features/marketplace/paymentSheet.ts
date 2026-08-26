export async function presentMarketplacePayment(_input: {
  publishableKey: string; stripeAccountId: string; clientSecret: string; fullName: string; line1: string; city: string; postalCode: string; phone: string;
}): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Native PaymentSheet is unavailable on web.' };
}
