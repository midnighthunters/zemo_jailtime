import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FieldLabel, OptionCard } from '@/src/components/OnboardingIntake';
import { OnboardingScene } from '@/src/components/OnboardingScene';
import { colors, radius } from '@/src/constants/theme';
import { getOnboardingStep } from '@/src/data/onboarding';
import { useCourtStore } from '@/src/store/useCourtStore';
import type { DangerWindow } from '@/src/types/court';

const bedtimeOptions = ['21:30', '22:30', '23:30', '00:30'];
const wakeOptions = ['05:30', '06:30', '07:30', '08:30'];
const screenGoalOptions = [60, 90, 120, 180];

const dangerWindowOptions: { id: DangerWindow; title: string; description: string }[] = [
  { id: 'morning', title: 'Morning drift', description: 'The day starts with one little check.' },
  { id: 'afternoon', title: 'Afternoon slump', description: 'Energy dips and apps start arguing their case.' },
  { id: 'evening', title: 'Evening escape', description: 'Work is done, and the phone starts looking innocent.' },
  { id: 'late_night', title: 'Late-night spiral', description: 'Bedtime arrives, but the feed objects.' },
];

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function TimeChip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function RoutineOnboarding() {
  const profile = useCourtStore((state) => state.profile);
  const updateProfile = useCourtStore((state) => state.updateProfile);
  const setBedtime = useCourtStore((state) => state.setBedtime);
  const setWakeTime = useCourtStore((state) => state.setWakeTime);

  return (
    <OnboardingScene step={getOnboardingStep('routine')}>
      <View style={styles.form}>
        <View style={styles.section}>
          <FieldLabel title="Quiet hours" caption="Pick the sleep window the court should defend first." />
          <View style={styles.timeRows}>
            <View style={styles.timeGroup}>
              <Text style={styles.timeLabel}>Bed</Text>
              <View style={styles.chips}>
                {bedtimeOptions.map((time) => (
                  <TimeChip key={time} label={time} selected={profile.bedtime === time} onPress={() => setBedtime(time)} />
                ))}
              </View>
            </View>
            <View style={styles.timeGroup}>
              <Text style={styles.timeLabel}>Wake</Text>
              <View style={styles.chips}>
                {wakeOptions.map((time) => (
                  <TimeChip key={time} label={time} selected={profile.wakeTime === time} onPress={() => setWakeTime(time)} />
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <FieldLabel title="Daily screen target" caption="This becomes the first benchmark for progress reports." />
          <View style={styles.chips}>
            {screenGoalOptions.map((minutes) => (
              <TimeChip
                key={minutes}
                label={`${minutes} min`}
                selected={profile.dailyScreenGoalMinutes === minutes}
                onPress={() => updateProfile({ dailyScreenGoalMinutes: minutes })}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <FieldLabel title="Danger window" caption="When does distraction usually make its strongest case?" />
          <View style={styles.options}>
            {dangerWindowOptions.map((option) => (
              <OptionCard
                key={option.id}
                title={option.title}
                description={option.description}
                selected={profile.dangerWindow === option.id}
                onPress={() => updateProfile({ dangerWindow: option.id })}
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
  timeRows: {
    gap: 12,
  },
  timeGroup: {
    gap: 7,
  },
  timeLabel: {
    color: colors.parchment,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 38,
    minWidth: 74,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 242, 210, 0.2)',
    backgroundColor: 'rgba(255, 242, 210, 0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.gold,
    borderColor: colors.deepGold,
  },
  chipText: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '900',
  },
  chipTextSelected: {
    color: colors.ink,
  },
  options: {
    gap: 8,
  },
});
