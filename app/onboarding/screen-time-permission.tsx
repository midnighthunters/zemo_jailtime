/**
 * iOS Screen Time / Family Controls authorization screen.
 *
 * This is intentionally placed after the intake questionnaire screens
 * so the user understands the value proposition before being asked for
 * a sensitive system permission.
 *
 * On Android this screen maps to Usage Access — the PermissionChecklist
 * component already handles both platforms correctly.
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
import { getScreenTimeService } from '@/src/services/screenTime/ScreenTimeServiceFactory';
import { useCourtStore } from '@/src/store/useCourtStore';

const FEATURES = [
  { icon: '🛡️', text: 'Block distracting apps when your focus session is active' },
  { icon: '📊', text: 'Read your real daily screen time to build an accurate case file' },
  { icon: '⏰', text: 'Automatically enforce bedtime and focus-window laws' },
];

export default function ScreenTimePermissionOnboarding() {
  const router = useRouter();
  const setPermissionStatus = useCourtStore((state) => state.setPermissionStatus);
  const permStatuses = useCourtStore((state) => state.profile.permissionStatuses);
  const [loading, setLoading] = useState(false);

  const step = getOnboardingStep('screen_time_permission');
  const index = ONBOARDING_STEPS.findIndex((s) => s.id === step.id);
  const next = ONBOARDING_STEPS[index + 1];

  const isGranted =
    permStatuses.screenTimeAuthorization === 'granted' ||
    permStatuses.usageAccess === 'granted';

  const advance = () => {
    if (next) router.push(next.route as any);
  };

  const handleRequest = async () => {
    setLoading(true);
    try {
      const service = getScreenTimeService();
      const result = await service.requestPermissions();
      const status = result.granted ? 'granted' : 'missing';
      // Set the platform-appropriate permission ID
      if (process.env.EXPO_OS === 'ios') {
        setPermissionStatus('screenTimeAuthorization', status);
        setPermissionStatus('appShielding', status);
      } else {
        setPermissionStatus('usageAccess', status);
      }
      setPermissionStatus('backgroundMonitoring', status);
    } catch {
      // Non-fatal — advance anyway
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
          <AssetImage assetKey="ASSET_PHONE_LOCKED_CHEST" width={72} height={72} />
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>COURT BRIEFING {index + 1}/{ONBOARDING_STEPS.length}</Text>
            <Text style={styles.title}>Access Screen Time</Text>
            <Text style={styles.subtitle}>
              JailTime needs permission to see what you are doing on your phone — so it can defend you from it.
            </Text>
          </View>
        </View>

        {/* Feature list */}
        <View style={styles.features}>
          {FEATURES.map(({ icon, text }) => (
            <View key={text} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{icon}</Text>
              <Text style={styles.featureText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Status badge */}
        {isGranted ? (
          <View style={styles.grantedRow}>
            <StampBadge label="Access Granted" tone="success" />
            <Text style={styles.grantedNote}>Screen Time access is already authorised.</Text>
          </View>
        ) : null}

        {/* Info note */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {process.env.EXPO_OS === 'ios'
              ? 'iOS will show a Family Controls authorization sheet. This only needs to be approved once.'
              : 'Android will open the Usage Access settings. Enable JailTime in the list to continue.'}
          </Text>
        </View>
      </View>

      {/* CTAs */}
      <View style={styles.ctas}>
        <CourtButton
          title={isGranted ? 'Continue' : 'Grant Screen Time Access'}
          loading={loading}
          onPress={isGranted ? advance : handleRequest}
        />
        {!isGranted ? (
          <CourtButton title="Skip for Now" variant="ghost" onPress={advance} />
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
  features: {
    gap: 12,
    backgroundColor: 'rgba(58, 29, 17, 0.82)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 242, 210, 0.18)',
    padding: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
    lineHeight: 24,
  },
  featureText: {
    flex: 1,
    color: colors.cream,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
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
  infoBox: {
    backgroundColor: 'rgba(255, 200, 61, 0.12)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 61, 0.28)',
    padding: 12,
  },
  infoText: {
    color: colors.parchment,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  ctas: {
    gap: 10,
  },
});
