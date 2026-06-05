import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { LawCard } from '@/src/components/LawCard';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius } from '@/src/constants/theme';
import type { AppCategory, StrictnessLevel } from '@/src/types/court';
import { useCourtStore } from '@/src/store/useCourtStore';
import { usePremiumStore } from '@/src/store/usePremiumStore';

const filters: Array<AppCategory | 'all'> = ['all', 'shortVideo', 'social', 'video', 'game', 'shopping', 'dating', 'news', 'custom'];
const strictness: StrictnessLevel[] = ['soft', 'balanced', 'brutal'];

export default function LawsTab() {
  const router = useRouter();
  const [filter, setFilter] = useState<AppCategory | 'all'>('all');
  const laws = useCourtStore((state) => state.laws);
  const profile = useCourtStore((state) => state.profile);
  const toggleLaw = useCourtStore((state) => state.toggleLaw);
  const setStrictness = useCourtStore((state) => state.setStrictness);
  const isPro = usePremiumStore((state) => state.isPro);
  const visible = filter === 'all' ? laws : laws.filter((law) => law.category === filter || law.category === 'all');
  const enabledCount = laws.filter((law) => law.isEnabled).length;
  const hardBlockCount = laws.filter((law) => law.isEnabled && law.enforcementMode === 'hardBlock').length;
  const focusSessionCount = laws.filter((law) => law.isEnabled && law.trigger === 'focusSession').length;

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScreenHeader
          eyebrow="LEGAL CODE"
          title="Focus Laws"
          subtitle="Funny fake laws that protect your real life."
          assetKey="ASSET_LAW_BOOK_LIBRARY"
        />

        <CourtCard variant="purple" delay={80}>
          <View style={styles.heroRow}>
            <View style={styles.heroText}>
              <StampBadge label="Free limit: 3 laws" tone="gold" />
              <Text style={styles.heroTitle}>{enabledCount} active laws</Text>
              <Text style={styles.heroCopy}>
                {hardBlockCount} hard blocks, {focusSessionCount} focus-session laws. Supreme Court Mode unlocks unlimited laws and strict mode.
              </Text>
            </View>
            <AssetImage assetKey="ASSET_STRICT_MODE_LOCK" width={116} height={116} />
          </View>
        </CourtCard>

        <View style={styles.filterRow}>
          {filters.map((item) => (
            <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}>
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.strictRow}>
          {strictness.map((item) => {
            const active = profile.strictness === item;
            return (
              <Pressable
                key={item}
                onPress={() => {
                  const result = setStrictness(item, isPro);
                  if (!result.allowed) router.push('/modals/paywall');
                }}
                style={[styles.strict, active && styles.strictActive]}
              >
                <Text style={[styles.strictText, active && styles.strictTextActive]}>{item.toUpperCase()}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.quickSettings}>
          <CourtButton title="Screen Time Setup" variant="purple" small onPress={() => router.push('/modals/screen-time-settings')} />
          <CourtButton title="Custom Law" variant="wood" small onPress={() => router.push('/modals/law-editor')} />
          <CourtButton title="Weekly Report" variant="ghost" small onPress={() => router.push('/modals/weekly-report')} />
          <CourtButton title="Upgrade" variant="gold" small onPress={() => router.push('/modals/paywall')} />
        </View>

        <View style={styles.list}>
          {visible.map((law, index) => (
            <LawCard
              key={law.id}
              law={law}
              locked={law.isPremium && !isPro}
              delay={120 + index * 35}
              onToggle={() => {
                const result = toggleLaw(law.id, isPro);
                if (!result.allowed) router.push('/modals/paywall');
              }}
            />
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
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroText: {
    flex: 1,
    gap: 8,
  },
  heroTitle: {
    color: colors.cream,
    fontSize: 24,
    fontWeight: '900',
  },
  heroCopy: {
    color: colors.parchment,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filter: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 242, 210, 0.1)',
  },
  filterActive: {
    backgroundColor: colors.gold,
  },
  filterText: {
    color: colors.cream,
    fontSize: 12,
    fontWeight: '900',
  },
  filterTextActive: {
    color: colors.ink,
  },
  strictRow: {
    flexDirection: 'row',
    gap: 8,
  },
  strict: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 242, 210, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255, 242, 210, 0.14)',
  },
  strictActive: {
    backgroundColor: colors.danger,
    borderColor: colors.gold,
  },
  strictText: {
    color: colors.parchment,
    fontWeight: '900',
    fontSize: 12,
  },
  strictTextActive: {
    color: colors.white,
  },
  quickSettings: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  list: {
    gap: 10,
  },
});
