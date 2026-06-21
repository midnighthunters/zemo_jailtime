import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius, shadows } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';

export default function ChargesFiledModal() {
  const router = useRouter();
  const charge = useCourtStore(
    (state) => state.charges.find((item) => item.id === state.activeChargeId) ?? state.charges[0],
  );
  const laws = useCourtStore((state) => state.laws);
  const suspects = useCourtStore((state) => state.suspects);
  const requestMercy = useCourtStore((state) => state.requestMercy);
  const law = laws.find((item) => item.id === charge?.lawId);
  const suspect = suspects.find((item) => item.id === charge?.appId);

  return (
    <CourtBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Hero glass card ──────────────────────────────────────── */}
        <CourtCard variant="red">
          <View style={styles.hero}>
            <AssetImage assetKey="ASSET_CHARGES_FILED_SCROLL" width={130} height={130} />
            <View style={styles.heroText}>
              <StampBadge label="Charges Filed" tone="danger" />
              <Text style={styles.title}>{charge?.title ?? 'Charges Filed'}</Text>
              <Text style={styles.copy}>{charge?.description ?? 'Evidence submitted.'}</Text>
            </View>
          </View>
        </CourtCard>

        {/* ── Violated law card ─────────────────────────────────────── */}
        <CourtCard variant="glass">
          <View style={styles.evidence}>
            <AssetImage assetKey="ASSET_PROSECUTOR_FOX_POINT" width={96} height={96} />
            <View style={styles.evidenceText}>
              <Text style={styles.evidenceLabel}>VIOLATED LAW</Text>
              <Text style={styles.evidenceTitle}>{law?.name ?? 'Focus Law'}</Text>
              <Text style={styles.evidenceCopy}>{charge?.evidenceLine ?? 'The data does not lie.'}</Text>
              <View style={styles.sentenceRow}>
                <StampBadge
                  label={`Sentence: ${charge?.punishmentMinutes ?? 8} min`}
                  tone="danger"
                />
              </View>
            </View>
          </View>
        </CourtCard>

        {/* ── Prosecutor line ───────────────────────────────────────── */}
        <CourtCard variant="orange">
          <View style={styles.row}>
            <AssetImage assetKey="ASSET_DEFENDANT_CAUGHT_PHONE" width={88} height={88} />
            <View style={styles.rowText}>
              <Text style={styles.quoteLabel}>PROSECUTOR</Text>
              <Text style={styles.quoteLine}>
                {law?.prosecutorLine ??
                  `The ${suspect?.displayName ?? 'app'} was opened with suspicious confidence.`}
              </Text>
            </View>
            <AssetImage assetKey="ASSET_GUILTY_STAMP" width={60} height={60} />
          </View>
        </CourtCard>

        {/* ── Actions ───────────────────────────────────────────────── */}
        <View style={styles.buttons}>
          <CourtButton
            title="Accept Sentence"
            variant="destructive"
            onPress={() => router.push('/modals/sentence')}
          />
          <CourtButton
            title="Request Mercy Pass"
            variant="ghost"
            onPress={() => {
              const granted = requestMercy(charge?.id);
              router.replace(granted ? '/modals/parole-granted' : '/modals/paywall');
            }}
          />
        </View>
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 32,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroText: {
    flex: 1,
    gap: 10,
  },
  title: {
    color: colors.label,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: 0.35,
  },
  copy: {
    color: colors.labelSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  evidence: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  evidenceText: {
    flex: 1,
    gap: 6,
  },
  evidenceLabel: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  evidenceTitle: {
    color: colors.label,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  evidenceCopy: {
    color: colors.labelSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  sentenceRow: {
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowText: {
    flex: 1,
    gap: 5,
  },
  quoteLabel: {
    color: colors.orangeDark,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  quoteLine: {
    color: colors.label,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  buttons: {
    gap: 10,
    marginTop: 2,
  },
});
