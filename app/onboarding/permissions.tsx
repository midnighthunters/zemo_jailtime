import { StyleSheet, Text, View } from 'react-native';
import { OnboardingScene } from '@/src/components/OnboardingScene';
import { PermissionChecklist } from '@/src/components/PermissionChecklist';
import { colors } from '@/src/constants/theme';
import { getOnboardingStep } from '@/src/data/onboarding';

export default function PermissionsOnboarding() {
  return (
    <OnboardingScene step={getOnboardingStep('evidence')}>
      <View style={styles.list}>
        <Text style={styles.item}>Production blocking needs usage evidence, notifications, and shield authority.</Text>
        <PermissionChecklist compact limit={4} />
      </View>
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
    lineHeight: 20,
    fontWeight: '800',
  },
});
