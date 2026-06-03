import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const REVENUECAT = {
  entitlementId: 'supreme_court',
  iosApiKey: String(extra.revenueCatIosApiKey ?? ''),
  androidApiKey: String(extra.revenueCatAndroidApiKey ?? ''),
  offeringId: 'supreme_court_mode',
};
