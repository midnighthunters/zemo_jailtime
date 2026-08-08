import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CourtButton } from '@/src/components/CourtButton';
import { OnboardingScene } from '@/src/components/OnboardingScene';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius } from '@/src/constants/theme';
import { getOnboardingStep, ONBOARDING_STEPS } from '@/src/data/onboarding';
import { getScreenTimeService } from '@/src/services/screenTime/ScreenTimeServiceFactory';
import { useCourtStore } from '@/src/store/useCourtStore';

const FEATURES = [
  'Lock distracting apps while a case is open',
  'Read your real daily screen time to build an accurate case file',
  'Enforce bedtime and focus-window laws automatically',
];

export default function ScreenTimePermissionOnboarding() {
  const router = useRouter();
  const setPermissionStatus = useCourtStore((state) => state.setPermissionStatus);
  const isGranted = useCourtStore(
    (state) => state.profile.permissionStatuses.screenTimeAuthorization === 'granted',
  );
  const [loading, setLoading] = useState(false);

  const step = getOnboardingStep('screen_time_permission');
  const index = ONBOARDING_STEPS.findIndex((item) => item.id === step.id);
  const next = ONBOARDING_STEPS[index + 1];

  const advance = () => {
    if (next) router.push(next.route as any);
  };

  const handleRequest = async () => {
    setLoading(true);
    try {
      const result = await getScreenTimeService().requestPermissions();
      const status = result.granted ? 'granted' : 'missing';
      setPermissionStatus('screenTimeAuthorization', status);
      setPermissionStatus('appShielding', status);
      setPermissionStatus('backgroundMonitoring', status);
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
            title={isGranted ? 'Continue' : 'Grant Screen Time Access'}
            loading={loading}
            onPress={isGranted ? advance : handleRequest}
          />
          {!isGranted ? <CourtButton title="Skip for Now" variant="ghost" onPress={advance} /> : null}
        </View>
      }
    >
      <View style={styles.content}>
        <View style={styles.list}>
          {FEATURES.map((text) => (
            <View key={text} style={styles.row}>
              <View style={styles.marker} />
              <Text style={styles.featureText}>{text}</Text>
            </View>
          ))}
        </View>

        {isGranted ? (
          <View style={styles.grantedRow}>
            <StampBadge label="Access Granted" tone="success" />
            <Text style={styles.grantedNote}>Screen Time access is already authorised.</Text>
          </View>
        ) : null}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            iOS will show a Family Controls authorization sheet. This only needs to be approved once.
          </Text>
        </View>
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
    paddingVertical: 7,
  },
  marker: {
    width: 4,
    height: 28,
    borderRadius: 2,
    backgroundColor: colors.blue,
  },
  featureText: { flex: 1, color: colors.label, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  grantedRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  grantedNote: { flex: 1, color: colors.labelSecondary, fontSize: 13, fontWeight: '500' },
  infoBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  infoText: { color: colors.labelSecondary, fontSize: 13, lineHeight: 19, fontWeight: '500' },
  ctas: { gap: 10 },
});
