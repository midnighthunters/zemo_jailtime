import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';
import { formatMinutes } from '@/src/utils/format';

/**
 * Confirms a jail verdict for one case. Jailing locks only the app named on the
 * case, and only until its focus time is served.
 */
export default function SentenceModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ caseId?: string }>();
  const item = useCourtStore((state) =>
    state.cases.find((entry) => entry.id === params.caseId) ??
    state.cases.find((entry) => entry.verdict === 'hearing'),
  );
  const jailCase = useCourtStore((state) => state.jailCase);

  const minutes = item?.requiredFocusMinutes ?? 8;

  return (
    <CourtBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <CourtCard variant="red">
          <View style={styles.hero}>
            <AssetImage assetKey="ASSET_SENTENCE_SERVED_SCROLL" width={136} height={136} />
            <View style={styles.text}>
              <StampBadge label="Sentence" tone="danger" />
              <Text style={styles.title}>{formatMinutes(minutes)}</Text>
              <Text style={styles.copy}>
                {item
                  ? `Your court-ordered apps lock until you serve ${formatMinutes(minutes)} of focus under ${item.lawName}.`
                  : 'No case is waiting for a verdict.'}
              </Text>
            </View>
          </View>
        </CourtCard>

        <CourtCard variant="orange">
          <View style={styles.warnRow}>
            <AssetImage assetKey="ASSET_MAXIMUM_SENTENCE_ALARM" width={88} height={88} />
            <View style={styles.warnText}>
              <Text style={styles.warnTitle}>Escalation Warning</Text>
              <Text style={styles.warnCopy}>
                Break the same law again today and the next sentence gets longer. The docket clears
                at midnight.
              </Text>
            </View>
          </View>
        </CourtCard>

        <CourtButton
          title="Lock the App"
          variant="destructive"
          disabled={!item}
          onPress={() => {
            if (!item) return;
            jailCase(item.id);
            router.replace('/(tabs)/courtroom');
          }}
        />
        <CourtButton title="Back to Court" variant="ghost" onPress={() => router.back()} />
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
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.5,
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
