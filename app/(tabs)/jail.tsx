import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CharacterBubble } from '@/src/components/CharacterBubble';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { SentenceTimer } from '@/src/components/SentenceTimer';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';
import { MINI_ACTIONS } from '@/src/data/miniActions';
import { useCourtStore } from '@/src/store/useCourtStore';

export default function JailTab() {
  const router = useRouter();
  const activeCase = useCourtStore((state) => state.activeCase);
  const charges = useCourtStore((state) => state.charges);
  const reduceSentence = useCourtStore((state) => state.reduceSentence);
  const latestCharge = charges[0];
  const active = activeCase.status === 'jailed' && activeCase.remainingSentenceSeconds > 0;

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScreenHeader eyebrow="DISTRACTION JAIL" title="Sentence" subtitle="Serve time or earn parole through action." assetKey="ASSET_DISTRACTION_JAIL_BUILDING" />

        {!active ? (
          <CourtCard variant="dark" delay={80}>
            <View style={styles.empty}>
              <AssetImage assetKey="ASSET_EMPTY_NO_CHARGES" width={156} height={156} />
              <Text style={styles.emptyTitle}>No active sentence.</Text>
              <Text style={styles.emptyCopy}>Keep your record clean. The court is quiet for now.</Text>
              <AssetImage assetKey="ASSET_CLEAN_RECORD_MEDAL" width={94} height={94} />
            </View>
          </CourtCard>
        ) : (
          <>
            <CourtCard variant="dark" delay={80}>
              <View style={styles.jailHero}>
                <AssetImage assetKey="ASSET_DEFENDANT_JAIL_BARS" width={150} height={150} />
                <View style={styles.timerBox}>
                  <StampBadge label="Sentence Active" tone="danger" />
                  <SentenceTimer seconds={activeCase.remainingSentenceSeconds} />
                </View>
              </View>
              <Text style={styles.reason}>{latestCharge?.evidenceLine ?? 'Evidence submitted.'}</Text>
            </CourtCard>

            <CourtCard variant="wood" assetKey="ASSET_JAIL_TIMER_HOURGLASS" delay={150}>
              <Text style={styles.costTitle}>What this cost you</Text>
              <Text style={styles.costCopy}>The victim is tomorrow morning. Reduce this sentence by completing one real action.</Text>
            </CourtCard>

            <CharacterBubble assetKey="ASSET_BAILIFF_BULLDOG_GUARD" name="Bailiff Bulldog" line="Phone down. Sentence begins now." />

            <View style={styles.actions}>
              {MINI_ACTIONS.map((action, index) => (
                <CourtCard key={action.id} variant="parchment" delay={220 + index * 45}>
                  <View style={styles.actionRow}>
                    <AssetImage assetKey={action.assetKey} width={64} height={64} />
                    <View style={styles.actionText}>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                      <Text style={styles.actionMeta}>Reduce {action.reductionMinutes} min | +{action.parolePoints} parole</Text>
                    </View>
                    <CourtButton
                      title="Do"
                      small
                      variant="success"
                      onPress={() => {
                        const granted = reduceSentence(action.reductionMinutes, `${action.title}. Sentence reduced.`, action.parolePoints);
                        if (granted) router.push('/modals/parole-granted');
                      }}
                    />
                  </View>
                </CourtCard>
              ))}
            </View>

            <CourtButton title="Emergency Bypass" variant="danger" onPress={() => router.push('/modals/emergency-bypass')} />
          </>
        )}
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 112,
  },
  empty: {
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    color: colors.cream,
    fontSize: 24,
    fontWeight: '900',
  },
  emptyCopy: {
    color: colors.parchment,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '700',
  },
  jailHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timerBox: {
    flex: 1,
    gap: 10,
  },
  reason: {
    color: colors.parchment,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    marginTop: 8,
  },
  costTitle: {
    color: colors.cream,
    fontSize: 18,
    fontWeight: '900',
  },
  costCopy: {
    color: colors.parchment,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  actions: {
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionText: {
    flex: 1,
    gap: 3,
  },
  actionTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  actionMeta: {
    color: colors.dangerDark,
    fontSize: 11,
    fontWeight: '900',
  },
});
