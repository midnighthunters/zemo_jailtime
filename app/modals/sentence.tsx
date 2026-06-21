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
  const charge = useCourtStore(
    (state) => state.charges.find((item) => item.id === state.activeChargeId) ?? state.charges[0],
  );
  const acceptSentence = useCourtStore((state) => state.acceptSentence);

  return (
    <CourtBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Sentence glass hero ──────────────────────────────────── */}
        <CourtCard variant="red">
          <View style={styles.hero}>
            <AssetImage assetKey="ASSET_SENTENCE_SERVED_SCROLL" width={136} height={136} />
            <View style={styles.text}>
              <StampBadge label="Sentence" tone="danger" />
              <Text style={styles.title}>
                {charge?.punishmentMinutes ?? 8} Minutes
              </Text>
              <Text style={styles.copy}>
                Sentence active. Complete one focus action and the court may consider parole.
              </Text>
            </View>
          </View>
        </CourtCard>

        {/* ── Escalation warning ─────────────────────────────────── */}
        <CourtCard variant="orange">
          <View style={styles.warnRow}>
            <AssetImage assetKey="ASSET_MAXIMUM_SENTENCE_ALARM" width={88} height={88} />
            <View style={styles.warnText}>
              <Text style={styles.warnTitle}>Escalation Warning</Text>
              <Text style={styles.warnCopy}>
                Repeat opening detected. Jail time may increase.
              </Text>
            </View>
          </View>
        </CourtCard>

        {/* ── Actions ──────────────────────────────────────────── */}
        <CourtButton
          title="Start Jail Time"
          variant="destructive"
          onPress={() => {
            acceptSentence(charge?.id);
            router.replace('/(tabs)/jail');
          }}
        />
        <CourtButton
          title="Return to Courtroom"
          variant="ghost"
          onPress={() => router.back()}
        />
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
  text: {
    flex: 1,
    gap: 10,
  },
  title: {
    color: colors.label,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: 0.37,
  },
  copy: {
    color: colors.labelSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
  },
  warnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  warnText: {
    flex: 1,
    gap: 5,
  },
  warnTitle: {
    color: colors.label,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  warnCopy: {
    color: colors.labelSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
});
