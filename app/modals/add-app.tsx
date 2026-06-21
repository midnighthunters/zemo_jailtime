import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { colors, radius } from '@/src/constants/theme';
import { APP_CATALOG } from '@/src/data/appCatalog';
import { useCourtStore } from '@/src/store/useCourtStore';
import { usePremiumStore } from '@/src/store/usePremiumStore';
import type { BlockCategory } from '@/src/types/court';

const TARGETS: { key: BlockCategory; label: string; emoji: string; color: string }[] = [
  { key: 'distracting', label: 'Distracting', emoji: '🚫', color: colors.orange },
  { key: 'alwaysAllowed', label: 'Allowed', emoji: '✅', color: colors.green },
  { key: 'neverAllowed', label: 'Never', emoji: '🔒', color: colors.indigo },
];

export default function AddAppModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ target?: string }>();
  const suspects = useCourtStore((s) => s.suspects);
  const addSuspect = useCourtStore((s) => s.addSuspect);
  const isPro = usePremiumStore((s) => s.isPro);

  const initialTarget = (params.target as BlockCategory) ?? 'distracting';
  const [target, setTarget] = useState<BlockCategory>(initialTarget);
  const [expanded, setExpanded] = useState<string | null>(APP_CATALOG[0]?.category ?? null);
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');

  const existingNames = new Set(suspects.map((s) => s.displayName.toLowerCase()));

  const handleAdd = (input: Parameters<typeof addSuspect>[0]) => {
    const result = addSuspect(input, isPro);
    if (!result.allowed) {
      Alert.alert('Pro Required', result.reason ?? 'Upgrade to add more.', [
        { text: 'Upgrade', onPress: () => router.push('/modals/paywall') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return false;
    }
    return true;
  };

  const addCatalogApp = (app: { name: string; color: string; villainName: string; dangerLevel: 1 | 2 | 3 | 4 | 5 }, category: typeof APP_CATALOG[number]['category']) => {
    handleAdd({
      displayName: app.name,
      category,
      villainName: app.villainName,
      iconColor: app.color,
      dangerLevel: app.dangerLevel,
      blockCategory: target,
    });
  };

  const addWebsite = () => {
    const name = siteName.trim();
    const url = siteUrl.trim();
    if (!name) {
      Alert.alert('Name needed', 'Give the website a name first.');
      return;
    }
    const ok = handleAdd({
      displayName: name,
      category: 'custom',
      villainName: 'Browser Bandit',
      iconColor: '#40B96E',
      dangerLevel: 3,
      blockCategory: target,
      isWebsite: true,
      url: url || undefined,
    });
    if (ok) {
      setSiteName('');
      setSiteUrl('');
    }
  };

  return (
    <CourtBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow="LINEUP"
          title="Add App or Website"
          subtitle="Pick from a category or add a custom site."
          assetKey="ASSET_SELECT_SUSPECTS_LINEUP"
        />

        {/* Target picker */}
        <View style={styles.targetRow}>
          <Text style={styles.targetLabel}>ADD TO</Text>
          <View style={styles.targetSeg}>
            {TARGETS.map((t) => {
              const on = target === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setTarget(t.key)}
                  style={[styles.targetBtn, on && { backgroundColor: `${t.color}22`, borderColor: `${t.color}55` }]}
                >
                  <Text style={styles.targetEmoji}>{t.emoji}</Text>
                  <Text style={[styles.targetText, on && { color: t.color }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Categories with apps */}
        {APP_CATALOG.map((cat) => {
          const open = expanded === cat.category;
          return (
            <CourtCard key={cat.category} variant="glass">
              <Pressable onPress={() => setExpanded(open ? null : cat.category)} style={styles.catHeader}>
                <View style={[styles.catIcon, { backgroundColor: `${cat.color}22`, borderColor: `${cat.color}3D` }]}>
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                </View>
                <View style={styles.catText}>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                  <Text style={styles.catSub}>{cat.apps.length} apps</Text>
                </View>
                <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
              </Pressable>

              {open ? (
                <View style={styles.appList}>
                  {cat.apps.map((app) => {
                    const added = existingNames.has(app.name.toLowerCase());
                    return (
                      <View key={app.id} style={styles.appRow}>
                        <View style={[styles.appDot, { backgroundColor: app.color }]}>
                          <Text style={styles.appDotText}>{app.name.slice(0, 1)}</Text>
                        </View>
                        <Text style={styles.appName} numberOfLines={1}>{app.name}</Text>
                        <Pressable
                          disabled={added}
                          onPress={() => addCatalogApp(app, cat.category)}
                          style={[styles.addBtn, added && styles.addBtnDone]}
                        >
                          <Text style={[styles.addBtnText, added && styles.addBtnTextDone]}>
                            {added ? '✓ Added' : '＋ Add'}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </CourtCard>
          );
        })}

        {/* Custom website */}
        <CourtCard variant="blue">
          <Text style={styles.siteTitle}>🌐  Add a Website</Text>
          <Text style={styles.siteSub}>Block or allow a specific site by name.</Text>
          <TextInput
            style={styles.input}
            value={siteName}
            onChangeText={setSiteName}
            placeholder="Name (e.g. Reddit)"
            placeholderTextColor={colors.muted}
          />
          <TextInput
            style={styles.input}
            value={siteUrl}
            onChangeText={setSiteUrl}
            placeholder="URL (e.g. reddit.com)"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            keyboardType="url"
          />
          <CourtButton title="Add Website" variant="primary" small onPress={addWebsite} />
        </CourtCard>

        <CourtButton title="Done" variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 40 },

  targetRow: { gap: 8 },
  targetLabel: { color: colors.labelTertiary, fontSize: 11, fontWeight: '700', letterSpacing: 0.6, paddingHorizontal: 2 },
  targetSeg: { flexDirection: 'row', gap: 8 },
  targetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(120,120,128,0.18)',
    backgroundColor: 'rgba(120,120,128,0.08)',
  },
  targetEmoji: { fontSize: 14 },
  targetText: { color: colors.labelSecondary, fontSize: 13, fontWeight: '600' },

  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catIcon: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  catEmoji: { fontSize: 18 },
  catText: { flex: 1, gap: 2 },
  catLabel: { color: colors.label, fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  catSub: { color: colors.labelSecondary, fontSize: 12, fontWeight: '500' },
  chevron: { color: colors.labelTertiary, fontSize: 12, fontWeight: '700' },

  appList: { marginTop: 12, gap: 8 },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  appDot: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  appDotText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  appName: { flex: 1, color: colors.label, fontSize: 14, fontWeight: '600' },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.blue,
  },
  addBtnDone: { backgroundColor: 'rgba(52,199,89,0.16)' },
  addBtnText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  addBtnTextDone: { color: colors.greenDark },

  siteTitle: { color: colors.label, fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  siteSub: { color: colors.labelSecondary, fontSize: 13, fontWeight: '400', marginTop: 4, marginBottom: 10 },
  input: {
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: radius.md,
    backgroundColor: 'rgba(120,120,128,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(120,120,128,0.14)',
    color: colors.label,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 10,
  },
});
