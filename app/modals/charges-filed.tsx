import { useRouter } from 'expo-router';
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
  const charge = useCourtStore(
    (state) => state.charges.find((item) => item.id === state.activeChargeId) ?? state.charges[0],
  );
  const laws = useCourtStore((state) => state.laws);
  const suspects = useCourtStore((state) => state.suspects);
  const requestMercy = useCourtStore((state) => state.requestMercy);
  const law = laws.find((item) => item.id === charge?.lawId);
  const suspect = suspects.find((item) => item.id === charge?.appId);

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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: 16,
    gap: 8,
  },
  carouselCardActive: {
    borderColor: colors.red,
    backgroundColor: 'rgba(220,50,50,0.10)',
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
