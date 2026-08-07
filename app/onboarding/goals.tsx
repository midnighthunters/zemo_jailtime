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
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 4,
  },
  chipSelected: {
    backgroundColor: colors.blueLight,
    borderColor: colors.blue,
  },
  chipLabel: {
    color: colors.label,
    fontSize: 14,
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: colors.blueDark,
  },
  chipDesc: {
    color: colors.labelSecondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '400',
  },
  chipDescSelected: {
    color: colors.blueDark,
    opacity: 0.72,
  },
});
