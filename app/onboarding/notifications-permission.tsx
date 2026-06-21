/**
 * Push Notifications permission screen.
 *
 * Placed last in the permission sequence so the user has already
 * understood the app's value before being asked for notification access.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CourtButton } from '@/src/components/CourtButton';
import { StampBadge } from '@/src/components/StampBadge';
import { AssetImage } from '@/src/components/AssetImage';
import { colors, radius, spacing } from '@/src/constants/theme';
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
  const index = ONBOARDING_STEPS.findIndex((s) => s.id === step.id);
  const next = ONBOARDING_STEPS[index + 1];

  const isGranted = notificationStatus === 'granted';

  const advance = () => {
    if (next) router.push(next.route as any);
    // No more steps — complete onboarding (handled by OnboardingScene usually, but we're custom here)
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
    <View style={styles.root}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <AssetImage assetKey="ASSET_LEGAL_NOTICE_ENVELOPE" width={72} height={72} />
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>COURT BRIEFING {index + 1}/{ONBOARDING_STEPS.length}</Text>
            <Text style={styles.title}>Allow Notifications</Text>
            <Text style={styles.subtitle}>
              The court needs a way to reach you before things get out of hand.
            </Text>
          </View>
        </View>

        {/* Notification type cards */}
        <View style={styles.cards}>
          {NOTIFICATION_TYPES.map(({ icon, title, body }) => (
            <View key={title} style={styles.card}>
              <Text style={styles.cardIcon}>{icon}</Text>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardBody}>{body}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Already-granted state */}
        {isGranted ? (
          <View style={styles.grantedRow}>
            <StampBadge label="Notifications On" tone="success" />
            <Text style={styles.grantedNote}>You are already subscribed to court notices.</Text>
          </View>
        ) : null}
      </View>

      {/* CTAs */}
      <View style={styles.ctas}>
        <CourtButton
          title={isGranted ? 'Continue' : 'Allow Notifications'}
          loading={loading}
          onPress={isGranted ? advance : handleAllow}
        />
        {!isGranted ? (
          <CourtButton title="Not Now" variant="ghost" onPress={advance} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  content: {
    gap: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  title: {
    color: colors.cream,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    textShadowColor: colors.black,
    textShadowRadius: 12,
  },
  subtitle: {
    color: colors.parchment,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '800',
  },
  cards: {
    gap: 8,
    backgroundColor: 'rgba(58, 29, 17, 0.82)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 242, 210, 0.18)',
    padding: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardIcon: {
    fontSize: 22,
    lineHeight: 28,
    width: 28,
    textAlign: 'center',
  },
  cardCopy: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: '900',
  },
  cardBody: {
    color: colors.parchment,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  grantedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  grantedNote: {
    color: colors.parchment,
    fontSize: 13,
    fontWeight: '700',
  },
  ctas: {
    gap: 10,
  },
});
