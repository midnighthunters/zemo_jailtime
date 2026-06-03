import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { LawCard } from '@/src/components/LawCard';
import { OnboardingScene } from '@/src/components/OnboardingScene';
import { ONBOARDING_STEPS } from '@/src/data/onboarding';
import { useCourtStore } from '@/src/store/useCourtStore';
import { usePremiumStore } from '@/src/store/usePremiumStore';

export default function LawsOnboarding() {
  const router = useRouter();
  const laws = useCourtStore((state) => state.laws);
  const toggleLaw = useCourtStore((state) => state.toggleLaw);
  const isPro = usePremiumStore((state) => state.isPro);

  return (
    <OnboardingScene step={ONBOARDING_STEPS[4]}>
      <View style={styles.list}>
        {laws.slice(0, 3).map((law) => (
          <LawCard
            key={law.id}
            law={law}
            onToggle={() => {
              const result = toggleLaw(law.id, isPro);
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
    gap: 10,
  },
});
