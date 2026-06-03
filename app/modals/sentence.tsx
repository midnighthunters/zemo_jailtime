import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';

export default function SentenceModal() {
  const router = useRouter();
  const charge = useCourtStore((state) => state.charges.find((item) => item.id === state.activeChargeId) ?? state.charges[0]);
  const acceptSentence = useCourtStore((state) => state.acceptSentence);

  return (
    <CourtBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <CourtCard variant="dark">
          <View style={styles.hero}>
            <AssetImage assetKey="ASSET_SENTENCE_SERVED_SCROLL" width={142} height={142} />
            <View style={styles.text}>
              <StampBadge label="Sentence" tone="danger" />
              <Text style={styles.title}>{charge?.punishmentMinutes ?? 8} Minutes</Text>
              <Text style={styles.copy}>Sentence active. Complete one focus action and the court may consider parole.</Text>
            </View>
          </View>
        </CourtCard>

        <CourtCard variant="wood">
          <View style={styles.warnRow}>
            <AssetImage assetKey="ASSET_MAXIMUM_SENTENCE_ALARM" width={94} height={94} />
            <View style={styles.warnText}>
              <Text style={styles.warnTitle}>Escalation Warning</Text>
              <Text style={styles.warnCopy}>Repeat opening detected. Jail time may increase.</Text>
            </View>
          </View>
        </CourtCard>

        <CourtButton
          title="Start Jail Time"
          variant="danger"
          onPress={() => {
            acceptSentence(charge?.id);
            router.replace('/(tabs)/jail');
          }}
        />
        <CourtButton title="Return to Courtroom" variant="ghost" onPress={() => router.back()} />
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
  text: {
    flex: 1,
    gap: 8,
  },
  title: {
    color: colors.cream,
    fontSize: 34,
    fontWeight: '900',
  },
  copy: {
    color: colors.parchment,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '800',
  },
  warnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  warnText: {
    flex: 1,
    gap: 4,
  },
  warnTitle: {
    color: colors.cream,
    fontSize: 18,
    fontWeight: '900',
  },
  warnCopy: {
    color: colors.parchment,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
});
