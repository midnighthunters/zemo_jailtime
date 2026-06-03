import { Platform } from 'react-native';
import { REVENUECAT } from '@/src/constants/revenue';
import type { PaywallPackage, PurchaseResult } from '@/src/types/revenue';

let Purchases: any;
let configured = false;

function getPurchases() {
  if (Platform.OS === 'web') return undefined;
  if (Purchases) return Purchases;
  try {
    // Native module is intentionally guarded so Expo Go/web stay usable.
    Purchases = require('react-native-purchases').default;
  } catch {
    Purchases = undefined;
  }
  return Purchases;
}

function apiKey() {
  if (Platform.OS === 'ios') return REVENUECAT.iosApiKey;
  if (Platform.OS === 'android') return REVENUECAT.androidApiKey;
  return '';
}

function mapPackage(pkg: any): PaywallPackage {
  const identifier = String(pkg?.identifier ?? pkg?.packageType ?? 'unknown');
  const product = pkg?.product ?? {};
  const title = String(product.title ?? identifier).replace(/\s*\(.+\)$/, '');
  const price = String(product.priceString ?? product.price ?? 'Unavailable');
  const lower = identifier.toLowerCase();
  const period = lower.includes('annual') || lower.includes('year') ? 'annual' : lower.includes('life') ? 'lifetime' : lower.includes('month') ? 'monthly' : 'unknown';
  return {
    identifier,
    title,
    price,
    period,
    badge: period === 'annual' ? 'Best Value' : undefined,
  };
}

export const RevenueCatService = {
  async configure() {
    const PurchasesModule = getPurchases();
    const key = apiKey();
    if (!PurchasesModule || !key) {
      configured = false;
      return { configured: false, reason: 'RevenueCat not configured for this build.' };
    }
    PurchasesModule.configure({ apiKey: key });
    configured = true;
    return { configured: true };
  },

  isConfigured() {
    return configured;
  },

  isProFromCustomerInfo(info: any) {
    return Boolean(info?.entitlements?.active?.[REVENUECAT.entitlementId]);
  },

  async getCustomerInfo() {
    const PurchasesModule = getPurchases();
    if (!configured || !PurchasesModule) return { isPro: false };
    const info = await PurchasesModule.getCustomerInfo();
    return { isPro: this.isProFromCustomerInfo(info), raw: info };
  },

  async getOfferings() {
    const PurchasesModule = getPurchases();
    if (!configured || !PurchasesModule) {
      return {
        packages: [
          { identifier: 'monthly_mock', title: 'Monthly Court Authority', price: '$4.99', period: 'monthly' as const },
          { identifier: 'annual_mock', title: 'Annual Supreme Court', price: '$29.99', period: 'annual' as const, badge: 'Best Value' },
          { identifier: 'lifetime_mock', title: 'Lifetime Full Pardon', price: '$79.99', period: 'lifetime' as const },
        ],
        rawPackages: [],
      };
    }
    const offerings = await PurchasesModule.getOfferings();
    const current = offerings.current ?? offerings.all?.[REVENUECAT.offeringId];
    const rawPackages = current?.availablePackages ?? [];
    return { packages: rawPackages.map(mapPackage), rawPackages };
  },

  async purchase(pkg: any): Promise<PurchaseResult> {
    const PurchasesModule = getPurchases();
    if (!configured || !PurchasesModule || !pkg) {
      return { success: false, isPro: false, error: 'RevenueCat not configured' };
    }
    try {
      const result = await PurchasesModule.purchasePackage(pkg);
      return { success: true, isPro: this.isProFromCustomerInfo(result.customerInfo) };
    } catch (error: any) {
      if (error?.userCancelled) return { success: false, isPro: false, error: 'Purchase cancelled' };
      return { success: false, isPro: false, error: error?.message ?? String(error) };
    }
  },

  async restorePurchases(): Promise<PurchaseResult> {
    const PurchasesModule = getPurchases();
    if (!configured || !PurchasesModule) {
      return { success: false, isPro: false, error: 'RevenueCat not configured' };
    }
    try {
      const info = await PurchasesModule.restorePurchases();
      return { success: true, isPro: this.isProFromCustomerInfo(info) };
    } catch (error: any) {
      return { success: false, isPro: false, error: error?.message ?? String(error) };
    }
  },
};
