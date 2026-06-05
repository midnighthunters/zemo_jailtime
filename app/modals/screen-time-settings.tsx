import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { PermissionChecklist } from '@/src/components/PermissionChecklist';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';
import type { ShieldIntensity } from '@/src/types/court';

const shieldModes: ShieldIntensity[] = ['gentle', 'standard', 'lockdown'];

function SettingSwitch({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} thumbColor={value ? colors.gold : colors.muted} trackColor={{ true: colors.deepGold, false: colors.woodDark }} />
    </View>
  );
}

function Stepper({ label, value, step, min, max, suffix, onChange }: { label: string; value: number; step: number; min: number; max: number; suffix: string; onChange: (value: number) => void }) {
  return (
    <View style={styles.stepperRow}>
      <View style={styles.stepperCopy}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.stepperValue}>{value} {suffix}</Text>
      </View>
      <View style={styles.stepperButtons}>
        <Pressable style={styles.stepperButton} onPress={() => onChange(Math.max(min, value - step))}>
          <Text style={styles.stepperButtonText}>-</Text>
        </Pressable>
        <Pressable style={styles.stepperButton} onPress={() => onChange(Math.min(max, value + step))}>
          <Text style={styles.stepperButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ScreenTimeSettingsModal() {
  const router = useRouter();
  const settings = useCourtStore((state) => state.profile.screenTimeSettings);
  const updateScreenTimeSettings = useCourtStore((state) => state.updateScreenTimeSettings);
  const permissionStatuses = useCourtStore((state) => state.profile.permissionStatuses);
  const grantedCount = Object.values(permissionStatuses).filter((status) => status === 'granted').length;

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <CourtCard variant="dark">
          <View style={styles.hero}>
            <View style={styles.heroText}>
              <StampBadge label={`${grantedCount} permissions ready`} tone={grantedCount >= 3 ? 'success' : 'gold'} />
              <Text style={styles.title}>Screen Time Setup</Text>
              <Text style={styles.copy}>Configure the authority the app needs before real device blocking is connected.</Text>
            </View>
            <AssetImage assetKey="ASSET_COURT_AUTHORITY_PERMISSION" width={118} height={118} />
          </View>
        </CourtCard>

        <CourtCard variant="purple" delay={80}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Permissions</Text>
            <PermissionChecklist />
          </View>
        </CourtCard>

        <CourtCard variant="wood" delay={120}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monitoring</Text>
            <SettingSwitch label="Monitor suspect apps" value={settings.monitoringEnabled} onValueChange={(monitoringEnabled) => updateScreenTimeSettings({ monitoringEnabled })} />
            <SettingSwitch label="Block while sentence is active" value={settings.blockDuringActiveSentence} onValueChange={(blockDuringActiveSentence) => updateScreenTimeSettings({ blockDuringActiveSentence })} />
            <SettingSwitch label="Background refresh checks" value={settings.backgroundRefreshEnabled} onValueChange={(backgroundRefreshEnabled) => updateScreenTimeSettings({ backgroundRefreshEnabled })} />
            <SettingSwitch label="Focus session required for parole" value={settings.requireFocusSessionForParole} onValueChange={(requireFocusSessionForParole) => updateScreenTimeSettings({ requireFocusSessionForParole })} />
          </View>
        </CourtCard>

        <CourtCard variant="dark" delay={160}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shield Intensity</Text>
            <View style={styles.segmented}>
              {shieldModes.map((mode) => {
                const active = settings.shieldIntensity === mode;
                return (
                  <Pressable key={mode} onPress={() => updateScreenTimeSettings({ shieldIntensity: mode })} style={[styles.segment, active && styles.segmentActive]}>
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{mode.toUpperCase()}</Text>
                  </Pressable>
                );
              })}
            </View>
            <SettingSwitch label="Allow emergency bypass" value={settings.allowEmergencyBypass} onValueChange={(allowEmergencyBypass) => updateScreenTimeSettings({ allowEmergencyBypass })} />
            <Stepper label="Emergency bypass" value={settings.emergencyBypassMinutes} step={1} min={1} max={15} suffix="min" onChange={(emergencyBypassMinutes) => updateScreenTimeSettings({ emergencyBypassMinutes })} />
            <Stepper label="Warning before limit" value={settings.notifyBeforeLimitMinutes} step={1} min={0} max={30} suffix="min" onChange={(notifyBeforeLimitMinutes) => updateScreenTimeSettings({ notifyBeforeLimitMinutes })} />
            <Stepper label="Reopen cooldown" value={settings.reopenCooldownMinutes} step={5} min={0} max={60} suffix="min" onChange={(reopenCooldownMinutes) => updateScreenTimeSettings({ reopenCooldownMinutes })} />
            <Stepper label="Weekend relaxation" value={settings.weekendRelaxationMinutes} step={10} min={0} max={120} suffix="min" onChange={(weekendRelaxationMinutes) => updateScreenTimeSettings({ weekendRelaxationMinutes })} />
          </View>
        </CourtCard>

        <CourtButton title="Close" variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 28,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroText: {
    flex: 1,
    gap: 8,
  },
  title: {
    color: colors.cream,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
  },
  copy: {
    color: colors.parchment,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.cream,
    fontSize: 19,
    fontWeight: '900',
  },
  settingRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
  },
  settingLabel: {
    flex: 1,
    color: colors.cream,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  segmented: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 242, 210, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 242, 210, 0.16)',
  },
  segmentActive: {
    backgroundColor: colors.gold,
    borderColor: colors.deepGold,
  },
  segmentText: {
    color: colors.parchment,
    fontSize: 11,
    fontWeight: '900',
  },
  segmentTextActive: {
    color: colors.ink,
  },
  stepperRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
  },
  stepperCopy: {
    flex: 1,
    gap: 3,
  },
  stepperValue: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  stepperButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  stepperButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
  },
  stepperButtonText: {
    color: colors.ink,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '900',
  },
});
