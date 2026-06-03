import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CharacterBubble } from '@/src/components/CharacterBubble';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { ParoleMeter } from '@/src/components/ParoleMeter';
import { ProgressDocket } from '@/src/components/ProgressDocket';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { StampBadge } from '@/src/components/StampBadge';
import { SuspectAppCard } from '@/src/components/SuspectAppCard';
import { colors } from '@/src/constants/theme';
import { Dialogues } from '@/src/data/dialogues';
import { useCourtStore } from '@/src/store/useCourtStore';
import { statusLabel } from '@/src/utils/sentence';

export default function CourtroomTab() {
  const router = useRouter();
  const activeCase = useCourtStore((state) => state.activeCase);
  const profile = useCourtStore((state) => state.profile);
  const suspects = useCourtStore((state) => state.suspects);
  const charges = useCourtStore((state) => state.charges);
  const simulateAppOpen = useCourtStore((state) => state.simulateAppOpen);
  const resetCourtDay = useCourtStore((state) => state.resetCourtDay);
  const selectedSuspects = suspects.filter((suspect) => suspect.isSelected);
  const worst = [...suspects].sort((a, b) => b.dailyUsageMinutes - a.dailyUsageMinutes)[0];
  const paroleChance = Math.min(96, 34 + profile.parolePoints + profile.cleanRecordStreak * 6);
  const statusTone = activeCase.status === 'jailed' || activeCase.status === 'charged' ? 'danger' : activeCase.status === 'parole' ? 'success' : 'gold';

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScreenHeader
          eyebrow="FOCUS COURT"
          title="Courtroom"
          subtitle="Case #042: The People vs. Your Screen Habits"
          assetKey="ASSET_APP_LOGO_FOCUS_COURT"
        />

        <CourtCard variant="dark" style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <StampBadge label={statusLabel(activeCase.status)} tone={statusTone} />
              <Text style={styles.caseTitle}>{activeCase.title}</Text>
              <Text style={styles.caseCopy}>The court is watching your focus record.</Text>
            </View>
            <AssetImage assetKey="ASSET_JUDGE_LION_GAVEL" width={148} height={148} />
          </View>
          <View style={styles.bench}>
            <AssetImage assetKey={activeCase.status === 'jailed' ? 'ASSET_DEFENDANT_JAIL_BARS' : 'ASSET_DEFENDANT_NERVOUS'} width={128} height={128} />
            <AssetImage assetKey="ASSET_PROSECUTOR_FOX_POINT" width={106} height={106} />
            <AssetImage assetKey="ASSET_EVIDENCE_BOARD_SCREEN_TIME" width={106} height={106} />
          </View>
        </CourtCard>

        <ProgressDocket
          items={[
            { label: 'Clean streak', value: profile.cleanRecordStreak },
            { label: 'Focus coins', value: profile.focusCoins },
            { label: 'Charges', value: charges.length },
          ]}
        />

        <CourtCard variant="wood" assetKey="ASSET_CLEAN_RECORD_MEDAL">
          <ParoleMeter value={paroleChance} label="Parole readiness" />
        </CourtCard>

        <CharacterBubble assetKey="ASSET_OWL_JUSTICE_INSPECT" name="Owl Justice" line={Dialogues.owlJustice[1]} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Simulate App Open</Text>
            <CourtButton title="Reset Day" variant="ghost" small onPress={resetCourtDay} />
          </View>
          <View style={styles.suspects}>
            {selectedSuspects.map((suspect) => (
              <SuspectAppCard
                key={suspect.id}
                suspect={suspect}
                onPress={() => {
                  const charge = simulateAppOpen(suspect.id);
                  if (charge) router.push('/modals/charges-filed');
                }}
              />
            ))}
          </View>
        </View>

        <CourtCard variant="parchment">
          <Text style={styles.darkLabel}>WORST OFFENDER PREVIEW</Text>
          <Text style={styles.darkTitle}>{worst.displayName}</Text>
          <Text style={styles.darkCopy}>Exhibit A: {worst.dailyUsageMinutes || 47} minutes vanished into {worst.displayName.toLowerCase()}.</Text>
        </CourtCard>
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 110,
  },
  hero: {
    minHeight: 300,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroCopy: {
    flex: 1,
    gap: 10,
  },
  caseTitle: {
    color: colors.cream,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
  },
  caseCopy: {
    color: colors.parchment,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  bench: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionTitle: {
    color: colors.cream,
    fontSize: 19,
    fontWeight: '900',
  },
  suspects: {
    gap: 9,
  },
  darkLabel: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '900',
  },
  darkTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  darkCopy: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
});
