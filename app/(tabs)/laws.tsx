import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius, shadows } from '@/src/constants/theme';
import type { AppCategory, FocusLaw, StrictnessLevel } from '@/src/types/court';
import { useCourtStore } from '@/src/store/useCourtStore';
import { usePremiumStore } from '@/src/store/usePremiumStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_H_PADDING = 20;
const CARD_WIDTH = SCREEN_WIDTH - CARD_H_PADDING * 2;
const MAX_CAROUSEL_LAWS = 5;

const filters: Array<AppCategory | 'all'> = [
  'all', 'shortVideo', 'social', 'video', 'game', 'shopping', 'dating', 'news', 'custom',
];
const strictnessLevels: StrictnessLevel[] = ['soft', 'balanced', 'brutal'];

// Accent color per category
const categoryAccent: Record<string, string> = {
  shortVideo: colors.red,
  social:     colors.blue,
  video:      colors.purple,
  game:       colors.green,
  shopping:   colors.orange,
  dating:     colors.pink,
  news:       colors.teal,
  custom:     colors.indigo,
  all:        colors.blue,
};

// Subtle glass tint per category
const categoryTint: Record<string, string> = {
  shortVideo: 'rgba(255,59,48,0.08)',
  social:     'rgba(0,122,255,0.08)',
  video:      'rgba(175,82,222,0.08)',
  game:       'rgba(52,199,89,0.08)',
  shopping:   'rgba(255,149,0,0.08)',
  dating:     'rgba(255,45,85,0.08)',
  news:       'rgba(48,176,199,0.08)',
  custom:     'rgba(88,86,214,0.08)',
  all:        'rgba(0,122,255,0.08)',
};

