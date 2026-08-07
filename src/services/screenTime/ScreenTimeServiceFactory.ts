import { Platform } from 'react-native';
import { IosScreenTimeService } from '@/src/services/screenTime/IosScreenTimeService';
import { MockScreenTimeService } from '@/src/services/screenTime/MockScreenTimeService';

export function getScreenTimeService() {
  if (process.env.EXPO_PUBLIC_USE_MOCK_SCREEN_TIME === '1') return MockScreenTimeService;
  if (Platform.OS === 'ios') return IosScreenTimeService;
  return MockScreenTimeService;
}
