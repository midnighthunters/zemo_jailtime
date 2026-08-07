import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const REVENUECAT = {
  entitlementId: 'supreme_court',
  iosApiKey: String(extra.revenueCatIosApiKey ?? ''),
  offeringId: 'supreme_court_mode',
};
