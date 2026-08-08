import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
import { ProtectedAppsCard } from '@/src/components/ProtectedAppsCard';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius, shadows } from '@/src/constants/theme';
import { syncPolicyToNative } from '@/src/services/screenTime/BlockingBridge';
import { useCourtStore } from '@/src/store/useCourtStore';
import { usePremiumStore } from '@/src/store/usePremiumStore';
import { jailedCases } from '@/src/utils/docket';
import { describesSchedule } from '@/src/utils/lawPolicy';
import type { FocusLaw } from '@/src/types/court';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CAROUSEL_H_PAD = 20;
const CAROUSEL_CARD_WIDTH = SCREEN_WIDTH - CAROUSEL_H_PAD * 2;
const MAX_CAROUSEL_LAWS = 5;

const categoryAccent: Record<string, string> = {
  shortVideo: colors.red,
  social: colors.blue,
  video: colors.purple,
  game: colors.green,
  shopping: colors.orange,
  dating: colors.pink,
  news: colors.teal,
  custom: colors.indigo,
  all: colors.blue,
};

function getEnforcementColor(mode?: string) {
  if (mode === 'hardBlock') return colors.red;
  if (mode === 'focusSession') return colors.blue;
  if (mode === 'notice') return colors.orange;
  return colors.green;
}

function getEnforcementLabel(mode?: string) {
  if (mode === 'hardBlock') return 'Hard Block';
  if (mode === 'focusSession') return 'Focus Session';
  if (mode === 'notice') return 'Notice';
  return 'Soft Block';
}

function getScheduleText(law: FocusLaw) {
  if (law.blockedStart && law.blockedEnd) return `${law.blockedStart} – ${law.blockedEnd}`;
  return describesSchedule(law);
}

