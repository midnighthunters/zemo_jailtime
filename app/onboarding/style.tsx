import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { FieldLabel, OptionCard } from '@/src/components/OnboardingIntake';
import { OnboardingScene } from '@/src/components/OnboardingScene';
import { getOnboardingStep } from '@/src/data/onboarding';
import { useCourtStore } from '@/src/store/useCourtStore';
import { usePremiumStore } from '@/src/store/usePremiumStore';
import type { HumorLevel, StrictnessLevel } from '@/src/types/court';

const strictnessOptions: { id: StrictnessLevel; title: string; description: string; meta?: string }[] = [
  {
    id: 'soft',
    title: 'Merciful',
    description: 'Gentle nudges, lighter sentences, and room for messy days.',
  },
  {
    id: 'balanced',
    title: 'Balanced',
    description: 'A fair court: firm when it matters, forgiving when life happens.',
  },
  {
    id: 'brutal',
    title: 'Maximum security',
    description: 'Harder sentences for repeat offenses and fewer loopholes.',
    meta: 'Supreme Court Mode',
  },
];

const humorOptions: { id: HumorLevel; title: string; description: string }[] = [
  {
    id: 'light',
    title: 'Dry legal humor',
    description: 'Quick remarks without too much theatrical flair.',
  },
  {
    id: 'sarcastic',
    title: 'Sharp cross-examination',
    description: 'A little bite when the evidence gets embarrassing.',
  },
  {
    id: 'dramatic',
    title: 'Full courtroom drama',
    description: 'Big verdict energy, loud stamps, and serious nonsense.',
  },
];

export default function StyleOnboarding() {
  const router = useRouter();
  const profile = useCourtStore((state) => state.profile);
  const setStrictness = useCourtStore((state) => state.setStrictness);
  const updateProfile = useCourtStore((state) => state.updateProfile);
  const isPro = usePremiumStore((state) => state.isPro);

  return (
    <OnboardingScene step={getOnboardingStep('style')}>
      <View style={styles.form}>
        <View style={styles.section}>
          <FieldLabel title="Court strictness" caption="How hard should the app push when your habits object?" />
          <View style={styles.options}>
            {strictnessOptions.map((option) => (
              <OptionCard
                key={option.id}
                title={option.title}
                description={option.description}
                meta={option.meta}
                selected={profile.strictness === option.id}
                onPress={() => {
                  const result = setStrictness(option.id, isPro);
                  if (!result.allowed) router.push('/modals/paywall');
                }}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <FieldLabel title="Courtroom tone" caption="Choose how the app talks while keeping you honest." />
          <View style={styles.options}>
            {humorOptions.map((option) => (
              <OptionCard
                key={option.id}
                title={option.title}
                description={option.description}
                selected={profile.humorLevel === option.id}
                onPress={() => updateProfile({ humorLevel: option.id })}
              />
            ))}
          </View>
        </View>
      </View>
    </OnboardingScene>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 18,
  },
  section: {
    gap: 10,
  },
  options: {
    gap: 8,
  },
});
