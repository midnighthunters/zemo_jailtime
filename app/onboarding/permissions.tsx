import { StyleSheet, Text, View } from 'react-native';
import { CourtButton } from '@/src/components/CourtButton';
import { OnboardingScene } from '@/src/components/OnboardingScene';
import { colors } from '@/src/constants/theme';
import { ONBOARDING_STEPS } from '@/src/data/onboarding';
import { NotificationService } from '@/src/services/notifications/NotificationService';

export default function PermissionsOnboarding() {
  return (
    <OnboardingScene step={ONBOARDING_STEPS[1]}>
      <View style={styles.list}>
        {['Evidence summaries', 'Bedtime legal notices', 'Parole opportunities'].map((item) => (
          <Text key={item} style={styles.item}>{item}</Text>
        ))}
      </View>
      <CourtButton title="Request Notice Permission" variant="ghost" small onPress={() => NotificationService.requestPermissions()} />
    </OnboardingScene>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
    marginBottom: 12,
  },
  item: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: '800',
  },
});
