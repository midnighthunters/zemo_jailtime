import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { CourtButton } from '@/src/components/CourtButton';
import { OnboardingScene } from '@/src/components/OnboardingScene';
import { ProtectedAppsCard } from '@/src/components/ProtectedAppsCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius } from '@/src/constants/theme';
import { getOnboardingStep, ONBOARDING_STEPS } from '@/src/data/onboarding';
import { useCourtStore } from '@/src/store/useCourtStore';

/**
 * Real app selection during onboarding. This step used to offer a list of
 * invented placeholder apps; it now opens Apple's picker so the court is only
 * ever pointed at apps that actually exist on this device.
 */
export default function SuspectsOnboarding() {
  const router = useRouter();
  const appSelection = useCourtStore((state) => state.appSelection);

  const step = getOnboardingStep('suspects');
  const index = ONBOARDING_STEPS.findIndex((item) => item.id === step.id);
  const next = ONBOARDING_STEPS[index + 1];
  const total = appSelection.applications + appSelection.categories + appSelection.webDomains;

  const advance = () => {
    if (next) router.push(next.route as any);
  };

  return (
    <OnboardingScene
      step={step}
      overrideCta={
        <View style={styles.ctas}>
          <CourtButton title={total > 0 ? 'Continue' : 'Skip for Now'} onPress={advance} />
        </View>
      }
    >
      <View style={styles.content}>
        <ProtectedAppsCard />

        {total > 0 ? (
          <View style={styles.grantedRow}>
            <StampBadge label="Selection saved" tone="success" />
            <Text style={styles.grantedNote}>The court knows what to watch.</Text>
          </View>
        ) : (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              You can pick your apps later from the Culprits tab. Until then the court has nothing to
              enforce.
            </Text>
          </View>
        )}
      </View>
    </OnboardingScene>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14 },
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
