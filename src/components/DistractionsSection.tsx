import { useState } from 'react';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CourtButton } from '@/src/components/CourtButton';
import { colors, radius, shadows } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';
import { usePremiumStore } from '@/src/store/usePremiumStore';
import type { AppSuspect, BlockCategory } from '@/src/types/court';

type CategoryMeta = {
  key: BlockCategory;
  label: string;
  emoji: string;
  color: string;
  blurb: string;
};

const CATEGORIES: CategoryMeta[] = [
  { key: 'distracting', label: 'Distracting', emoji: '🚫', color: colors.orange, blurb: 'Monitored and jailed when limits break.' },
  { key: 'alwaysAllowed', label: 'Always Allowed', emoji: '✅', color: colors.green, blurb: 'Whitelisted — never blocked.' },
  { key: 'neverAllowed', label: 'Never Allowed', emoji: '🔒', color: colors.indigo, blurb: 'Hard-locked at all times. No parole.' },
];

function appCategory(s: AppSuspect): BlockCategory {
  return s.blockCategory ?? 'distracting';
}

// ─── Summary card (one of the three at the top) ──────────────────────────────
function CategoryCard({
  meta,
  count,
  active,
  onPress,
}: {
  meta: CategoryMeta;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={cardStyles.wrap}>
      <View style={[cardStyles.card, active && { borderColor: `${meta.color}66` }]}>
        {Platform.OS !== 'web' ? (
          <BlurView tint="systemUltraThinMaterial" intensity={70} style={StyleSheet.absoluteFillObject} />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.72)' }]} />
        )}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: active ? `${meta.color}1A` : 'rgba(255,255,255,0.06)', borderRadius: radius.xl },
          ]}
        />
        <View style={cardStyles.highlight} />

        <View style={[cardStyles.emojiPill, { backgroundColor: `${meta.color}22`, borderColor: `${meta.color}3D` }]}>
          <Text style={cardStyles.emoji}>{meta.emoji}</Text>
        </View>
        <Text style={[cardStyles.count, active && { color: meta.color }]}>{count}</Text>
        <Text style={cardStyles.label} numberOfLines={2}>{meta.label}</Text>
      </View>
    </Pressable>
  );
}

