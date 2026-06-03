import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';

export default function ChargesFiledModal() {
  const router = useRouter();
  const charge = useCourtStore((state) => state.charges.find((item) => item.id === state.activeChargeId) ?? state.charges[0]);
  const laws = useCourtStore((state) => state.laws);
  const suspects = useCourtStore((state) => state.suspects);
  const requestMercy = useCourtStore((state) => state.requestMercy);
  const law = laws.find((item) => item.id === charge?.lawId);
  const suspect = suspects.find((item) => item.id === charge?.appId);

  return (
    <CourtBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <CourtCard variant="dark">
          <View style={styles.hero}>
            <AssetImage assetKey="ASSET_CHARGES_FILED_SCROLL" width={132} height={132} />
            <View style={styles.heroText}>
              <StampBadge label="Charges Filed" tone="danger" />
              <Text style={styles.title}>{charge?.title ?? 'Charges Filed'}</Text>
              <Text style={styles.copy}>{charge?.description ?? 'Evidence submitted.'}</Text>
            </View>
          </View>
        </CourtCard>

        <CourtCard variant="parchment">
          <View style={styles.evidence}>
            <AssetImage assetKey="ASSET_PROSECUTOR_FOX_POINT" width={102} height={102} />
            <View style={styles.evidenceText}>
              <Text style={styles.darkLabel}>VIOLATED LAW</Text>
              <Text style={styles.darkTitle}>{law?.name ?? 'Focus Law'}</Text>
              <Text style={styles.darkCopy}>{charge?.evidenceLine ?? 'The data does not lie.'}</Text>
              <Text style={styles.sentence}>Sentence: {charge?.punishmentMinutes ?? 8} minutes in Distraction Jail.</Text>
            </View>
          </View>
        </CourtCard>

        <CourtCard variant="wood">
          <View style={styles.row}>
            <AssetImage assetKey="ASSET_DEFENDANT_CAUGHT_PHONE" width={96} height={96} />
            <View style={styles.rowText}>
              <Text style={styles.quote}>Prosecutor line</Text>
              <Text style={styles.quoteCopy}>{law?.prosecutorLine ?? `The ${suspect?.displayName ?? 'app'} was opened with suspicious confidence.`}</Text>
            </View>
            <AssetImage assetKey="ASSET_GUILTY_STAMP" width={70} height={70} />
          </View>
        </CourtCard>

        <View style={styles.buttons}>
          <CourtButton title="Accept Sentence" variant="danger" onPress={() => router.push('/modals/sentence')} />
          <CourtButton
            title="Request Mercy"
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
    gap: 16,
    paddingBottom: 28,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroText: {
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
    fontWeight: '700',
  },
  evidence: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  evidenceText: {
    flex: 1,
    gap: 5,
  },
  darkLabel: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '900',
  },
  darkTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  darkCopy: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  sentence: {
    color: colors.dangerDark,
    fontSize: 13,
    fontWeight: '900',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  quote: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
  },
  quoteCopy: {
    color: colors.cream,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  buttons: {
    gap: 10,
  },
});
