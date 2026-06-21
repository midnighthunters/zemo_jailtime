import { useState } from 'react';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius, shadows } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';
import { usePremiumStore } from '@/src/store/usePremiumStore';
import { describesSchedule } from '@/src/utils/lawPolicy';
import type { AppSuspect, FocusLaw } from '@/src/types/court';

const SCREEN_WIDTH = Dimensions.get('window').width;
// Two cards per row with padding and gap
const LAW_CARD_WIDTH = (SCREEN_WIDTH - 32 - 10) / 2;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getEnforcementColor(mode?: string) {
  if (mode === 'hardBlock') return colors.red;
  if (mode === 'focusSession') return colors.blue;
  if (mode === 'notice') return colors.orange;
  return colors.green;
}

function getEnforcementLabel(mode?: string) {
  if (mode === 'hardBlock') return '🔒 Hard Block';
  if (mode === 'focusSession') return '⏱ Focus Session';
  if (mode === 'notice') return '🔔 Notice';
  return '⚠️ Soft Block';
}

function getTriggerIcon(trigger?: string) {
  if (trigger === 'blockedWindow') return '🕐';
  if (trigger === 'dailyLimit') return '📊';
  if (trigger === 'focusSession') return '⏱';
  if (trigger === 'pickupLoop') return '🔄';
  if (trigger === 'unlockCount') return '🔓';
  return '📱';
}

function getScheduleText(law: FocusLaw) {
  if (law.blockedStart && law.blockedEnd) {
    return `${law.blockedStart} – ${law.blockedEnd}`;
  }
  return describesSchedule(law);
}

function getBlockingText(law: FocusLaw, suspects: AppSuspect[]) {
  if (law.category === 'all') return 'All apps';
  if (law.appIds && law.appIds.length > 0) {
    const names = law.appIds
      .map((id) => suspects.find((s) => s.id === id)?.displayName)
      .filter(Boolean)
      .slice(0, 2)
      .join(', ');
    return names || law.category;
  }
  return law.category;
}


// ─── Law Grid Card (compact, 2-up) ───────────────────────────────────────────
function FocusLawCard({
  law,
  suspects,
  locked,
  onToggle,
  onPress,
}: {
  law: FocusLaw;
  suspects: AppSuspect[];
  locked: boolean;
  onToggle: () => void;
  onPress: () => void;
}) {
  const enforcementColor = getEnforcementColor(law.enforcementMode);
  const blockingText = getBlockingText(law, suspects);

  return (
    <Pressable onPress={onPress} style={{ width: LAW_CARD_WIDTH }}>
      <View style={[lawCardStyles.card, law.isEnabled && lawCardStyles.cardActive]}>
        {Platform.OS !== 'web' ? (
          <BlurView tint="systemUltraThinMaterial" intensity={80} style={StyleSheet.absoluteFillObject} />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.72)' }]} />
        )}
        <View style={[StyleSheet.absoluteFillObject, lawCardStyles.tint, law.isEnabled && lawCardStyles.tintActive]} />
        <View style={lawCardStyles.highlight} />
        <View style={[lawCardStyles.border, law.isEnabled && lawCardStyles.borderActive]} />

        {/* Top: icon + toggle */}
        <View style={lawCardStyles.topRow}>
          <View style={lawCardStyles.iconWrap}>
            <AssetImage assetKey={law.assetKey} width={36} height={36} />
          </View>
          <Switch
            value={law.isEnabled}
            onValueChange={onToggle}
            thumbColor={colors.white}
            trackColor={{ true: colors.blue, false: 'rgba(120,120,128,0.22)' }}
            ios_backgroundColor="rgba(120,120,128,0.22)"
            style={lawCardStyles.switch}
          />
        </View>

        {/* Name */}
        <Text style={lawCardStyles.lawName} numberOfLines={2}>{law.name}</Text>

        {/* Enforcement pill */}
        <View style={[lawCardStyles.enforcePill, { backgroundColor: `${enforcementColor}18`, borderColor: `${enforcementColor}36` }]}>
          <Text style={[lawCardStyles.enforceText, { color: enforcementColor }]} numberOfLines={1}>
            {getEnforcementLabel(law.enforcementMode)}
          </Text>
        </View>

        {/* Apps line */}
        <Text style={lawCardStyles.appsLine} numberOfLines={1}>{blockingText}</Text>

        {locked && (
          <View style={lawCardStyles.lockOverlay}>
            <Text style={lawCardStyles.lockIcon}>🔒</Text>
            <Text style={lawCardStyles.lockText}>Pro</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}


const lawCardStyles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: 12,
    gap: 6,
    minHeight: 148,
    ...shadows.soft,
  },
  cardActive: {
    shadowColor: colors.blue,
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.xl,
  },
  tintActive: { backgroundColor: 'rgba(0,122,255,0.07)' },
  highlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  border: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  borderActive: { borderColor: 'rgba(0,122,255,0.28)' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  switch: { transform: [{ scaleX: 0.82 }, { scaleY: 0.82 }] },
  lawName: {
    color: colors.label,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 17,
  },
  enforcePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  enforceText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.1 },
  appsLine: {
    color: colors.labelSecondary,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  lockIcon: { fontSize: 20 },
  lockText: { color: colors.purple, fontSize: 12, fontWeight: '700' },
});


