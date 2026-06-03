export type PaywallPackage = {
  identifier: string;
  title: string;
  price: string;
  period: 'monthly' | 'annual' | 'lifetime' | 'unknown';
  badge?: string;
};

export type PurchaseResult = {
  success: boolean;
  isPro: boolean;
  error?: string;
};
