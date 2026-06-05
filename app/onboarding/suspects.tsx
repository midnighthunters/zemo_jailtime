import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { OnboardingScene } from '@/src/components/OnboardingScene';
import { SuspectAppCard } from '@/src/components/SuspectAppCard';
import { getOnboardingStep } from '@/src/data/onboarding';
import { useCourtStore } from '@/src/store/useCourtStore';
import { usePremiumStore } from '@/src/store/usePremiumStore';

export default function SuspectsOnboarding() {
  const router = useRouter();
  const suspects = useCourtStore((state) => state.suspects);
  const toggleSuspect = useCourtStore((state) => state.toggleSuspect);
  const isPro = usePremiumStore((state) => state.isPro);

  return (
    <OnboardingScene step={getOnboardingStep('suspects')}>
      <View style={styles.list}>
        {suspects.slice(0, 6).map((suspect) => (
          <SuspectAppCard
            key={suspect.id}
            suspect={suspect}
            compact
            onPress={() => {
              const result = toggleSuspect(suspect.id, isPro);
              if (!result.allowed) router.push('/modals/paywall');
            }}
          />
        ))}
      </View>
    </OnboardingScene>
  );
}

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
