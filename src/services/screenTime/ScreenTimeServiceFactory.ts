import { AndroidUsageStatsService } from '@/src/services/screenTime/AndroidUsageStatsService';
import { IosScreenTimeService } from '@/src/services/screenTime/IosScreenTimeService';
import { MockScreenTimeService } from '@/src/services/screenTime/MockScreenTimeService';

export function getScreenTimeService() {
  if (process.env.EXPO_PUBLIC_USE_MOCK_SCREEN_TIME === '1') return MockScreenTimeService;
  if (process.env.EXPO_OS === 'ios') return IosScreenTimeService;
  if (process.env.EXPO_OS === 'android') return AndroidUsageStatsService;
  return MockScreenTimeService;
}
