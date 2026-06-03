import { create } from 'zustand';
import { RevenueCatService } from '@/src/services/revenue/RevenueCatService';
import type { PaywallPackage } from '@/src/types/revenue';

type PremiumState = {
  isConfigured: boolean;
  isLoading: boolean;
  isPro: boolean;
  packages: PaywallPackage[];
  rawPackages: any[];
  error?: string;
  initializeRevenueCat: () => Promise<void>;
  refreshPremiumStatus: () => Promise<void>;
  purchase: (packageIdentifier: string) => Promise<void>;
  restore: () => Promise<void>;
  setMockPro: (value: boolean) => void;
};

export const usePremiumStore = create<PremiumState>((set, get) => ({
  isConfigured: false,
  isLoading: false,
  isPro: false,
  packages: [],
  rawPackages: [],

  async initializeRevenueCat() {
    set({ isLoading: true, error: undefined });
    const configured = await RevenueCatService.configure();
    const offerings = await RevenueCatService.getOfferings();
    let isPro = false;
    if (configured.configured) {
      const info = await RevenueCatService.getCustomerInfo();
      isPro = info.isPro;
    }
    set({
      isConfigured: configured.configured,
      packages: offerings.packages,
      rawPackages: offerings.rawPackages,
      isPro,
      isLoading: false,
      error: configured.configured ? undefined : configured.reason,
    });
  },

  async refreshPremiumStatus() {
    if (!RevenueCatService.isConfigured()) return;
    const info = await RevenueCatService.getCustomerInfo();
    set({ isPro: info.isPro });
  },

  async purchase(packageIdentifier) {
    const state = get();
    const index = state.packages.findIndex((item) => item.identifier === packageIdentifier);
    const rawPackage = state.rawPackages[index];
    set({ isLoading: true, error: undefined });
    const result = await RevenueCatService.purchase(rawPackage);
    set({ isLoading: false, isPro: result.isPro || state.isPro, error: result.error });
  },

  async restore() {
    set({ isLoading: true, error: undefined });
    const result = await RevenueCatService.restorePurchases();
    set({ isLoading: false, isPro: result.isPro, error: result.error });
  },

  setMockPro(value) {
    if (__DEV__) set({ isPro: value, error: value ? undefined : get().error });
  },
}));
