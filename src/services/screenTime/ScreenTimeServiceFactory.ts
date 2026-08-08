import { IosScreenTimeService } from '@/src/services/screenTime/IosScreenTimeService';

/**
 * There is one screen-time implementation. The mock service was removed so that
 * nothing but real, user-selected device apps can ever be placed under the
 * court's authority. Outside a native build every call degrades to a safe no-op
 * and reports "not available" rather than inventing data.
 */
export function getScreenTimeService() {
  return IosScreenTimeService;
}
