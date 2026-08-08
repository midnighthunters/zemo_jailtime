import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtCard } from '@/src/components/CourtCard';
import { ParoleMeter } from '@/src/components/ParoleMeter';
import { ProgressDocket } from '@/src/components/ProgressDocket';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';
import { statusLabel } from '@/src/utils/sentence';

export default function CourtroomTab() {
  // ── store ──────────────────────────────────────────────────────────────────
  const activeCase = useCourtStore((state) => state.activeCase);
  const profile = useCourtStore((state) => state.profile);
  const charges = useCourtStore((state) => state.charges);
  const paroleChance = Math.min(96, 34 + profile.parolePoints + profile.cleanRecordStreak * 6);
  const statusTone =
    activeCase.status === 'jailed' || activeCase.status === 'charged'
      ? 'danger'
      : activeCase.status === 'parole'
      ? 'success'
      : 'blue';

  return (
    <CourtBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <ScreenHeader
          eyebrow="FOCUS COURT"
          title="Courtroom"
          subtitle="Case #042: The People vs. Your Screen Habits"
          assetKey="ASSET_APP_LOGO_FOCUS_COURT"
        />

        {/* ── Hero case card ───────────────────────────────────────── */}
        <CourtCard variant="glass" style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <StampBadge label={statusLabel(activeCase.status)} tone={statusTone} />
              <Text style={styles.caseTitle}>{activeCase.title}</Text>
              <Text style={styles.caseCopy}>The court is watching your focus record.</Text>
            </View>
            <AssetImage assetKey="ASSET_JUDGE_LION_GAVEL" width={130} height={130} />
          </View>
          <View style={styles.bench}>
            <AssetImage
              assetKey={
                activeCase.status === 'jailed'
                  ? 'ASSET_DEFENDANT_JAIL_BARS'
                  : 'ASSET_DEFENDANT_NERVOUS'
              }
              width={110}
              height={110}
            />
            <AssetImage assetKey="ASSET_PROSECUTOR_FOX_POINT" width={92} height={92} />
            <AssetImage assetKey="ASSET_EVIDENCE_BOARD_SCREEN_TIME" width={92} height={92} />
          </View>
        </CourtCard>

        {/* ── Stats docket ─────────────────────────────────────────── */}
        <ProgressDocket
          items={[
            { label: 'Clean streak', value: profile.cleanRecordStreak },
            { label: 'Focus coins', value: profile.focusCoins },
            { label: 'Charges', value: charges.length },
          ]}
        />

        {/* ── Parole meter ─────────────────────────────────────────── */}
        <CourtCard variant="blue" assetKey="ASSET_CLEAN_RECORD_MEDAL">
          <ParoleMeter value={paroleChance} label="Parole readiness" />
        </CourtCard>


      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 110,
  },
  hero: { minHeight: 260 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroCopy: { flex: 1, gap: 10 },
  caseTitle: { color: colors.label, fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.3 },
  caseCopy: { color: colors.labelSecondary, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  bench: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', marginTop: 8 },
});
