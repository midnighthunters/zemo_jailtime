import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OnboardingScene } from '@/src/components/OnboardingScene';
import { colors, radius } from '@/src/constants/theme';
import { DREAM_OPTIONS, getOnboardingStep } from '@/src/data/onboarding';
import { useCourtStore } from '@/src/store/useCourtStore';

export default function DreamsOnboarding() {
  const dreams = useCourtStore((state) => state.profile.dreams);
  const toggleDream = useCourtStore((state) => state.toggleDream);

  return (
    <OnboardingScene step={getOnboardingStep('dreams')}>
      <View style={styles.grid}>
        {DREAM_OPTIONS.map((dream) => {
          const selected = dreams.includes(dream.id);
          return (
            <Pressable key={dream.id} onPress={() => toggleDream(dream.id)} style={[styles.chip, selected && styles.selected]}>
              <Text style={[styles.chipText, selected && styles.selectedText]}>{dream.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingScene>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 242, 210, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 242, 210, 0.18)',
  },
  selected: {
    backgroundColor: colors.gold,
    borderColor: colors.deepGold,
  },
  chipText: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '900',
  },
  selectedText: {
    color: colors.ink,
  },
});
