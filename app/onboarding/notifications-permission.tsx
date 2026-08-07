import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CourtButton } from '@/src/components/CourtButton';
import { OnboardingScene } from '@/src/components/OnboardingScene';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius } from '@/src/constants/theme';
import { getOnboardingStep, ONBOARDING_STEPS } from '@/src/data/onboarding';
import { NotificationService } from '@/src/services/notifications/NotificationService';
import { useCourtStore } from '@/src/store/useCourtStore';

const NOTIFICATION_TYPES = [
  { icon: '⚠️', title: 'Limit Warnings', body: 'Alert before you hit your daily app limit.' },
  { icon: '🌙', title: 'Bedtime Court Notices', body: 'Reminder when your bedtime law is about to activate.' },
  { icon: '📋', title: 'Weekly Trial Report', body: 'Your screen time verdict every Monday morning.' },
  { icon: '🏅', title: 'Parole & Streaks', body: 'Celebration when you earn a clean record.' },
];

export default function NotificationsPermissionOnboarding() {
  const router = useRouter();
  const setPermissionStatus = useCourtStore((state) => state.setPermissionStatus);
  const notificationStatus = useCourtStore((state) => state.profile.permissionStatuses.notifications);
  const [loading, setLoading] = useState(false);

  const step = getOnboardingStep('notifications_permission');
  const index = ONBOARDING_STEPS.findIndex((item) => item.id === step.id);
  const next = ONBOARDING_STEPS[index + 1];
  const isGranted = notificationStatus === 'granted';

  const advance = () => {
    if (next) router.push(next.route as any);
  };

  const handleAllow = async () => {
    setLoading(true);
    try {
      const result = await NotificationService.requestPermissions();
      setPermissionStatus('notifications', result.granted ? 'granted' : 'missing');
    } catch {
      setPermissionStatus('notifications', 'missing');
    } finally {
      setLoading(false);
      advance();
    }
  };

  return (
    <OnboardingScene
      step={step}
      overrideCta={
        <View style={styles.ctas}>
          <CourtButton
            title={isGranted ? 'Continue' : 'Allow Notifications'}
            loading={loading}
            onPress={isGranted ? advance : handleAllow}
          />
          {!isGranted ? <CourtButton title="Not Now" variant="ghost" onPress={advance} /> : null}
        </View>
      }
    >
      <View style={styles.content}>
        <View style={styles.list}>
          {NOTIFICATION_TYPES.map(({ icon, title, body }) => (
            <View key={title} style={styles.row}>
              <View style={styles.iconStage}><Text style={styles.icon}>{icon}</Text></View>
              <View style={styles.copy}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.body}>{body}</Text>
              </View>
            </View>
          ))}
        </View>
        {isGranted ? (
          <View style={styles.grantedRow}>
            <StampBadge label="Notifications On" tone="success" />
            <Text style={styles.grantedNote}>You are already subscribed to court notices.</Text>
          </View>
        ) : null}
      </View>
    </OnboardingScene>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16 },
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  iconStage: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 19 },
  copy: { flex: 1, gap: 3 },
  title: { color: colors.label, fontSize: 14, fontWeight: '700' },
  body: { color: colors.labelSecondary, fontSize: 12, lineHeight: 17, fontWeight: '500' },
  grantedRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  grantedNote: { flex: 1, color: colors.labelSecondary, fontSize: 13, fontWeight: '500' },
  ctas: { gap: 10 },
});
