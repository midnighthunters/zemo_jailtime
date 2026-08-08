import { useLocalSearchParams, useRouter } from 'expo-router';
import { Dimensions, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';
import type { FocusLaw } from '@/src/types/court';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.72;
const CARD_GAP = 12;

// IDs of the 5 laws to feature in the carousel
const FEATURED_LAW_IDS = [
  'anti-doomscroll-act',
  'midnight-swipe-ban',
  'productivity-protection-code',
  'reels-containment-order',
  'gaming-probation-law',
];

function LawCarouselItem({ item, isActive }: { item: FocusLaw; isActive: boolean }) {
  return (
    <View style={[styles.carouselCard, isActive && styles.carouselCardActive]}>
      <View style={styles.carouselTop}>
        <AssetImage assetKey={item.assetKey as any} width={52} height={52} />
        <View style={styles.carouselBadgeRow}>
          {isActive && <StampBadge label="VIOLATED" tone="danger" />}
        </View>
      </View>
      <Text style={styles.carouselTitle} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.carouselDesc} numberOfLines={3}>{item.description}</Text>
      <Text style={styles.carouselJudge} numberOfLines={2}>"{item.judgeLine}"</Text>
    </View>
  );
}

export default function ChargesFiledModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ caseId?: string }>();
  const courtCase = useCourtStore(
    (state) =>
      state.cases.find((item) => item.id === params.caseId) ??
      state.cases.find((item) => item.verdict === 'hearing'),
  );
  const laws = useCourtStore((state) => state.laws);
  const warnCase = useCourtStore((state) => state.warnCase);
  const requestMercy = useCourtStore((state) => state.requestMercy);
  const law = laws.find((item) => item.id === courtCase?.lawId);

  // Build carousel: active violated law first, then up to 4 others from featured list
  const featuredLaws = FEATURED_LAW_IDS
    .map((id) => laws.find((l) => l.id === id))
    .filter((l): l is FocusLaw => !!l);

  const carouselLaws: FocusLaw[] = law
    ? [law, ...featuredLaws.filter((l) => l.id !== law.id)].slice(0, 5)
    : featuredLaws.slice(0, 5);

  return (
    <CourtBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <CourtCard variant="red">
          <View style={styles.hero}>
            <AssetImage assetKey="ASSET_CHARGES_FILED_SCROLL" width={130} height={130} />
            <View style={styles.heroText}>
              <StampBadge label="Hearing in progress" tone="gold" />
              <Text style={styles.title}>{courtCase?.title ?? 'Case Filed'}</Text>
              <Text style={styles.copy}>
                {courtCase?.evidenceLine ?? 'Evidence submitted to the court.'}
              </Text>
            </View>
          </View>
        </CourtCard>

        {/* ── Laws carousel ─────────────────────────────────────────── */}
        <View>
          <Text style={styles.carouselHeading}>VIOLATED LAWS</Text>
          <FlatList
            data={carouselLaws}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_GAP}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselList}
            renderItem={({ item }) => (
              <LawCarouselItem item={item} isActive={item.id === law?.id} />
            )}
          />
        </View>

        {/* ── Prosecutor line ───────────────────────────────────────── */}
        <CourtCard variant="orange">
          <View style={styles.row}>
            <AssetImage assetKey="ASSET_DEFENDANT_CAUGHT_PHONE" width={88} height={88} />
            <View style={styles.rowText}>
              <Text style={styles.quoteLabel}>PROSECUTOR</Text>
              <Text style={styles.quoteLine}>
                {law?.prosecutorLine ??
                  `${courtCase?.appName ?? 'The app'} was opened with suspicious confidence.`}
              </Text>
            </View>
            <AssetImage assetKey="ASSET_GUILTY_STAMP" width={60} height={60} />
          </View>
        </CourtCard>

        {/* ── Verdict ───────────────────────────────────────────────── */}
        <View style={styles.buttons}>
          <CourtButton
            title="Send to Jail"
            variant="destructive"
            disabled={!courtCase}
            onPress={() =>
              router.replace({ pathname: '/modals/sentence', params: { caseId: courtCase?.id } })
            }
          />
          <CourtButton
            title="Issue a Warning"
            variant="secondary"
            disabled={!courtCase}
            onPress={() => {
              if (!courtCase) return;
              warnCase(courtCase.id);
              router.back();
            }}
          />
          <CourtButton
            title="Request Mercy Pass"
            variant="ghost"
            onPress={() => {
              const granted = requestMercy(courtCase?.id);
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
  // ── Carousel ──────────────────────────────────────────────────────
  carouselHeading: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  carouselList: {
    gap: CARD_GAP,
    paddingRight: 20,
  },
  carouselCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
    padding: 16,
    gap: 8,
  },
  carouselCardActive: {
    borderColor: colors.red,
    backgroundColor: colors.redLight,
  },
  carouselTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carouselBadgeRow: {
    alignItems: 'flex-end',
  },
  carouselTitle: {
    color: colors.label,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  carouselDesc: {
    color: colors.labelSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  carouselJudge: {
    color: colors.orangeDark,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
    marginTop: 2,
  },
  // ── Prosecutor ────────────────────────────────────────────────────
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
