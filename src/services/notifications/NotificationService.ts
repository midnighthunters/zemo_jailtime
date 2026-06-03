import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { NOTIFICATION_TEMPLATES } from '@/src/data/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  configure() {
    return undefined;
  },

  async requestPermissions() {
    if (!Device.isDevice) return { granted: false, reason: 'Notifications require a physical device.' };
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) return { granted: true };
    const requested = await Notifications.requestPermissionsAsync();
    return { granted: requested.granted, reason: requested.granted ? undefined : 'Notification permission declined.' };
  },

  async scheduleLegalNotice(minutesFromNow = 5) {
    return Notifications.scheduleNotificationAsync({
      content: { title: 'Legal Notice', body: NOTIFICATION_TEMPLATES.legalNotice },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, minutesFromNow * 60),
      },
    });
  },

  async scheduleBedtimeLawNotification(time = '22:30') {
    const [hour, minute] = time.split(':').map(Number);
    return Notifications.scheduleNotificationAsync({
      content: { title: 'Bedtime Law Active', body: NOTIFICATION_TEMPLATES.bedtimeLaw },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  },

  async scheduleWeeklyReport() {
    return Notifications.scheduleNotificationAsync({
      content: { title: 'Court Report Ready', body: NOTIFICATION_TEMPLATES.courtReport },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1,
        hour: 9,
        minute: 0,
      },
    });
  },

  async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
