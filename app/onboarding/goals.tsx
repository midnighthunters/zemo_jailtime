import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OnboardingScene } from '@/src/components/OnboardingScene';
import { colors, radius } from '@/src/constants/theme';
import { FOCUS_GOAL_OPTIONS, getOnboardingStep } from '@/src/data/onboarding';
import { useCourtStore } from '@/src/store/useCourtStore';
import type { FocusGoal } from '@/src/types/court';

export default function GoalsOnboarding() {
  const focusGoals = useCourtStore((state) => state.profile.focusGoals ?? []);
  const toggleFocusGoal = useCourtStore((state) => state.toggleFocusGoal);

  return (
    <OnboardingScene step={getOnboardingStep('goals')}>
      <View style={styles.grid}>
        {FOCUS_GOAL_OPTIONS.map((option) => {
          const selected = focusGoals.includes(option.id as FocusGoal);
          return (
            <Pressable
              key={option.id}
              onPress={() => toggleFocusGoal(option.id as FocusGoal)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {option.label}
              </Text>
              <Text style={[styles.chipDesc, selected && styles.chipDescSelected]}>
                {option.description}
              </Text>
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
    flexBasis: '47%',
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 242, 210, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 242, 210, 0.18)',
    gap: 4,
  },
  chipSelected: {
    backgroundColor: colors.gold,
    borderColor: colors.deepGold,
  },
  chipLabel: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: '900',
  },
  chipLabelSelected: {
    color: colors.ink,
  },
  chipDesc: {
    color: colors.parchment,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  chipDescSelected: {
    color: colors.ink,
    opacity: 0.72,
  },
});
