/**
 * Culprits Tab
 * – Manage distracting apps (suspects) with per-app daily time limits
 * – Quick-add preset custom laws: 9-5 Work Lock, Weekend Focus, Morning Sacred Hour, etc.
 * – Full control stays in existing useCourtStore / FocusLaw data model
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, LinearTransition } from 'react-native-reanimated';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius, shadows } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';
import { usePremiumStore } from '@/src/store/usePremiumStore';
import type { AppSuspect, FocusLaw } from '@/src/types/court';

// ─── Preset quick-law templates ───────────────────────────────────────────────
type LawPreset = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  lawId: string;        // maps to an existing law in DEFAULT_LAWS
  isPremium?: boolean;
};

const LAW_PRESETS: LawPreset[] = [
  {
    id: 'preset-9to5',
    emoji: '💼',
    title: '9–5 Work Lock',
    description: 'Hard-block all distracting apps Monday–Friday 9 AM – 5 PM.',
    lawId: 'workday-focus-injunction',
    isPremium: true,
  },
  {
    id: 'preset-weekend-morning',
    emoji: '🌅',
    title: 'Weekend Focus 9–12',
    description: 'Protect Saturday & Sunday mornings 9 AM – 12 PM from scrolling.',
    lawId: 'weekend-binge-restraining',
    isPremium: true,
  },
  {
    id: 'preset-morning-sacred',
    emoji: '🌄',
    title: 'Morning Sacred Hour',
    description: 'Keep 6–8 AM free from all apps to start your day with intention.',
    lawId: 'morning-mind-protection',
  },
  {
    id: 'preset-deep-work',
    emoji: '🔒',
    title: 'Deep Work Block 10–12',
    description: 'Zero tolerance during deep work hours, weekdays only.',
    lawId: 'deep-work-contempt-order',
    isPremium: true,
  },
  {
    id: 'preset-bedtime',
    emoji: '🌙',
    title: 'Midnight Swipe Ban',
    description: 'Hard-block after 11 PM until 6 AM every night.',
    lawId: 'midnight-swipe-ban',
  },
  {
    id: 'preset-dinner',
    emoji: '🍽️',
    title: 'Family Table Peace',
    description: 'No phones 7–9 PM during family / dinner time.',
    lawId: 'family-table-peace',
  },
  {
    id: 'preset-sunday-reset',
    emoji: '🔄',
    title: 'Sunday Reset 6–9 PM',
    description: 'Protect Sunday evening for planning, journaling, and rest.',
    lawId: 'sunday-reset-statute',
  },
  {
    id: 'preset-pomodoro',
    emoji: '⏱️',
    title: 'Pomodoro Protection',
    description: 'Block suspects during every 25-min focus timer session.',
    lawId: 'pomodoro-protection-rule',
  },
];

// ─── Suspect row with inline timer input ─────────────────────────────────────
function SuspectRow({ suspect, onToggle, onTimerChange, isPro }: {
  suspect: AppSuspect;
  onToggle: () => void;
  onTimerChange: (minutes: number) => void;
  isPro: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draftMinutes, setDraftMinutes] = useState(String(suspect.dailyUsageMinutes || 30));
  const locked = suspect.isPremium && !isPro;

  const commitTimer = () => {
    const val = parseInt(draftMinutes, 10);
    if (!isNaN(val) && val > 0) onTimerChange(val);
    setEditing(false);
  };

  return (
    <Animated.View entering={FadeInUp.duration(260).springify().damping(18)} layout={LinearTransition.springify().damping(18)} style={[styles.suspectRow, suspect.isSelected && styles.suspectRowSelected]}>
      {/* icon */}
      <View style={[styles.suspectIcon, { backgroundColor: suspect.iconColor }]}>
        <Text style={styles.suspectIconText}>{suspect.displayName.slice(0, 1)}</Text>
      </View>
      {/* info */}
      <View style={styles.suspectInfo}>
        <Text style={styles.suspectName}>{suspect.displayName}</Text>
        <Text style={styles.suspectVillain}>{suspect.villainName}</Text>
        {suspect.isSelected && (
          <View style={styles.timerRow}>
            <Text style={styles.timerLabel}>Daily limit:</Text>
            {editing ? (
              <TextInput
                style={styles.timerInput}
                value={draftMinutes}
                onChangeText={setDraftMinutes}
                keyboardType="numeric"
                autoFocus
                onBlur={commitTimer}
                onSubmitEditing={commitTimer}
                returnKeyType="done"
                maxLength={4}
              />
            ) : (
              <Pressable onPress={() => { if (!locked) setEditing(true); }} style={styles.timerPill}>
                <Text style={styles.timerPillText}>{draftMinutes} min</Text>
                {!locked && <Text style={styles.timerEditIcon}> ✎</Text>}
              </Pressable>
            )}
          </View>
        )}
      </View>
      {/* badges + toggle */}
      <View style={styles.suspectActions}>
        {locked ? <StampBadge label="Pro" tone="purple" /> : null}
        <Switch
          value={suspect.isSelected}
          onValueChange={onToggle}
          thumbColor={suspect.isSelected ? colors.gold : colors.muted}
          trackColor={{ true: colors.deepGold, false: colors.woodDark }}
        />
      </View>
    </Animated.View>
  );
}