// ─── Add Law Card (compact, matches grid) ────────────────────────────────────
function AddLawCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: LAW_CARD_WIDTH }}>
      <View style={addCardStyles.card}>
        {Platform.OS !== 'web' ? (
          <BlurView tint="systemUltraThinMaterial" intensity={60} style={StyleSheet.absoluteFillObject} />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.5)' }]} />
        )}
        <View style={[StyleSheet.absoluteFillObject, addCardStyles.tint]} />
        <View style={addCardStyles.highlight} />
        <View style={addCardStyles.border} />
        <View style={addCardStyles.content}>
          <View style={addCardStyles.plusCircle}>
            <Text style={addCardStyles.plus}>+</Text>
          </View>
          <Text style={addCardStyles.label}>New Law</Text>
          <Text style={addCardStyles.sub}>Custom rule</Text>
        </View>
      </View>
    </Pressable>
  );
}

const addCardStyles = StyleSheet.create({
  card: {
    minHeight: 148,
    borderRadius: radius.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  tint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,122,255,0.05)', borderRadius: radius.xl },
  highlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  border: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(0,122,255,0.22)',
    borderStyle: 'dashed',
  },
  content: { alignItems: 'center', gap: 6 },
  plusCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,122,255,0.12)',
    borderWidth: 1.5, borderColor: 'rgba(0,122,255,0.28)',
    alignItems: 'center', justifyContent: 'center',
  },
  plus: { color: colors.blue, fontSize: 24, fontWeight: '300', lineHeight: 28 },
  label: { color: colors.blue, fontSize: 13, fontWeight: '700', letterSpacing: -0.2 },
  sub: { color: colors.labelSecondary, fontSize: 11, fontWeight: '500' },
});


