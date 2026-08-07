/**
 * iOS App Tracking Transparency permission screen.
 *
 * Shown before the profile + evidence screens so the user consents to
 * cross-app activity tracking before we collect any personal data.
 */
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CourtButton } from '@/src/components/CourtButton';
import { AssetImage } from '@/src/components/AssetImage';
import { OnboardingScene } from '@/src/components/OnboardingScene';
import { colors, radius, spacing } from '@/src/constants/theme';
import { getOnboardingStep, ONBOARDING_STEPS } from '@/src/data/onboarding';
import { useCourtStore } from '@/src/store/useCourtStore';

const BULLETS = [
  'Understand which app habits hurt your focus most',
  'Show you accurate comparisons vs similar users',
  'Build a sharper, personalised focus plan',
];

export default function TrackingOnboarding() {
  const router = useRouter();
  const setPermissionStatus = useCourtStore((state) => state.setPermissionStatus);
  const [loading, setLoading] = useState(false);

  const step = getOnboardingStep('tracking');
  const index = ONBOARDING_STEPS.findIndex((s) => s.id === step.id);
  const next = ONBOARDING_STEPS[index + 1];

  const advance = () => {
    if (next) router.push(next.route as any);
  };

  const handleAllow = async () => {
    setLoading(true);
    try {
      const { status } = await requestTrackingPermissionsAsync();
      setPermissionStatus('backgroundMonitoring', status === 'granted' ? 'granted' : 'missing');
    } catch {
      // Non-fatal — proceed regardless
    } finally {
      setLoading(false);
      advance();
    }
  };

  return (
    <OnboardingScene
      step={step}
      overrideCta={
        <View style={styles.ctaGroup}>
          <CourtButton title="Allow Tracking" loading={loading} onPress={handleAllow} />
          <CourtButton title="Not Now" variant="ghost" onPress={advance} />
        </View>
      }
    >
      <View style={styles.panel}>
        <View style={styles.iconRow}>
          <AssetImage assetKey="ASSET_COURT_AUTHORITY_PERMISSION" width={56} height={56} />
          <View style={styles.copy}>
            <Text style={styles.label}>WHY WE ASK</Text>
            <Text style={styles.body}>
              Allow JailTime to track your activity across other companies' apps and websites to help us:
            </Text>
          </View>
        </View>
        <View style={styles.bullets}>
          {BULLETS.map((bullet) => (
            <View key={bullet} style={styles.bulletRow}>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.fine}>
          Your data is never sold. You can change this in iOS Settings → Privacy → Tracking at any time.
        </Text>
      </View>
    </OnboardingScene>
  );
}

const styles = StyleSheet.create({
  ctaGroup: {
    gap: 10,
  },
  panel: {
    gap: spacing.md,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  body: {
    color: colors.cream,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  bullets: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    color: colors.parchment,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  fine: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