// ─── Carousel Law Card ────────────────────────────────────────────────────────
function CarouselLawCard({
  law,
  locked,
  onToggle,
  onPress,
}: {
  law: FocusLaw;
  locked: boolean;
  onToggle: () => void;
  onPress: () => void;
}) {
  const accent = categoryAccent[law.category] ?? colors.blue;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${law.name}, ${law.isEnabled ? 'active' : 'off'}. Tap to edit.`}
      onPress={onPress}
      style={carouselStyles.cardWrap}
    >
      <View style={carouselStyles.card}>
        <View style={[carouselStyles.accentBar, { backgroundColor: accent }]} />

        <View style={carouselStyles.cardHeader}>
          <AssetImage assetKey={law.assetKey} width={60} height={60} />
          <View style={carouselStyles.cardHeaderRight}>
            <View style={carouselStyles.badges}>
              <StampBadge
                label={locked ? 'Pro' : law.category}
                tone={locked ? 'purple' : law.isEnabled ? 'success' : 'blue'}
              />
              <StampBadge
                label={law.isEnabled ? 'Active' : 'Off'}
                tone={law.isEnabled ? 'success' : 'orange'}
              />
            </View>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: law.isEnabled }}
              accessibilityLabel={`${law.isEnabled ? 'Disable' : 'Enable'} ${law.name}`}
              onPress={onToggle}
              style={[carouselStyles.togglePill, law.isEnabled && { backgroundColor: accent }]}
            >
              <View style={[carouselStyles.toggleDot, law.isEnabled && carouselStyles.toggleDotOn]} />
              <Text style={[carouselStyles.toggleText, law.isEnabled && carouselStyles.toggleTextOn]}>
                {law.isEnabled ? 'ON' : 'OFF'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[carouselStyles.divider, { backgroundColor: accent + '40' }]} />

        <Text style={carouselStyles.lawName}>{law.name}</Text>
        <Text style={carouselStyles.lawDesc} numberOfLines={2}>{law.description}</Text>

        <View style={[carouselStyles.quoteBox, { borderLeftColor: accent }]}>
          <Text style={carouselStyles.quoteText} numberOfLines={2}>"{law.judgeLine}"</Text>
        </View>

        <View style={carouselStyles.footer}>
          <Text style={carouselStyles.footerLabel}>FOCUS OWED</Text>
          <Text style={[carouselStyles.footerValue, { color: accent }]}>
            {law.firstPunishmentMinutes}–{law.maxSentenceMinutes ?? 45} min
          </Text>
          <View style={carouselStyles.footerSpacer} />
          <Text style={carouselStyles.footerLabel}>LIMIT</Text>
          <Text style={[carouselStyles.footerValue, { color: accent }]}>
            {law.dailyLimitMinutes ? `${law.dailyLimitMinutes} min` : getScheduleText(law)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const carouselStyles = StyleSheet.create({
  cardWrap: { width: CAROUSEL_CARD_WIDTH },
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
    overflow: 'hidden',
    padding: 18,
    gap: 12,
    ...shadows.card,
  },
  accentBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, opacity: 0.85 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingTop: 6 },
  cardHeaderRight: { flex: 1, gap: 10 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.labelTertiary },
  toggleDotOn: { backgroundColor: colors.white },
  toggleText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, color: colors.labelSecondary },
  toggleTextOn: { color: colors.white },
  divider: { height: 1, borderRadius: 1 },
  lawName: { color: colors.label, fontSize: 20, fontWeight: '700', letterSpacing: -0.4, lineHeight: 25 },
  lawDesc: { color: colors.labelSecondary, fontSize: 14, lineHeight: 20 },
  quoteBox: { borderLeftWidth: 3, paddingLeft: 10, paddingVertical: 2 },
  quoteText: { color: colors.labelSecondary, fontSize: 13, fontStyle: 'italic', lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 2 },
  footerSpacer: { flex: 1 },
  footerLabel: { color: colors.labelTertiary, fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  footerValue: { fontSize: 12, fontWeight: '700', letterSpacing: -0.1 },
});

// ─── Law Detail Sheet ─────────────────────────────────────────────────────────
function LawDetailSheet({
  law,
  isPro,
  visible,
  onClose,
  onToggle,
  onSave,
}: {
  law: FocusLaw | null;
  isPro: boolean;
  visible: boolean;
  onClose: () => void;
  onToggle: () => void;
  onSave: (id: string, updates: Partial<FocusLaw>) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dailyLimit, setDailyLimit] = useState(30);
  const [syncedId, setSyncedId] = useState<string | null>(null);

  if (law && law.id !== syncedId) {
    setSyncedId(law.id);
    setName(law.name);
    setDescription(law.description);
    setDailyLimit(law.dailyLimitMinutes ?? 30);
  }

  if (!law) return null;
  const enforcementColor = getEnforcementColor(law.enforcementMode);
  const canEdit = isPro || !law.isPremium;

  const handleSave = () => {
    onSave(law.id, {
      name: name.trim() || law.name,
      description: description.trim() || law.description,
      dailyLimitMinutes: dailyLimit,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={sheetStyles.root}>
        <View style={sheetStyles.inner}>
          <View style={sheetStyles.handle} />

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

          <View style={sheetStyles.badgeRow}>
            <View style={[sheetStyles.badge, { backgroundColor: `${enforcementColor}18`, borderColor: `${enforcementColor}36` }]}>
              <Text style={[sheetStyles.badgeText, { color: enforcementColor }]}>
                {getEnforcementLabel(law.enforcementMode)}
              </Text>
            </View>
            <View style={sheetStyles.badge}>
              <Text style={sheetStyles.badgeText}>Trigger: {law.trigger ?? 'appLaunch'}</Text>
            </View>
            {getScheduleText(law) ? (
              <View style={sheetStyles.badge}>
                <Text style={sheetStyles.badgeText}>Schedule: {getScheduleText(law)}</Text>
              </View>
            ) : null}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={sheetStyles.scroll}>
            <View style={sheetStyles.section}>
              <Text style={sheetStyles.sectionLabel}>LAW NAME</Text>
              <TextInput
                style={[sheetStyles.input, !canEdit && sheetStyles.inputDisabled]}
                value={name}
                onChangeText={setName}
                editable={canEdit}
                placeholder={law.name}
                placeholderTextColor={colors.labelTertiary}
              />
            </View>

            <View style={sheetStyles.section}>
              <Text style={sheetStyles.sectionLabel}>DESCRIPTION</Text>
              <TextInput
                style={[sheetStyles.input, sheetStyles.textArea, !canEdit && sheetStyles.inputDisabled]}
                value={description}
                onChangeText={setDescription}
                editable={canEdit}
                multiline
                placeholder={law.description}
                placeholderTextColor={colors.labelTertiary}
                textAlignVertical="top"
              />
            </View>

            <View style={sheetStyles.section}>
              <Text style={sheetStyles.sectionLabel}>DAILY LIMIT</Text>
              <Text style={sheetStyles.sectionSub}>
                The strictest active limit is the one iOS enforces on your selection.
              </Text>
              <View style={sheetStyles.stepper}>
                <Text style={sheetStyles.stepperValue}>{dailyLimit} min</Text>
                <View style={sheetStyles.stepperBtns}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Decrease daily limit by 5 minutes"
                    style={[sheetStyles.stepBtn, !canEdit && sheetStyles.stepBtnDisabled]}
                    onPress={() => canEdit && setDailyLimit((v) => Math.max(5, v - 5))}
                  >
                    <Text style={sheetStyles.stepBtnText}>Less</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Increase daily limit by 5 minutes"
                    style={[sheetStyles.stepBtn, !canEdit && sheetStyles.stepBtnDisabled]}
                    onPress={() => canEdit && setDailyLimit((v) => Math.min(360, v + 5))}
                  >
                    <Text style={sheetStyles.stepBtnText}>More</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={sheetStyles.section}>
              <Text style={sheetStyles.sectionLabel}>WHAT THIS LAW GOVERNS</Text>
              <Text style={sheetStyles.sectionSub}>
                Every app in your court-ordered selection. iOS reports that the limit broke without
                naming which app did it, so laws apply to the whole selection.
              </Text>
            </View>

            <View style={sheetStyles.infoGrid}>
              <View style={sheetStyles.infoCell}>
                <Text style={sheetStyles.infoCellLabel}>FOCUS OWED</Text>
                <Text style={sheetStyles.infoCellValue}>
                  {law.firstPunishmentMinutes}–{law.maxSentenceMinutes} min
                </Text>
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
                <Text style={sheetStyles.proGateText}>
                  Editing requires Supreme Court Mode (Pro)
                </Text>
              </View>
            )}

            <View style={sheetStyles.actions}>
              {canEdit ? (
                <CourtButton title="Save Changes" variant="primary" onPress={handleSave} />
              ) : (
                <CourtButton title="Upgrade to Edit" variant="purple" onPress={onClose} />
              )}
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
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerText: { flex: 1, gap: 2 },
  headerEyebrow: { color: colors.blue, fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  headerTitle: { color: colors.label, fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, paddingBottom: 14 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: { color: colors.labelSecondary, fontSize: 11, fontWeight: '600' },
  scroll: { paddingHorizontal: 20, paddingBottom: 48, gap: 20 },
  section: { gap: 8 },
  sectionLabel: { color: colors.labelTertiary, fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  sectionSub: { color: colors.labelSecondary, fontSize: 13, lineHeight: 19, fontWeight: '400', marginTop: -4 },
  input: {
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    color: colors.label,
    fontSize: 15,
    fontWeight: '500',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  inputDisabled: { opacity: 0.5, backgroundColor: colors.surfaceMuted },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  stepperValue: { color: colors.label, fontSize: 17, fontWeight: '700' },
  stepperBtns: { flexDirection: 'row', gap: 8 },
  stepBtn: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.blueLight,
    borderWidth: 1,
    borderColor: '#D5E0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: { opacity: 0.4 },
  stepBtnText: { color: colors.blue, fontSize: 13, fontWeight: '700' },
  infoGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  infoCell: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 },
  infoCellDivider: { width: 1, height: 36, backgroundColor: colors.border },
  infoCellLabel: { color: colors.labelTertiary, fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  infoCellValue: { color: colors.label, fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  proGate: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.purpleLight,
    borderWidth: 1,
    borderColor: '#DED6F1',
  },
  proGateText: { color: colors.indigo, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  actions: { gap: 10, paddingTop: 4 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function CulpritsTab() {
  const router = useRouter();
  const laws = useCourtStore((state) => state.laws);
  const updateLaw = useCourtStore((state) => state.updateLaw);
  const toggleLaw = useCourtStore((state) => state.toggleLaw);
  const enforcementEnabled = useCourtStore((state) => state.enforcementEnabled);
  const setEnforcementEnabled = useCourtStore((state) => state.setEnforcementEnabled);
  const lockedCount = useCourtStore((state) => jailedCases(state.cases).length);
  const isPro = usePremiumStore((state) => state.isPro);

  const [selectedLaw, setSelectedLaw] = useState<FocusLaw | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const flatRef = useRef<FlatList<FocusLaw>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const enabledLawsCount = laws.filter((l) => l.isEnabled).length;
  const carouselLaws = [
    ...laws.filter((l) => l.isEnabled),
    ...laws.filter((l) => !l.isEnabled),
  ].slice(0, MAX_CAROUSEL_LAWS);

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
      return;
    }
    // Laws drive the native daily-limit schedule.
    syncPolicyToNative().catch(() => undefined);
  };

  const handleSaveLaw = (id: string, updates: Partial<FocusLaw>) => {
    const result = updateLaw(id, updates, isPro);
    if (!result.allowed) {
      router.push('/modals/paywall');
      return;
    }
    syncPolicyToNative().catch(() => undefined);
  };

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScreenHeader
          eyebrow="COURT AUTHORITY"
          title="Culprits"
          subtitle="Choose the apps the court watches and the laws it enforces."
          assetKey="ASSET_SELECT_SUSPECTS_LINEUP"
        />

        {/* ── Master enforcement switch ─────────────────────────────── */}
        <CourtCard variant={enforcementEnabled ? 'glass' : 'orange'}>
          <View style={styles.enforceRow}>
            <View style={styles.enforceText}>
              <Text style={styles.enforceTitle}>Court enforcement</Text>
              <Text style={styles.enforceCopy}>
                {enforcementEnabled
                  ? lockedCount > 0
                    ? 'On. Your apps are locked until focus time is served.'
                    : 'On. The court files a case when a law breaks.'
                  : 'Off. Nothing locks and no case gets filed.'}
              </Text>
            </View>
            <Switch
              value={enforcementEnabled}
              onValueChange={setEnforcementEnabled}
              thumbColor={colors.white}
              trackColor={{ true: colors.blue, false: 'rgba(120,120,128,0.22)' }}
              ios_backgroundColor="rgba(120,120,128,0.22)"
            />
          </View>
        </CourtCard>

        {/* ── Real device apps, chosen through the system picker ────── */}
        <ProtectedAppsCard />

        {/* ── Focus Laws ────────────────────────────────────────────── */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionTitle}>Focus Laws</Text>
            <Text style={styles.sectionCopy}>{enabledLawsCount} active · Tap to edit</Text>
          </View>
          <View style={styles.sectionHeaderRight}>
            <Text style={styles.carouselCounter}>
              {activeIndex + 1} / {carouselLaws.length}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="See all focus laws"
              onPress={() => router.push('/(tabs)/laws')}
              style={styles.seeAllBtn}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>
        </View>

        <FlatList
          ref={flatRef}
          data={carouselLaws}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={CAROUSEL_CARD_WIDTH}
          decelerationRate="fast"
          onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / CAROUSEL_CARD_WIDTH);
            setActiveIndex(Math.max(0, Math.min(idx, carouselLaws.length - 1)));
          }}
          renderItem={({ item }) => (
            <CarouselLawCard
              law={item}
              locked={!!item.isPremium && !isPro}
              onToggle={() => handleLawToggle(item.id, item.isPremium)}
              onPress={() => {
                setSelectedLaw(item);
                setSheetVisible(true);
              }}
            />
          )}
        />

        <View style={styles.dots}>
          {carouselLaws.map((law, i) => (
            <Pressable
              key={law.id}
              accessibilityRole="button"
              accessibilityLabel={`Go to law ${i + 1}`}
              hitSlop={10}
              onPress={() => {
                flatRef.current?.scrollToIndex({ index: i, animated: true });
                setActiveIndex(i);
              }}
            >
              <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <LawDetailSheet
        law={selectedLaw}
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
  content: { gap: 14, paddingBottom: 110 },

  enforceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  enforceText: { flex: 1, gap: 4 },
  enforceTitle: { color: colors.label, fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  enforceCopy: { color: colors.labelSecondary, fontSize: 13, lineHeight: 18, fontWeight: '400' },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  sectionHeaderLeft: { gap: 2 },
  sectionHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: colors.label, fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  sectionCopy: { color: colors.labelSecondary, fontSize: 12, fontWeight: '500' },
  carouselCounter: { color: colors.labelTertiary, fontSize: 11, fontWeight: '600' },
  seeAllBtn: {
    minHeight: 32,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.blueLight,
    borderWidth: 1,
    borderColor: '#D5E0F8',
  },
  seeAllText: { color: colors.blue, fontSize: 12, fontWeight: '600' },

  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.borderStrong },
  dotActive: { width: 20, height: 6, borderRadius: 3, backgroundColor: colors.blue },
});
