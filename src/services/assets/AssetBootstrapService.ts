import { Asset } from 'expo-asset';
import { FocusCourtAssets, OnboardingArt } from '@/src/constants/assets';

export const AssetBootstrapService = {
  async preload() {
    const focusAssets = Object.values(FocusCourtAssets);
    const onboardingAssets = Object.values(OnboardingArt);
    await Asset.loadAsync([...focusAssets, ...onboardingAssets]);
  },
};