// ─── Preset law card ──────────────────────────────────────────────────────────
function PresetCard({ preset, law, onActivate, isPro }: {
  preset: LawPreset;
  law?: FocusLaw;
  onActivate: () => void;
  isPro: boolean;
}) {
  const locked = preset.isPremium && !isPro;
  const active = law?.isEnabled ?? false;

  return (
    <Animated.View entering={FadeInDown.duration(260).springify().damping(18)} layout={LinearTransition.springify().damping(18)} style={[styles.presetCard, active && styles.presetCardActive]}>
      <Text style={styles.presetEmoji}>{preset.emoji}</Text>
      <View style={styles.presetBody}>
        <View style={styles.presetTopRow}>
          <Text style={styles.presetTitle}>{preset.title}</Text>
          {locked && <StampBadge label="Pro" tone="purple" />}
          {active && <StampBadge label="Active" tone="success" />}
        </View>
        <Text style={styles.presetDesc}>{preset.description}</Text>
      </View>
      <Pressable onPress={onActivate} style={[styles.presetToggle, active && styles.presetToggleActive]}>
        <Text style={[styles.presetToggleText, active && styles.presetToggleTextActive]}>
          {active ? 'ON' : 'OFF'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function CulpritsTab() {
  const router = useRouter();
  const suspects = useCourtStore((state) => state.suspects);
  const laws = useCourtStore((state) => state.laws);
  const toggleSuspect = useCourtStore((state) => state.toggleSuspect);
  const updateLaw = useCourtStore((state) => state.updateLaw);
  const toggleLaw = useCourtStore((state) => state.toggleLaw);
  const isPro = usePremiumStore((state) => state.isPro);

  const selectedCount = suspects.filter((s) => s.isSelected).length;

  const handleToggleSuspect = (id: string) => {
    const result = toggleSuspect(id, isPro);
    if (!result.allowed) {
      Alert.alert('Supreme Court Required', result.reason ?? 'Upgrade to add more suspects.', [
        { text: 'Upgrade', onPress: () => router.push('/modals/paywall') },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleTimerChange = (suspect: AppSuspect, minutes: number) => {
    // update the matching law that targets this category with a new dailyLimitMinutes
    // we use updateLaw for any existing law tied to this category
    const matchingLaw = laws.find((l) => l.category === suspect.category && l.trigger === 'dailyLimit');
    if (matchingLaw) {
      updateLaw(matchingLaw.id, { dailyLimitMinutes: minutes }, isPro);
    }
  };

  const handlePresetToggle = (preset: LawPreset) => {
    if (preset.isPremium && !isPro) {
      Alert.alert('Supreme Court Required', 'This law requires Supreme Court Mode.', [
        { text: 'Upgrade', onPress: () => router.push('/modals/paywall') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    const result = toggleLaw(preset.lawId, isPro);
    if (!result.allowed) {
      Alert.alert('Cannot Enable', result.reason ?? 'Could not activate this law.', [
        { text: 'Upgrade', onPress: () => router.push('/modals/paywall') },
        { text: 'OK', style: 'cancel' },
      ]);
    }
  };

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScreenHeader
          eyebrow="SUSPECT LINEUP"
          title="Culprits"
          subtitle="Add your distracting apps and set the laws they must obey."
          assetKey="ASSET_SELECT_SUSPECTS_LINEUP"
        />

        {/* ── Suspects Section ─────────────────────────────────────── */}
        <CourtCard variant="dark" delay={80}>
          <View style={styles.suspectHeaderRow}>
            <View style={styles.suspectHeaderText}>
              <StampBadge label={`${selectedCount} / ${isPro ? '∞' : '3'} selected`} tone={selectedCount >= 3 && !isPro ? 'danger' : 'gold'} />
              <Text style={styles.cardTitle}>Distracting Apps</Text>
              <Text style={styles.cardCopy}>
                Select the apps you want the court to monitor. Tap the timer to set a daily limit.
                {!isPro ? ' Free plan allows 3 apps.' : ''}
              </Text>
            </View>
            <AssetImage assetKey="ASSET_REPEAT_OFFENDER_APP" width={88} height={88} />
          </View>
        </CourtCard>

        <View style={styles.suspectList}>
          {suspects.map((suspect) => (
            <SuspectRow
              key={suspect.id}
              suspect={suspect}
              isPro={isPro}
              onToggle={() => handleToggleSuspect(suspect.id)}
              onTimerChange={(minutes) => handleTimerChange(suspect, minutes)}
            />
          ))}
        </View>

        <CourtButton
          title="+ Add Custom App"
          variant="wood"
          onPress={() => router.push('/modals/law-editor')}
        />

        {/* ── Custom Law Presets Section ───────────────────────────── */}
        <View style={styles.presetSectionHeader}>
          <AssetImage assetKey="ASSET_LAW_BOOK_LIBRARY" width={40} height={40} />
          <View style={styles.presetSectionText}>
            <Text style={styles.presetSectionTitle}>Quick-Add Laws</Text>
            <Text style={styles.presetSectionCopy}>Tap a preset to instantly activate it. Pro laws need Supreme Court Mode.</Text>
          </View>
        </View>

        <View style={styles.presetList}>
          {LAW_PRESETS.map((preset) => {
            const law = laws.find((l) => l.id === preset.lawId);
            return (
              <PresetCard
                key={preset.id}
                preset={preset}
                law={law}
                isPro={isPro}
                onActivate={() => handlePresetToggle(preset)}
              />
            );
          })}
        </View>

        {/* ── Custom Law Builder CTA ───────────────────────────────── */}
        <CourtCard variant="purple" delay={320}>
          <View style={styles.customLawRow}>
            <AssetImage assetKey="ASSET_STRICT_MODE_LOCK" width={80} height={80} />
            <View style={styles.customLawText}>
              <Text style={styles.customLawTitle}>Build Your Own Law</Text>
              <Text style={styles.customLawCopy}>
                Create fully custom time windows, daily limits, and enforcement modes tailored to your schedule.
              </Text>
              <View style={styles.customLawButtons}>
                <CourtButton title="Create Custom Law" variant="gold" small onPress={() => router.push('/modals/law-editor')} />
                {!isPro && <CourtButton title="Upgrade to Pro" variant="ghost" small onPress={() => router.push('/modals/paywall')} />}
              </View>
            </View>
          </View>
        </CourtCard>

      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingBottom: 112 },

  // ── suspect rows ──
  suspectHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  suspectHeaderText: { flex: 1, gap: 8 },
  cardTitle: { color: colors.cream, fontSize: 22, fontWeight: '900' },
  cardCopy: { color: colors.parchment, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  suspectList: { gap: 10 },
  suspectRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: radius.lg,
    backgroundColor: 'rgba(58, 29, 17, 0.9)',
    borderWidth: 1, borderColor: 'rgba(255,242,210,0.16)',
    ...shadows.soft,
  },
  suspectRowSelected: { borderColor: colors.gold, backgroundColor: 'rgba(255,200,61,0.1)' },
  suspectIcon: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.28)',
  },
  suspectIconText: { color: colors.white, fontSize: 20, fontWeight: '900' },
  suspectInfo: { flex: 1, gap: 3 },
  suspectName: { color: colors.cream, fontSize: 15, fontWeight: '900' },
  suspectVillain: { color: colors.gold, fontSize: 12, fontWeight: '800' },
  suspectActions: { alignItems: 'center', gap: 6 },

  // ── timer ──
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  timerLabel: { color: colors.parchment, fontSize: 11, fontWeight: '800' },
  timerPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,200,61,0.18)',
    borderWidth: 1, borderColor: colors.deepGold,
  },
  timerPillText: { color: colors.gold, fontSize: 12, fontWeight: '900' },
  timerEditIcon: { color: colors.gold, fontSize: 11 },
  timerInput: {
    width: 64, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,200,61,0.22)',
    borderWidth: 1, borderColor: colors.gold,
    color: colors.cream, fontSize: 13, fontWeight: '900',
    textAlign: 'center',
  },

  // ── presets ──
  presetSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4 },
  presetSectionText: { flex: 1, gap: 4 },
  presetSectionTitle: { color: colors.cream, fontSize: 19, fontWeight: '900' },
  presetSectionCopy: { color: colors.parchment, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  presetList: { gap: 10 },
  presetCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: radius.lg,
    backgroundColor: 'rgba(42,18,12,0.9)',
    borderWidth: 1, borderColor: 'rgba(255,242,210,0.16)',
    ...shadows.soft,
  },
  presetCardActive: { borderColor: colors.gold, backgroundColor: 'rgba(255,200,61,0.1)' },
  presetEmoji: { fontSize: 28, width: 40, textAlign: 'center' },
  presetBody: { flex: 1, gap: 5 },
  presetTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  presetTitle: { color: colors.cream, fontSize: 15, fontWeight: '900', flex: 1 },
  presetDesc: { color: colors.parchment, fontSize: 12, lineHeight: 17, fontWeight: '700' },
  presetToggle: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,242,210,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,242,210,0.2)',
  },
  presetToggleActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  presetToggleText: { color: colors.muted, fontSize: 12, fontWeight: '900' },
  presetToggleTextActive: { color: colors.ink },

  // ── custom law CTA ──
  customLawRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  customLawText: { flex: 1, gap: 8 },
  customLawTitle: { color: colors.cream, fontSize: 18, fontWeight: '900' },
  customLawCopy: { color: colors.parchment, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  customLawButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