// ─── Law Detail Sheet ─────────────────────────────────────────────────────────
function LawDetailSheet({
  law,
  suspects,
  isPro,
  visible,
  onClose,
  onToggle,
  onSave,
}: {
  law: FocusLaw | null;
  suspects: AppSuspect[];
  isPro: boolean;
  visible: boolean;
  onClose: () => void;
  onToggle: () => void;
  onSave: (id: string, updates: Partial<FocusLaw>) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dailyLimit, setDailyLimit] = useState(30);
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [syncedId, setSyncedId] = useState<string | null>(null);

  if (law && law.id !== syncedId) {
    setSyncedId(law.id);
    setName(law.name);
    setDescription(law.description);
    setDailyLimit(law.dailyLimitMinutes ?? 30);
    setSelectedAppIds([...(law.appIds ?? [])]);
  }

  if (!law) return null;
  const enforcementColor = getEnforcementColor(law.enforcementMode);
  const canEdit = isPro || !law.isPremium;

  const handleSave = () => {
    onSave(law.id, {
      name: name.trim() || law.name,
      description: description.trim() || law.description,
      dailyLimitMinutes: dailyLimit,
      appIds: selectedAppIds,
    });
    onClose();
  };

  const toggleApp = (appId: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId],
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={sheetStyles.root}>
        {Platform.OS !== 'web' ? (
          <BlurView tint="systemUltraThinMaterial" intensity={100} style={StyleSheet.absoluteFillObject} />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.background }]} />
        )}
        <View style={sheetStyles.inner}>
          <View style={sheetStyles.handle} />
          {/* Header */}
          <View style={sheetStyles.header}>
            <View style={sheetStyles.headerLeft}>
              <View style={sheetStyles.headerIcon}>
                <AssetImage assetKey={law.assetKey} width={40} height={40} />
              </View>
              <View style={sheetStyles.headerText}>
                <Text style={sheetStyles.headerEyebrow}>FOCUS LAW</Text>
                <Text style={sheetStyles.headerTitle} numberOfLines={1}>{law.name}</Text>
              </View>
            </View>
            <Switch
              value={law.isEnabled}
              onValueChange={onToggle}
              thumbColor={colors.white}
              trackColor={{ true: colors.blue, false: 'rgba(120,120,128,0.22)' }}
              ios_backgroundColor="rgba(120,120,128,0.22)"
            />
          </View>
          {/* Status badges */}
          <View style={sheetStyles.badgeRow}>
            <View style={[sheetStyles.badge, { backgroundColor: `${enforcementColor}18`, borderColor: `${enforcementColor}36` }]}>
              <Text style={[sheetStyles.badgeText, { color: enforcementColor }]}>{getEnforcementLabel(law.enforcementMode)}</Text>
            </View>
            <View style={sheetStyles.badge}>
              <Text style={sheetStyles.badgeText}>{getTriggerIcon(law.trigger)} {law.trigger ?? 'appLaunch'}</Text>
            </View>
            {getScheduleText(law) ? (
              <View style={sheetStyles.badge}>
                <Text style={sheetStyles.badgeText}>🕐 {getScheduleText(law)}</Text>
              </View>
            ) : null}
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={sheetStyles.scroll}>
            {/* Name */}
            <View style={sheetStyles.section}>
              <Text style={sheetStyles.sectionLabel}>LAW NAME</Text>
              <TextInput
                style={[sheetStyles.input, !canEdit && sheetStyles.inputDisabled]}
                value={name}
                onChangeText={setName}
                editable={canEdit}
                placeholder={law.name}
                placeholderTextColor={colors.muted}
              />
            </View>
            {/* Description */}
            <View style={sheetStyles.section}>
              <Text style={sheetStyles.sectionLabel}>DESCRIPTION</Text>
              <TextInput
                style={[sheetStyles.input, sheetStyles.textArea, !canEdit && sheetStyles.inputDisabled]}
                value={description}
                onChangeText={setDescription}
                editable={canEdit}
                multiline
                placeholder={law.description}
                placeholderTextColor={colors.muted}
                textAlignVertical="top"
              />
            </View>
            {/* Daily limit */}
            <View style={sheetStyles.section}>
              <Text style={sheetStyles.sectionLabel}>DAILY LIMIT</Text>
              <View style={sheetStyles.stepper}>
                <Text style={sheetStyles.stepperValue}>{dailyLimit} min</Text>
                <View style={sheetStyles.stepperBtns}>
                  <Pressable style={[sheetStyles.stepBtn, !canEdit && sheetStyles.stepBtnDisabled]} onPress={() => canEdit && setDailyLimit((v) => Math.max(5, v - 5))}>
                    <Text style={sheetStyles.stepBtnText}>−</Text>
                  </Pressable>
                  <Pressable style={[sheetStyles.stepBtn, !canEdit && sheetStyles.stepBtnDisabled]} onPress={() => canEdit && setDailyLimit((v) => Math.min(360, v + 5))}>
                    <Text style={sheetStyles.stepBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>
            {/* App selector */}
            <View style={sheetStyles.section}>
              <Text style={sheetStyles.sectionLabel}>APPS GOVERNED BY THIS LAW</Text>
              <Text style={sheetStyles.sectionSub}>
                {law.category === 'all' ? 'Applies to all apps.' : selectedAppIds.length === 0 ? 'No apps assigned. Tap to add.' : `${selectedAppIds.length} app${selectedAppIds.length > 1 ? 's' : ''} selected`}
              </Text>
              <View style={sheetStyles.appGrid}>
                {suspects.map((suspect) => {
                  const isSelected = selectedAppIds.includes(suspect.id);
                  return (
                    <Pressable key={suspect.id} onPress={() => canEdit && toggleApp(suspect.id)}
                      style={[sheetStyles.appChip, isSelected && sheetStyles.appChipSelected]}>
                      <View style={[sheetStyles.appDot, { backgroundColor: suspect.iconColor }]}>
                        <Text style={sheetStyles.appDotText}>{suspect.displayName.slice(0, 1)}</Text>
                      </View>
                      <Text style={[sheetStyles.appChipLabel, isSelected && sheetStyles.appChipLabelSelected]} numberOfLines={1}>
                        {suspect.displayName}
                      </Text>
                      {isSelected && <Text style={sheetStyles.appCheckmark}>✓</Text>}
                    </Pressable>
                  );
                })}
              </View>
            </View>
            {/* Info stats */}
            <View style={sheetStyles.infoGrid}>
              <View style={sheetStyles.infoCell}>
                <Text style={sheetStyles.infoCellLabel}>SENTENCE</Text>
                <Text style={sheetStyles.infoCellValue}>{law.firstPunishmentMinutes}–{law.maxSentenceMinutes} min</Text>
              </View>
              <View style={sheetStyles.infoCellDivider} />
              <View style={sheetStyles.infoCell}>
                <Text style={sheetStyles.infoCellLabel}>GRACE OPENS</Text>
                <Text style={sheetStyles.infoCellValue}>{law.graceOpens}</Text>
              </View>
              <View style={sheetStyles.infoCellDivider} />
              <View style={sheetStyles.infoCell}>
                <Text style={sheetStyles.infoCellLabel}>MULTIPLIER</Text>
                <Text style={sheetStyles.infoCellValue}>×{law.repeatMultiplier}</Text>
              </View>
            </View>
            {!canEdit && (
              <View style={sheetStyles.proGate}>
                <Text style={sheetStyles.proGateText}>🔒 Editing requires Supreme Court Mode (Pro)</Text>
              </View>
            )}
            <View style={sheetStyles.actions}>
              {canEdit
                ? <CourtButton title="Save Changes" variant="primary" onPress={handleSave} />
                : <CourtButton title="Upgrade to Edit" variant="gold" onPress={onClose} />}
              <CourtButton title="Close" variant="ghost" onPress={onClose} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
const sheetStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, paddingTop: 12 },
  handle: {
    width: 36, height: 5, borderRadius: 3,
    backgroundColor: 'rgba(60,60,67,0.2)',
    alignSelf: 'center', marginBottom: 12,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  headerIcon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(0,122,255,0.08)',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  headerText: { flex: 1, gap: 2 },
  headerEyebrow: { color: colors.blue, fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  headerTitle: { color: colors.label, fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  badgeRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 20, paddingBottom: 14,
  },
  badge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(120,120,128,0.1)',
    borderWidth: 1, borderColor: 'rgba(120,120,128,0.15)',
  },
  badgeText: { color: colors.labelSecondary, fontSize: 11, fontWeight: '600' },
  scroll: { paddingHorizontal: 20, paddingBottom: 48, gap: 20 },
  section: { gap: 8 },
  sectionLabel: { color: colors.labelTertiary, fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  sectionSub: { color: colors.labelSecondary, fontSize: 13, fontWeight: '400', marginTop: -4 },
  input: {
    minHeight: 46, paddingHorizontal: 14, paddingVertical: 11,
    borderRadius: radius.md,
    backgroundColor: 'rgba(120,120,128,0.08)',
    borderWidth: 1, borderColor: 'rgba(120,120,128,0.14)',
    color: colors.label, fontSize: 15, fontWeight: '500',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  inputDisabled: { opacity: 0.5 },
  stepper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: 'rgba(120,120,128,0.08)',
    borderWidth: 1, borderColor: 'rgba(120,120,128,0.14)',
  },
  stepperValue: { color: colors.label, fontSize: 16, fontWeight: '600' },
  stepperBtns: { flexDirection: 'row', gap: 10 },
  stepBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.blue,
    alignItems: 'center', justifyContent: 'center',
  },
  stepBtnDisabled: { opacity: 0.4 },
  stepBtnText: { color: colors.white, fontSize: 20, fontWeight: '400', lineHeight: 22 },
  appGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  appChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(120,120,128,0.08)',
    borderWidth: 1, borderColor: 'rgba(120,120,128,0.15)',
  },
  appChipSelected: { backgroundColor: 'rgba(0,122,255,0.1)', borderColor: 'rgba(0,122,255,0.3)' },
  appDot: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  appDotText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  appChipLabel: { color: colors.labelSecondary, fontSize: 13, fontWeight: '500', maxWidth: 100 },
  appChipLabelSelected: { color: colors.blue, fontWeight: '600' },
  appCheckmark: { color: colors.blue, fontSize: 12, fontWeight: '700' },
  infoGrid: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: 'rgba(120,120,128,0.07)',
    borderWidth: 1, borderColor: 'rgba(120,120,128,0.12)',
    overflow: 'hidden',
  },
  infoCell: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 },
  infoCellDivider: { width: 1, height: 36, backgroundColor: 'rgba(120,120,128,0.15)' },
  infoCellLabel: { color: colors.labelTertiary, fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  infoCellValue: { color: colors.label, fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  proGate: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: 'rgba(175,82,222,0.08)',
    borderWidth: 1, borderColor: 'rgba(175,82,222,0.2)',
  },
  proGateText: { color: colors.purple, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  actions: { gap: 10, paddingTop: 4 },
});


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

  const commitTimer = () => {
    const val = parseInt(draftMinutes, 10);
    if (!isNaN(val) && val > 0) onTimerChange(val);
    setEditing(false);
  };

  return (
    <View style={[styles.suspectRow, suspect.isSelected && styles.suspectRowSelected]}>
      {Platform.OS !== 'web' ? (
        <BlurView tint="systemUltraThinMaterial" intensity={18} style={StyleSheet.absoluteFillObject} />
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
              <Pressable onPress={() => { if (!locked) setEditing(true); }} style={styles.timerPill}>
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
    </View>
  );
}


// ─── Main screen ──────────────────────────────────────────────────────────────
export default function CulpritsTab() {
  const router = useRouter();
  const suspects = useCourtStore((state) => state.suspects);
  const laws = useCourtStore((state) => state.laws);
  const toggleSuspect = useCourtStore((state) => state.toggleSuspect);
  const updateLaw = useCourtStore((state) => state.updateLaw);
  const toggleLaw = useCourtStore((state) => state.toggleLaw);
  const isPro = usePremiumStore((state) => state.isPro);

  const [selectedLaw, setSelectedLaw] = useState<FocusLaw | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const selectedCount = suspects.filter((s) => s.isSelected).length;
  const enabledLawsCount = laws.filter((l) => l.isEnabled).length;

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

  const handleLawToggle = (lawId: string, isPremium?: boolean) => {
    if (isPremium && !isPro) {
      Alert.alert('Pro Required', 'This law requires Supreme Court Mode.', [
        { text: 'Upgrade', onPress: () => router.push('/modals/paywall') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    const result = toggleLaw(lawId, isPro);
    if (!result.allowed) {
      Alert.alert('Cannot Enable', result.reason ?? 'Could not activate this law.', [
        { text: 'Upgrade', onPress: () => router.push('/modals/paywall') },
        { text: 'OK', style: 'cancel' },
      ]);
    }
  };

  const handleOpenSheet = (law: FocusLaw) => {
    setSelectedLaw(law);
    setSheetVisible(true);
  };

  const handleSaveLaw = (id: string, updates: Partial<FocusLaw>) => {
    const result = updateLaw(id, updates, isPro);
    if (!result.allowed) router.push('/modals/paywall');
  };

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScreenHeader
          eyebrow="SUSPECT LINEUP"
          title="Culprits"
          subtitle="Set your focus laws and add the apps they govern."
          assetKey="ASSET_SELECT_SUSPECTS_LINEUP"
        />

        {/* ── Focus Laws Section ────────────────────────────────────── */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <AssetImage assetKey="ASSET_LAW_BOOK_LIBRARY" width={32} height={32} />
            <View>
              <Text style={styles.sectionTitle}>Focus Laws</Text>
              <Text style={styles.sectionCopy}>{enabledLawsCount} active · Tap a law to edit</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/laws')} style={styles.seeAllBtn}>
            <Text style={styles.seeAllText}>See All</Text>
          </Pressable>
        </View>

        {/* 2-column law grid */}
        <View style={styles.lawGrid}>
          {laws.map((law) => (
            <FocusLawCard
              key={law.id}
              law={law}
              suspects={suspects}
              locked={!!law.isPremium && !isPro}
              onToggle={() => handleLawToggle(law.id, law.isPremium)}
              onPress={() => handleOpenSheet(law)}
            />
          ))}
          <AddLawCard onPress={() => router.push('/modals/law-editor')} />
        </View>

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
      </ScrollView>

      {/* Law Detail Sheet */}
      <LawDetailSheet
        law={selectedLaw}
        suspects={suspects}
        isPro={isPro}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onToggle={() => selectedLaw && handleLawToggle(selectedLaw.id, selectedLaw.isPremium)}
        onSave={handleSaveLaw}
      />
    </CourtBackground>
  );
}


const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 110,
  },

  // ── section header ──
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { color: colors.label, fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  sectionCopy: { color: colors.labelSecondary, fontSize: 12, fontWeight: '500' },
  seeAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,122,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.16)',
  },
  seeAllText: { color: colors.blue, fontSize: 12, fontWeight: '600' },

  // ── law grid ──
  lawGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
  suspectRowSelected: {},
  suspectRowTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.xl,
  },
  suspectRowTintSelected: { backgroundColor: 'rgba(0,122,255,0.07)' },
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
  suspectRowBorderSelected: { borderColor: 'rgba(0,122,255,0.26)' },
  suspectIcon: {
    width: 46, height: 46,
    borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
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
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.22)',
  },
  timerPillText: { color: colors.blue, fontSize: 12, fontWeight: '600' },
  timerEditIcon: { color: colors.blue, fontSize: 11 },
  timerInput: {
    width: 72,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,122,255,0.08)',
    borderWidth: 1,
    borderColor: colors.blue,
    color: colors.label,
    fontSize: 13, fontWeight: '600',
    textAlign: 'center',
  },

  // ── blocking CTA ──
  blockingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  blockingText: { flex: 1, gap: 8 },
  blockingTitle: { color: colors.label, fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  blockingCopy: { color: colors.labelSecondary, fontSize: 13, lineHeight: 18, fontWeight: '400' },
});
