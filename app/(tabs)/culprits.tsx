import { useState } from 'react';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
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
  lawId: string;
  isPremium?: boolean;
};

const LAW_PRESETS: LawPreset[] = [
  { id: 'preset-9to5',           emoji: '💼', title: '9–5 Work Lock',          description: 'Hard-block all distracting apps Monday–Friday 9 AM – 5 PM.',     lawId: 'workday-focus-injunction',  isPremium: true },
  { id: 'preset-weekend-morning',emoji: '🌅', title: 'Weekend Focus 9–12',      description: 'Protect Saturday & Sunday mornings from scrolling.',              lawId: 'weekend-binge-restraining', isPremium: true },
  { id: 'preset-morning-sacred', emoji: '🌄', title: 'Morning Sacred Hour',     description: 'Keep 6–8 AM free from all apps to start with intention.',         lawId: 'morning-mind-protection' },
  { id: 'preset-deep-work',      emoji: '🔒', title: 'Deep Work Block 10–12',   description: 'Zero tolerance during deep work hours, weekdays only.',           lawId: 'deep-work-contempt-order',  isPremium: true },
  { id: 'preset-bedtime',        emoji: '🌙', title: 'Midnight Swipe Ban',       description: 'Hard-block after 11 PM until 6 AM every night.',                 lawId: 'midnight-swipe-ban' },
  { id: 'preset-dinner',         emoji: '🍽️', title: 'Family Table Peace',      description: 'No phones 7–9 PM during family / dinner time.',                  lawId: 'family-table-peace' },
  { id: 'preset-sunday-reset',   emoji: '🔄', title: 'Sunday Reset 6–9 PM',     description: 'Protect Sunday evening for planning, journaling, and rest.',      lawId: 'sunday-reset-statute' },
  { id: 'preset-pomodoro',       emoji: '⏱️', title: 'Pomodoro Protection',     description: 'Block suspects during every 25-min focus timer session.',         lawId: 'pomodoro-protection-rule' },
];

// ─── Suspect row ──────────────────────────────────────────────────────────────
function SuspectRow({
  suspect, onToggle, onTimerChange, isPro,
}: {
  suspect: AppSuspect;
  onToggle: () => void;
  onTimerChange: (minutes: number) => void;
  isPro: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draftMinutes, setDraftMinutes] = useState(String(suspect.dailyUsageMinutes || 30));
  const locked = suspect.isPremium && !isPro;

  const scale = useSharedValue(1);
  const rowAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const commitTimer = () => {
    const val = parseInt(draftMinutes, 10);
    if (!isNaN(val) && val > 0) onTimerChange(val);
    setEditing(false);
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(260).springify().damping(18)}
      layout={LinearTransition.springify().damping(18)}
      style={[styles.suspectRow, suspect.isSelected && styles.suspectRowSelected, rowAnimStyle]}
    >
      {Platform.OS !== 'web' ? (
        <BlurView
          tint="systemUltraThinMaterial"
          intensity={18}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.72)' }]} />
      )}
      <View style={[StyleSheet.absoluteFillObject, styles.suspectRowTint, suspect.isSelected && styles.suspectRowTintSelected]} />
      <View style={styles.suspectRowHighlight} />
      <View style={[styles.suspectRowBorder, suspect.isSelected && styles.suspectRowBorderSelected]} />

      <View style={[styles.suspectIcon, { backgroundColor: suspect.iconColor }]}>
        <Text style={styles.suspectIconText}>{suspect.displayName.slice(0, 1)}</Text>
      </View>
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
              <Pressable
                onPress={() => { if (!locked) setEditing(true); }}
                style={styles.timerPill}
              >
                <Text style={styles.timerPillText}>{draftMinutes} min</Text>
                {!locked && <Text style={styles.timerEditIcon}> ✎</Text>}
              </Pressable>
            )}
          </View>
        )}
      </View>
      <View style={styles.suspectActions}>
        {locked ? <StampBadge label="Pro" tone="purple" /> : null}
        <Switch
          value={suspect.isSelected}
          onValueChange={onToggle}
          thumbColor={colors.white}
          trackColor={{ true: colors.blue, false: 'rgba(120,120,128,0.22)' }}
          ios_backgroundColor="rgba(120,120,128,0.22)"
        />
      </View>
    </Animated.View>
  );
}