function CarouselCard({
  law,
  locked,
  onToggle,
}: {
  law: FocusLaw;
  locked: boolean;
  onToggle: () => void;
}) {
  const accent = categoryAccent[law.category] ?? colors.blue;
  const tint   = categoryTint[law.category]   ?? 'rgba(0,122,255,0.08)';

  return (
    <Pressable onPress={onToggle} style={styles.carouselCardWrap}>
      {/* Glass base */}
      <View style={[styles.carouselCard, { backgroundColor: tint }]}>
        {/* Top highlight line */}
        <View style={[styles.cardHighlight, { backgroundColor: accent }]} />

        {/* Header row */}
        <View style={styles.cardHeader}>
          <AssetImage assetKey={law.assetKey} width={64} height={64} />
          <View style={styles.cardHeaderRight}>
            <View style={styles.cardBadges}>
              <StampBadge
                label={locked ? 'Pro' : law.category}
                tone={locked ? 'purple' : law.isEnabled ? 'success' : 'blue'}
              />
              <StampBadge
                label={law.isEnabled ? 'Active' : 'Off'}
                tone={law.isEnabled ? 'success' : 'orange'}
              />
            </View>
            {/* Toggle pill */}
            <Pressable onPress={onToggle} style={[styles.togglePill, law.isEnabled && { backgroundColor: accent }]}>
              <View style={[styles.toggleThumb, law.isEnabled && styles.toggleThumbOn]} />
              <Text style={[styles.toggleLabel, law.isEnabled && styles.toggleLabelOn]}>
                {law.isEnabled ? 'ON' : 'OFF'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.cardDivider, { backgroundColor: accent + '40' }]} />

        {/* Law name + description */}
        <Text style={styles.cardTitle}>{law.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{law.description}</Text>

        {/* Judge quote */}
        <View style={[styles.quoteBox, { borderLeftColor: accent }]}>
          <Text style={styles.quoteText} numberOfLines={2}>"{law.judgeLine}"</Text>
        </View>

        {/* Sentence footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.footerLabel}>SENTENCE</Text>
          <Text style={[styles.footerValue, { color: accent }]}>
            {law.firstPunishmentMinutes}–{law.maxSentenceMinutes ?? 45} min
          </Text>
          <View style={styles.footerSpacer} />
          <Text style={styles.footerLabel}>TRIGGER</Text>
          <Text style={[styles.footerValue, { color: accent }]}>{law.trigger ?? 'appLaunch'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function LawsTab() {
  const router  = useRouter();
  const flatRef = useRef<FlatList<FocusLaw>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [filter, setFilter] = useState<AppCategory | 'all'>('all');

  const laws        = useCourtStore((state) => state.laws);
  const profile     = useCourtStore((state) => state.profile);
  const toggleLaw   = useCourtStore((state) => state.toggleLaw);
  const setStrictness = useCourtStore((state) => state.setStrictness);
  const isPro       = usePremiumStore((state) => state.isPro);

  const enabledCount      = laws.filter((l) => l.isEnabled).length;
  const hardBlockCount    = laws.filter((l) => l.isEnabled && l.enforcementMode === 'hardBlock').length;
  const focusSessionCount = laws.filter((l) => l.isEnabled && l.trigger === 'focusSession').length;

  // Build carousel: enabled laws first, then disabled, max 5
  const carouselLaws = [
    ...laws.filter((l) => l.isEnabled),
    ...laws.filter((l) => !l.isEnabled),
  ].slice(0, MAX_CAROUSEL_LAWS);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIndex(Math.max(0, Math.min(idx, carouselLaws.length - 1)));
  };

  const goTo = (idx: number) => {
    flatRef.current?.scrollToIndex({ index: idx, animated: true });
    setActiveIndex(idx);
  };

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScreenHeader
          eyebrow="LEGAL CODE"
          title="Focus Laws"
          subtitle="Funny fake laws that protect your real life."
          assetKey="ASSET_LAW_BOOK_LIBRARY"
        />

        {/* ── Stats hero ──────────────────────────────────────────── */}
        <CourtCard variant="purple" delay={80}>
          <View style={styles.heroRow}>
            <View style={styles.heroText}>
              <StampBadge label="Free limit: 3 laws" tone="gold" />
              <Text style={styles.heroTitle}>{enabledCount} active laws</Text>
              <Text style={styles.heroCopy}>
                {hardBlockCount} hard blocks · {focusSessionCount} focus-session laws.{' '}
                Supreme Court Mode unlocks all.
              </Text>
            </View>
            <AssetImage assetKey="ASSET_STRICT_MODE_LOCK" width={116} height={116} />
          </View>
        </CourtCard>

        {/* ── Law Carousel ─────────────────────────────────────────── */}
        <View style={styles.carouselSection}>
          <View style={styles.carouselLabelRow}>
            <Text style={styles.carouselLabel}>YOUR LAWS</Text>
            <Text style={styles.carouselSub}>{activeIndex + 1} / {carouselLaws.length}</Text>
          </View>

          <FlatList
            ref={flatRef}
            data={carouselLaws}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            snapToInterval={CARD_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselList}
            renderItem={({ item }) => (
              <CarouselCard
                law={item}
                locked={!!item.isPremium && !isPro}
                onToggle={() => {
                  const result = toggleLaw(item.id, isPro);
                  if (!result.allowed) router.push('/modals/paywall');
                }}
              />
            )}
          />

          {/* Dot indicators */}
          <View style={styles.dots}>
            {carouselLaws.map((_, i) => (
              <Pressable key={i} onPress={() => goTo(i)} hitSlop={8}>
                <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Strictness selector ──────────────────────────────────── */}
        <View style={styles.strictRow}>
          {strictnessLevels.map((item) => {
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
                <Text style={[styles.strictText, active && styles.strictTextActive]}>
                  {item.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Category filter pills ─────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((item) => (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={[styles.filter, filter === item && styles.filterActive]}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Quick actions ─────────────────────────────────────────── */}
        <View style={styles.quickSettings}>
          <CourtButton title="Screen Time Setup" variant="purple" small onPress={() => router.push('/modals/screen-time-settings')} />
          <CourtButton title="Custom Law"         variant="wood"   small onPress={() => router.push('/modals/law-editor')} />
          <CourtButton title="Weekly Report"      variant="ghost"  small onPress={() => router.push('/modals/weekly-report')} />
          <CourtButton title="Upgrade"            variant="gold"   small onPress={() => router.push('/modals/paywall')} />
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

  // ── Hero ──────────────────────────────────────────────────────────
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

  // ── Carousel ──────────────────────────────────────────────────────
  carouselSection: {
    gap: 12,
  },
  carouselLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  carouselLabel: {
    color: colors.labelSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  carouselSub: {
    color: colors.labelTertiary,
    fontSize: 11,
    fontWeight: '600',
  },
  carouselList: {
    // no extra padding — cards are exactly CARD_WIDTH wide
  },
  carouselCardWrap: {
    width: CARD_WIDTH,
  },
  carouselCard: {
    marginHorizontal: 0,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
    padding: 18,
    gap: 12,
    ...shadows.card,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  cardHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingTop: 4,
  },
  cardHeaderRight: {
    flex: 1,
    gap: 10,
  },
  cardBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(120,120,128,0.18)',
  },
  toggleThumb: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.labelTertiary,
  },
  toggleThumbOn: {
    backgroundColor: colors.white,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: colors.labelSecondary,
  },
  toggleLabelOn: {
    color: colors.white,
  },
  cardDivider: {
    height: 1,
    borderRadius: 1,
  },
  cardTitle: {
    color: colors.label,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 25,
  },
  cardDesc: {
    color: colors.labelSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  quoteBox: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 2,
  },
  quoteText: {
    color: colors.labelSecondary,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  footerSpacer: {
    flex: 1,
  },
  footerLabel: {
    color: colors.labelTertiary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  footerValue: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
  },

  // ── Dots ──────────────────────────────────────────────────────────
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(120,120,128,0.28)',
  },
  dotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.blue,
  },

  // ── Strictness ────────────────────────────────────────────────────
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

  // ── Filter pills ──────────────────────────────────────────────────
  filterRow: {
    gap: 8,
    paddingRight: 4,
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

  // ── Quick actions ─────────────────────────────────────────────────
  quickSettings: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
