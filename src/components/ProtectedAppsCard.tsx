import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';
import {
  IosScreenTimeService,
  screenTimeAvailable,
} from '@/src/services/screenTime/IosScreenTimeService';
import {
  syncAppSelectionFromNative,
  syncPolicyToNative,
} from '@/src/services/screenTime/BlockingBridge';
import { useCourtStore } from '@/src/store/useCourtStore';
import { plural } from '@/src/utils/format';

/**
 * The court's app selection, straight from the device.
 *
 * Apple's picker is the only sanctioned way to choose apps, and it hands back
 * opaque tokens — so this shows counts and lets the system name the apps inside
 * the sheet. There is deliberately no editable app list here; anything we listed
 * ourselves would be invented.
 */
export function ProtectedAppsCard() {
  const appSelection = useCourtStore((state) => state.appSelection);
  const [busy, setBusy] = useState(false);

  const total = appSelection.applications + appSelection.categories + appSelection.webDomains;
  const hasSelection = total > 0;

  const parts = [
    appSelection.applications > 0 ? plural(appSelection.applications, 'app') : null,
    appSelection.categories > 0 ? plural(appSelection.categories, 'category', 'categories') : null,
    appSelection.webDomains > 0 ? plural(appSelection.webDomains, 'site') : null,
  ].filter(Boolean);

  const choose = async () => {
    if (!screenTimeAvailable()) {
      Alert.alert(
        'Needs a native build',
        'Screen Time app selection uses the FamilyControls entitlement, which is unavailable in Expo Go. Run the app with "npm run ios" on a device or simulator.',
      );
      return;
    }

    setBusy(true);
    try {
      const auth = await IosScreenTimeService.requestPermissions();
      if (!auth.granted) {
        Alert.alert(
          'Screen Time access needed',
          auth.reason ?? 'Enable Screen Time for JailTime in Settings, then try again.',
        );
        return;
      }

      const picked = await IosScreenTimeService.presentAppPicker();
      // Always read back from the system rather than trusting the picker result.
      await syncAppSelectionFromNative();
      if (picked.selected) await syncPolicyToNative();
    } catch (error) {
      Alert.alert('Could not open the picker', (error as Error)?.message ?? 'Unknown error.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <CourtCard variant={hasSelection ? 'glass' : 'blue'}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Apps Under Court Order</Text>
          <Text style={styles.copy}>
            {hasSelection
              ? `${parts.join(' · ')} under watch. iOS locks them the moment your daily limit breaks.`
              : 'Pick the real apps on this device that the court should watch. Nothing is monitored until you do.'}
          </Text>
        </View>
        {hasSelection ? <StampBadge label={`${total} selected`} tone="success" /> : null}
      </View>

      <View style={styles.action}>
        <CourtButton
          title={hasSelection ? 'Change Selection' : 'Choose Apps'}
          variant="primary"
          loading={busy}
          onPress={choose}
        />
      </View>

      <Text style={styles.note}>
        Apple keeps your choices private: JailTime only ever learns how many apps you picked, never
        which ones.
      </Text>
    </CourtCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerText: { flex: 1, gap: 6 },
  title: {
    color: colors.label,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  copy: {
    color: colors.labelSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
  },
  action: { marginTop: 14 },
  note: {
    color: colors.labelTertiary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    marginTop: 12,
  },
});
