import { useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { CourtButton } from '@/src/components/CourtButton';
import { colors, radius, shadows } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';
import { usePremiumStore } from '@/src/store/usePremiumStore';
import type { AppSuspect, BlockCategory } from '@/src/types/court';

type CategoryMeta = { key: BlockCategory; label: string; symbol: string; color: string; tint: string; blurb: string };

const CATEGORIES: CategoryMeta[] = [
  { key: 'distracting', label: 'Distracting', symbol: 'hand.raised.fill', color: colors.orangeDark, tint: colors.orangeLight, blurb: 'Monitored and jailed when limits break.' },
  { key: 'alwaysAllowed', label: 'Always Allowed', symbol: 'checkmark.shield.fill', color: colors.greenDark, tint: colors.greenLight, blurb: 'Whitelisted — never blocked.' },
  { key: 'neverAllowed', label: 'Never Allowed', symbol: 'lock.shield.fill', color: colors.indigo, tint: colors.purpleLight, blurb: 'Hard-locked at all times. No parole.' },
];

function appCategory(s: AppSuspect): BlockCategory { return s.blockCategory ?? 'distracting'; }

function CategoryCard({ meta, count, active, onPress }: { meta: CategoryMeta; count: number; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [cardStyles.wrap, pressed && cardStyles.pressed]}>
      <View style={[cardStyles.card, active && { backgroundColor: meta.tint, borderColor: `${meta.color}55`, borderBottomColor: `${meta.color}66` }]}>
        <View style={[cardStyles.iconStage, { backgroundColor: active ? colors.surface : meta.tint }]}>
          <Image source={`sf:${meta.symbol}`} tintColor={meta.color} contentFit="contain" style={cardStyles.icon} />
        </View>
        <Text style={[cardStyles.count, active && { color: meta.color }]}>{count}</Text>
        <Text style={cardStyles.label} numberOfLines={2}>{meta.label}</Text>
      </View>
    </Pressable>
  );
}

function AppRow({ suspect, onSetCategory, onRemove }: { suspect: AppSuspect; onSetCategory: (c: BlockCategory) => void; onRemove?: () => void }) {
  const current = appCategory(suspect);
  const locked = current === 'neverAllowed';
  return (
    <View style={rowStyles.row}>
      <View style={[rowStyles.appIcon, { backgroundColor: suspect.iconColor }]}>
        <Text style={rowStyles.iconText}>{suspect.isWebsite ? 'W' : suspect.displayName.slice(0, 1).toUpperCase()}</Text>
        {locked ? <View style={rowStyles.iconLock}><Image source="sf:lock.fill" tintColor={colors.white} contentFit="contain" style={rowStyles.iconLockGlyph} /></View> : null}
      </View>
      <View style={rowStyles.info}>
        <Text style={rowStyles.name} numberOfLines={1}>{suspect.displayName}</Text>
        <Text style={rowStyles.villain} numberOfLines={1}>{suspect.isWebsite ? suspect.url ?? 'Website' : suspect.villainName}</Text>
      </View>
      <View style={rowStyles.segment}>
        {CATEGORIES.map((c) => {
          const isOn = current === c.key;
          return (
            <Pressable key={c.key} accessibilityLabel={c.label} onPress={() => onSetCategory(c.key)} style={({ pressed }) => [rowStyles.segBtn, isOn && { backgroundColor: c.tint, borderColor: `${c.color}55` }, pressed && rowStyles.segPressed]}>
              <Image source={`sf:${c.symbol}`} tintColor={isOn ? c.color : colors.labelTertiary} contentFit="contain" style={rowStyles.segGlyph} />
            </Pressable>
          );
        })}
      </View>
      {onRemove ? <Pressable accessibilityLabel="Remove app" onPress={onRemove} hitSlop={8} style={rowStyles.remove}><Image source="sf:xmark" tintColor={colors.red} contentFit="contain" style={rowStyles.removeGlyph} /></Pressable> : null}
    </View>
  );
}

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
  const handleRemove = (s: AppSuspect) => Alert.alert('Remove app?', `Remove ${s.displayName} from your distractions?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: () => removeSuspect(s.id) },
  ]);

  return (
    <View style={styles.root}>
      <View style={styles.header}><Text style={styles.title}>Distractions</Text><Text style={styles.subtitle}>Sort every app into how the court should treat it.</Text></View>
      <View style={styles.cardsRow}>{CATEGORIES.map((c) => <CategoryCard key={c.key} meta={c} count={counts[c.key]} active={selected === c.key} onPress={() => setSelected(c.key)} />)}</View>
      <View style={styles.detail}>
        <Text style={styles.detailBlurb}>{activeMeta.blurb}</Text>
        <View style={styles.list}>{visible.length === 0 ? <Text style={styles.empty}>No apps here yet.</Text> : visible.map((s) => <AppRow key={s.id} suspect={s} onSetCategory={(c) => setBlockCategory(s.id, c)} onRemove={s.isCustom ? () => handleRemove(s) : undefined} />)}</View>
        <CourtButton title="Add App or Website" variant="secondary" onPress={() => router.push({ pathname: '/modals/add-app', params: { target: selected, isPro: isPro ? '1' : '0' } })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 }, header: { gap: 3, paddingHorizontal: 2 }, title: { color: colors.label, fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  subtitle: { color: colors.labelSecondary, fontSize: 13, fontWeight: '400' }, cardsRow: { flexDirection: 'row', gap: 10 }, detail: { gap: 10 },
  detailBlurb: { color: colors.labelSecondary, fontSize: 13, fontWeight: '500', paddingHorizontal: 2 }, list: { gap: 10 },
  empty: { color: colors.labelTertiary, fontSize: 14, fontWeight: '500', textAlign: 'center', paddingVertical: 18 },
});

const cardStyles = StyleSheet.create({
  wrap: { flex: 1 }, pressed: { transform: [{ translateY: 3 }] },
  card: { minHeight: 112, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderBottomWidth: 4, borderBottomColor: colors.depthEdge, padding: 12, gap: 6, alignItems: 'flex-start', ...shadows.soft },
  iconStage: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, icon: { width: 17, height: 17 },
  count: { color: colors.label, fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 }, label: { color: colors.labelSecondary, fontSize: 12, fontWeight: '600', letterSpacing: -0.1 },
});

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderBottomWidth: 4, borderBottomColor: colors.depthEdge, ...shadows.soft },
  appIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, iconText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  iconLock: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(39,43,48,0.42)', alignItems: 'center', justifyContent: 'center' }, iconLockGlyph: { width: 14, height: 14 },
  info: { flex: 1, gap: 2 }, name: { color: colors.label, fontSize: 15, fontWeight: '600', letterSpacing: -0.2 }, villain: { color: colors.labelSecondary, fontSize: 12, fontWeight: '500' },
  segment: { flexDirection: 'row', gap: 4 }, segBtn: { width: 30, height: 30, borderRadius: 9, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  segPressed: { transform: [{ translateY: 2 }] }, segGlyph: { width: 14, height: 14 }, remove: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.redLight, alignItems: 'center', justifyContent: 'center' }, removeGlyph: { width: 11, height: 11 },
});
