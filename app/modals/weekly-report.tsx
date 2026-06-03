import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { EvidenceCard } from '@/src/components/EvidenceCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';

export default function WeeklyReportModal() {
  const router = useRouter();
  return (
    <CourtBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <CourtCard variant="purple">
          <View style={styles.hero}>
            <AssetImage assetKey="ASSET_WEEKLY_TRIAL_REPORT" width={136} height={136} />
            <View style={styles.text}>
              <StampBadge label="Advanced Report" tone="gold" />
              <Text style={styles.title}>Weekly Trial Report</Text>
              <Text style={styles.copy}>Advanced evidence reports require Supreme Court Mode.</Text>
            </View>
          </View>
        </CourtCard>
        <EvidenceCard exhibit="TREND" text="Short videos remain the strongest suspect this week." severity={4} assetKey="ASSET_EVIDENCE_BOARD_SCREEN_TIME" />
        <EvidenceCard exhibit="DANGER HOUR" text="Late evening is the highest-risk window for repeat opening." severity={3} assetKey="ASSET_DANGER_HOURS_CLOCK" />
        <EvidenceCard exhibit="PARDON" text="Two clean sessions moved the case toward dismissal." severity={2} assetKey="ASSET_FULL_PARDON_CERTIFICATE" />
        <CourtButton title="Upgrade for Full Report" variant="gold" onPress={() => router.replace('/modals/paywall')} />
        <CourtButton title="Close" variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 28,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    flex: 1,
    gap: 8,
  },
  title: {
    color: colors.cream,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
  },
  copy: {
    color: colors.parchment,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
});