// ─── Preset card ─────────────────────────────────────────────────────────────
function PresetCard({
  preset, law, onActivate, isPro,
}: {
  preset: LawPreset;
  law?: FocusLaw;
  onActivate: () => void;
  isPro: boolean;
}) {
  const locked = preset.isPremium && !isPro;
  const active = law?.isEnabled ?? false;

  const scale = useSharedValue(1);
  const cardAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      entering={FadeInDown.duration(260).springify().damping(18)}
      layout={LinearTransition.springify().damping(18)}
      style={[styles.presetCard, cardAnimStyle]}
    >
      {Platform.OS !== 'web' ? (
        <BlurView
          tint="systemUltraThinMaterial"
          intensity={18}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.72)' }]} />
      )}
      <View style={[StyleSheet.absoluteFillObject, styles.presetTint, active && styles.presetTintActive]} />
      <View style={styles.presetHighlight} />
      <View style={[styles.presetBorder, active && styles.presetBorderActive]} />

      <Text style={styles.presetEmoji}>{preset.emoji}</Text>
      <View style={styles.presetBody}>
        <View style={styles.presetTopRow}>
          <Text style={styles.presetTitle}>{preset.title}</Text>
          {locked && <StampBadge label="Pro" tone="purple" />}
          {active && <StampBadge label="Active" tone="success" />}
        </View>
        <Text style={styles.presetDesc}>{preset.description}</Text>
      </View>
      <Pressable
        onPress={onActivate}
        onPressIn={() => { scale.value = withSpring(0.975, { damping: 18, stiffness: 380 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 13, stiffness: 260 }); }}
        style={[styles.presetToggle, active && styles.presetToggleActive]}
      >
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
      Alert.alert(
        'Pro Required',
        result.reason ?? 'Upgrade to add more suspects.',
        [
          { text: 'Upgrade', onPress: () => router.push('/modals/paywall') },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    }
  };

  const handleTimerChange = (suspect: AppSuspect, minutes: number) => {
    const matchingLaw = laws.find(
      (l) => l.category === suspect.category && l.trigger === 'dailyLimit',
    );
    if (matchingLaw) updateLaw(matchingLaw.id, { dailyLimitMinutes: minutes }, isPro);
  };

  const handlePresetToggle = (preset: LawPreset) => {
    if (preset.isPremium && !isPro) {
      Alert.alert('Pro Required', 'This law requires Supreme Court Mode.', [
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ScreenHeader
          eyebrow="SUSPECT LINEUP"
          title="Culprits"
          subtitle="Add your distracting apps and set the laws they must obey."
          assetKey="ASSET_SELECT_SUSPECTS_LINEUP"
        />

        {/* ── Distracting Apps ──────────────────────────────────────── */}
        <CourtCard variant="glass">
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderText}>
              <StampBadge
                label={`${selectedCount} / ${isPro ? '∞' : '3'} selected`}
                tone={selectedCount >= 3 && !isPro ? 'danger' : 'blue'}
              />
              <Text style={styles.cardTitle}>Distracting Apps</Text>
              <Text style={styles.cardCopy}>
                Select apps for the court to monitor. Tap the timer to set a daily limit.
                {!isPro ? ' Free plan: 3 apps.' : ''}
              </Text>
            </View>
            <AssetImage assetKey="ASSET_REPEAT_OFFENDER_APP" width={80} height={80} />
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
          variant="secondary"
          onPress={() => router.push('/modals/law-editor')}
        />

        {/* ── Real iOS Blocking ─────────────────────────────────────── */}
        <CourtCard variant="blue">
          <View style={styles.blockingRow}>
            <AssetImage assetKey="ASSET_STRICT_MODE_LOCK" width={64} height={64} />
            <View style={styles.blockingText}>
              <Text style={styles.blockingTitle}>Real iOS Blocking</Text>
              <Text style={styles.blockingCopy}>
                Select installed apps. When your daily limit hits, iOS locks them with a jail
                screen — even when JailTime is closed.
              </Text>
              <CourtButton
                title="⚖️  Select Apps to Block"
                variant="primary"
                small
                onPress={() => router.push('/modals/select-apps')}
              />
            </View>
          </View>
        </CourtCard>

        {/* ── Quick-Add Laws ───────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <AssetImage assetKey="ASSET_LAW_BOOK_LIBRARY" width={36} height={36} />
            <View>
              <Text style={styles.sectionTitle}>Quick-Add Laws</Text>
              <Text style={styles.sectionCopy}>Tap a preset to instantly activate it.</Text>
            </View>
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

        {/* ── Custom Law Builder ───────────────────────────────────── */}
        <CourtCard variant="purple">
          <View style={styles.customLawRow}>
            <AssetImage assetKey="ASSET_STRICT_MODE_LOCK" width={72} height={72} />
            <View style={styles.customLawText}>
              <Text style={styles.customLawTitle}>Build Your Own Law</Text>
              <Text style={styles.customLawCopy}>
                Create custom time windows, daily limits, and enforcement modes tailored to your schedule.
              </Text>
              <View style={styles.customLawButtons}>
                <CourtButton
                  title="Create Custom Law"
                  variant="primary"
                  small
                  onPress={() => router.push('/modals/law-editor')}
                />
                {!isPro && (
                  <CourtButton
                    title="Upgrade to Pro"
                    variant="ghost"
                    small
                    onPress={() => router.push('/modals/paywall')}
                  />
                )}
              </View>
            </View>
          </View>
        </CourtCard>
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 110,
  },

  // ── header card ──
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardHeaderText: { flex: 1, gap: 8 },
  cardTitle: { color: colors.label, fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  cardCopy: { color: colors.labelSecondary, fontSize: 13, lineHeight: 18, fontWeight: '400' },

  // ── suspect rows ──
  suspectList: { gap: 10 },
  suspectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.soft,
  },
  suspectRowSelected: {
    // tint change is handled by suspectRowTintSelected
  },
  suspectRowTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.xl,
  },
  suspectRowTintSelected: {
    backgroundColor: 'rgba(0,122,255,0.07)',
  },
  suspectRowHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  suspectRowBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  suspectRowBorderSelected: {
    borderColor: 'rgba(0,122,255,0.26)',
  },
  suspectIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suspectIconText: { color: colors.white, fontSize: 20, fontWeight: '700' },
  suspectInfo: { flex: 1, gap: 3 },
  suspectName: { color: colors.label, fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
  suspectVillain: { color: colors.blue, fontSize: 12, fontWeight: '500' },
  suspectActions: { alignItems: 'center', gap: 6 },

  // ── timer ──
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  timerLabel: { color: colors.labelSecondary, fontSize: 11, fontWeight: '500' },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.22)',
  },
  timerPillText: { color: colors.blue, fontSize: 12, fontWeight: '600' },
  timerEditIcon: { color: colors.blue, fontSize: 11 },
  timerInput: {
    width: 72,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,122,255,0.08)',
    borderWidth: 1,
    borderColor: colors.blue,
    color: colors.label,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ── section header ──
  sectionHeader: { paddingHorizontal: 2 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { color: colors.label, fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  sectionCopy: { color: colors.labelSecondary, fontSize: 13, fontWeight: '400' },

  // ── preset cards ──
  presetList: { gap: 10 },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.soft,
  },
  presetTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.xl,
  },
  presetTintActive: {
    backgroundColor: 'rgba(0,122,255,0.07)',
  },
  presetHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.48)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  presetBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  presetBorderActive: {
    borderColor: 'rgba(0,122,255,0.26)',
  },
  // ← removed presetCardActive (now handled by tint)
  presetEmoji: { fontSize: 26, width: 36, textAlign: 'center' },
  presetBody: { flex: 1, gap: 4 },
  presetTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  presetTitle: { color: colors.label, fontSize: 15, fontWeight: '600', flex: 1, letterSpacing: -0.2 },
  presetDesc: { color: colors.labelSecondary, fontSize: 12, lineHeight: 17, fontWeight: '400' },
  presetToggle: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(120,120,128,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(120,120,128,0.18)',
  },
  presetToggleActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  presetToggleText: { color: colors.labelSecondary, fontSize: 12, fontWeight: '600' },
  presetToggleTextActive: { color: colors.white },

  // ── blocking CTA ──
  blockingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  blockingText: { flex: 1, gap: 8 },
  blockingTitle: { color: colors.label, fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  blockingCopy: { color: colors.labelSecondary, fontSize: 13, lineHeight: 18, fontWeight: '400' },

  // ── custom law ──
  customLawRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  customLawText: { flex: 1, gap: 8 },
  customLawTitle: { color: colors.label, fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  customLawCopy: { color: colors.labelSecondary, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  customLawButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
