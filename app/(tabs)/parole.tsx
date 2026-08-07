import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { ParoleMeter } from '@/src/components/ParoleMeter';
import { ProgressDocket } from '@/src/components/ProgressDocket';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { colors } from '@/src/constants/theme';
import { COURT_RANKS, rankForPoints } from '@/src/data/ranks';
import { REWARD_CARDS } from '@/src/data/rewards';
import { useCourtStore } from '@/src/store/useCourtStore';
import { useRouter } from 'expo-router';

export default function ParoleTab() {
  const router = useRouter();
  const profile = useCourtStore((state) => state.profile);
  const paroleRecords = useCourtStore((state) => state.paroleRecords);
  const rank = rankForPoints(profile.parolePoints);
  const nextRank = COURT_RANKS.find((item) => item.minPoints > profile.parolePoints);
  const progress = nextRank ? Math.min(100, (profile.parolePoints / nextRank.minPoints) * 100) : 100;

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScreenHeader eyebrow="PAROLE BOARD" title="Rewards" subtitle="Good behavior earns freedom, coins, and a cleaner record." assetKey="ASSET_PAROLE_GRANTED_BADGE" />

        <CourtCard variant="dark" delay={80}>
          <View style={styles.hero}>
            <View style={styles.heroText}>
              <Text style={styles.rankLabel}>CURRENT RANK</Text>
              <Text style={styles.rank}>{rank.name}</Text>
              <ParoleMeter value={progress} label={nextRank ? `Next: ${nextRank.name}` : 'Supreme rank'} />
            </View>
            <AssetImage assetKey="ASSET_SUPREME_FOCUS_TROPHY" width={126} height={126} />
          </View>
        </CourtCard>

        <ProgressDocket
          items={[
            { label: 'Parole points', value: profile.parolePoints },
            { label: 'Focus coins', value: profile.focusCoins },
            { label: 'Clean streak', value: profile.cleanRecordStreak },
          ]}
        />

        <View style={styles.rewards}>
          {REWARD_CARDS.map((reward, index) => (
            <CourtCard key={reward.title} variant="parchment" delay={160 + index * 45}>
              <View style={styles.rewardRow}>
                <AssetImage assetKey={reward.assetKey} width={76} height={76} />
                <View style={styles.rewardText}>
                  <Text style={styles.rewardTitle}>{reward.title}</Text>
                  <Text style={styles.rewardCopy}>{reward.copy}</Text>
                </View>
              </View>
            </CourtCard>
          ))}
        </View>

        <CourtCard variant="wood" delay={260}>
          <View style={styles.upgradeRow}>
            <AssetImage assetKey="ASSET_COURTROOM_UPGRADE_BENCH" width={88} height={88} />
            <View style={styles.upgradeText}>
              <Text style={styles.upgradeTitle}>Courtroom Upgrades Preview</Text>
              <Text style={styles.upgradeCopy}>Supreme Court Mode unlocks stronger laws, better reports, and future real blocking features.</Text>
              <CourtButton title="Upgrade Authority" variant="gold" small onPress={() => router.push('/modals/paywall')} />
            </View>
          </View>
        </CourtCard>

        <View style={styles.history}>
          <Text style={styles.sectionTitle}>Recent Parole History</Text>
          {paroleRecords.slice(0, 5).map((record, index) => (
            <Animated.View key={record.id} entering={FadeInUp.duration(260).delay(300 + index * 45).springify().damping(18)} layout={LinearTransition.springify().damping(18)} style={styles.historyItem}>
              <AssetImage assetKey="ASSET_BROKEN_CHAIN_FREEDOM" width={44} height={44} />
              <View style={styles.historyText}>
                <Text style={styles.historyMessage}>{record.message}</Text>
                <Text style={styles.historyPoints}>+{record.pointsEarned} parole points</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 112,
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
  rankLabel: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  rank: {
    color: colors.cream,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
  },
  rewards: {
    gap: 10,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardText: {
    flex: 1,
    gap: 4,
  },
  rewardTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  rewardCopy: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  upgradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upgradeText: {
    flex: 1,
    gap: 7,
  },
  upgradeTitle: {
    color: colors.cream,
    fontSize: 18,
    fontWeight: '900',
  },
  upgradeCopy: {
    color: colors.parchment,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  history: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.cream,
    fontSize: 19,
    fontWeight: '900',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyText: {
    flex: 1,
    gap: 3,
  },
  historyMessage: {
    color: colors.cream,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  historyPoints: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
  },
});