// ─── App row inside the selected category ────────────────────────────────────
function AppRow({
  suspect,
  onSetCategory,
  onRemove,
}: {
  suspect: AppSuspect;
  onSetCategory: (c: BlockCategory) => void;
  onRemove?: () => void;
}) {
  const current = appCategory(suspect);
  const locked = current === 'neverAllowed';

  return (
    <View style={rowStyles.row}>
      {Platform.OS !== 'web' ? (
        <BlurView tint="systemUltraThinMaterial" intensity={18} style={StyleSheet.absoluteFillObject} />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.72)' }]} />
      )}
      <View style={rowStyles.border} />

      <View style={[rowStyles.icon, { backgroundColor: suspect.iconColor }]}>
        <Text style={rowStyles.iconText}>
          {suspect.isWebsite ? '🌐' : suspect.displayName.slice(0, 1).toUpperCase()}
        </Text>
        {locked ? (
          <View style={rowStyles.iconLock}>
            <Text style={rowStyles.iconLockGlyph}>🔒</Text>
          </View>
        ) : null}
      </View>

      <View style={rowStyles.info}>
        <Text style={rowStyles.name} numberOfLines={1}>{suspect.displayName}</Text>
        <Text style={rowStyles.villain} numberOfLines={1}>
          {suspect.isWebsite ? suspect.url ?? 'Website' : suspect.villainName}
        </Text>
      </View>

      <View style={rowStyles.segment}>
        {CATEGORIES.map((c) => {
          const isOn = current === c.key;
          return (
            <Pressable
              key={c.key}
              onPress={() => onSetCategory(c.key)}
              style={[rowStyles.segBtn, isOn && { backgroundColor: `${c.color}22`, borderColor: `${c.color}55` }]}
            >
              <Text style={[rowStyles.segGlyph, !isOn && rowStyles.segGlyphOff]}>{c.emoji}</Text>
            </Pressable>
          );
        })}
      </View>

      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={8} style={rowStyles.remove}>
          <Text style={rowStyles.removeGlyph}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
export function DistractionsSection() {
  const router = useRouter();
  const suspects = useCourtStore((s) => s.suspects);
  const setBlockCategory = useCourtStore((s) => s.setBlockCategory);
  const removeSuspect = useCourtStore((s) => s.removeSuspect);
  const isPro = usePremiumStore((s) => s.isPro);
  const [selected, setSelected] = useState<BlockCategory>('distracting');

  const counts: Record<BlockCategory, number> = {
    distracting: suspects.filter((s) => appCategory(s) === 'distracting').length,
    alwaysAllowed: suspects.filter((s) => appCategory(s) === 'alwaysAllowed').length,
    neverAllowed: suspects.filter((s) => appCategory(s) === 'neverAllowed').length,
  };

  const visible = suspects.filter((s) => appCategory(s) === selected);
  const activeMeta = CATEGORIES.find((c) => c.key === selected)!;

  const handleRemove = (s: AppSuspect) => {
    Alert.alert('Remove app?', `Remove ${s.displayName} from your distractions?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeSuspect(s.id) },
    ]);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Distractions</Text>
        <Text style={styles.subtitle}>Sort every app into how the court should treat it.</Text>
      </View>

      {/* Three category cards */}
      <View style={styles.cardsRow}>
        {CATEGORIES.map((c) => (
          <CategoryCard
            key={c.key}
            meta={c}
            count={counts[c.key]}
            active={selected === c.key}
            onPress={() => setSelected(c.key)}
          />
        ))}
      </View>

      {/* Selected category detail */}
      <View style={styles.detail}>
        <Text style={styles.detailBlurb}>{activeMeta.blurb}</Text>

        <View style={styles.list}>
          {visible.length === 0 ? (
            <Text style={styles.empty}>No apps here yet.</Text>
          ) : (
            visible.map((s) => (
              <AppRow
                key={s.id}
                suspect={s}
                onSetCategory={(c) => setBlockCategory(s.id, c)}
                onRemove={s.isCustom ? () => handleRemove(s) : undefined}
              />
            ))
          )}
        </View>

        <CourtButton
          title="＋  Add App or Website"
          variant="secondary"
          onPress={() =>
            router.push({ pathname: '/modals/add-app', params: { target: selected, isPro: isPro ? '1' : '0' } })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  header: { gap: 3, paddingHorizontal: 2 },
  title: { color: colors.label, fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  subtitle: { color: colors.labelSecondary, fontSize: 13, fontWeight: '400' },
  cardsRow: { flexDirection: 'row', gap: 10 },
  detail: { gap: 10 },
  detailBlurb: { color: colors.labelSecondary, fontSize: 13, fontWeight: '500', paddingHorizontal: 2 },
  list: { gap: 10 },
  empty: {
    color: colors.labelTertiary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 18,
  },
});

const cardStyles = StyleSheet.create({
  wrap: { flex: 1 },
  card: {
    minHeight: 112,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
    padding: 12,
    gap: 6,
    alignItems: 'flex-start',
    ...shadows.soft,
  },
  highlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  emojiPill: {
    width: 34, height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 16 },
  count: { color: colors.label, fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  label: { color: colors.labelSecondary, fontSize: 12, fontWeight: '600', letterSpacing: -0.1 },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.soft,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  icon: {
    width: 42, height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  iconLock: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLockGlyph: { fontSize: 14 },
  info: { flex: 1, gap: 2 },
  name: { color: colors.label, fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
  villain: { color: colors.labelSecondary, fontSize: 12, fontWeight: '500' },
  segment: { flexDirection: 'row', gap: 4 },
  segBtn: {
    width: 30, height: 30,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(120,120,128,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segGlyph: { fontSize: 14 },
  segGlyphOff: { opacity: 0.4 },
  remove: {
    width: 26, height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,59,48,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeGlyph: { color: colors.red, fontSize: 13, fontWeight: '700' },
});
