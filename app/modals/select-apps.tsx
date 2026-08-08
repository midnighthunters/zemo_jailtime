/**
 * select-apps.tsx  (modal)
 *
 * The gateway screen for real iOS blocking.
 *
 * Flow:
 *  1. User taps "Select Apps" button (shown on Culprits tab or screen-time-settings)
 *  2. We check FamilyControls authorization
 *  3. If not authorized → request it (system sheet)
 *  4. Present FamilyActivityPicker (system sheet)
 *  5. On Done → call applyPolicy() with the current daily limit
 *  6. Confirm to user, close modal
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';
import { IosScreenTimeService } from '@/src/services/screenTime/IosScreenTimeService';
import { syncPolicyToNative } from '@/src/services/screenTime/BlockingBridge';
import { useCourtStore } from '@/src/store/useCourtStore';

type Step = 'idle' | 'authorizing' | 'picking' | 'applying' | 'done' | 'error';

export default function SelectAppsModal() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('idle');
  const [appsCount, setAppsCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const laws = useCourtStore((state) => state.laws);

  // First enabled law with a daily limit, or 30 min default
  const dailyLimitMinutes =
    laws.find((l) => l.isEnabled && l.dailyLimitMinutes != null)?.dailyLimitMinutes ?? 30;

  const run = async () => {
    if (Platform.OS !== 'ios') {
      setErrorMsg('iOS only feature.');
      setStep('error');
      return;
    }

    try {
      // Step 1: Authorize
      setStep('authorizing');
      const auth = await IosScreenTimeService.requestPermissions();
      if (!auth.granted) {
        setErrorMsg(auth.reason ?? 'Screen Time authorization was denied. Enable it in Settings > Screen Time.');
        setStep('error');
        return;
      }

      // Step 2: Pick apps
      setStep('picking');
      const pick = await IosScreenTimeService.presentAppPicker();
      if (!pick.selected || pick.count === 0) {
        setStep('idle'); // user cancelled
        return;
      }
      setAppsCount(pick.count);

      // Step 3: Apply schedule
      setStep('applying');
      await syncPolicyToNative();

      setStep('done');
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Unknown error');
      setStep('error');
    }
  };

  const isLoading = step === 'authorizing' || step === 'picking' || step === 'applying';

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <CourtCard variant="dark">
          <View style={styles.hero}>
            <AssetImage assetKey="ASSET_SELECT_SUSPECTS_LINEUP" width={128} height={128} />
            <View style={styles.heroText}>
              <StampBadge label="iOS Screen Time" tone="gold" />
              <Text style={styles.title}>Select Apps to Block</Text>
              <Text style={styles.copy}>
                Choose which apps get locked when you hit your daily limit.
                The system picker only shows your own installed apps — nothing is shared with us.
              </Text>
            </View>
          </View>
        </CourtCard>

        {/* How it works */}
        <CourtCard variant="wood" delay={80}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.steps}>
            <StepRow n="1" text="Tap below → iOS asks permission for Screen Time" />
            <StepRow n="2" text="System picker opens — choose Instagram, TikTok, YouTube, etc." />
            <StepRow n="3" text={`After ${dailyLimitMinutes} min of daily use, the app is locked with a jail screen`} />
            <StepRow n="4" text="Serve focus time in JailTime to release the app" />
          </View>
        </CourtCard>

        {/* Status */}
        {step === 'done' && (
          <CourtCard variant="dark" delay={0}>
            <View style={styles.doneRow}>
              <AssetImage assetKey="ASSET_CLEAN_RECORD_MEDAL" width={72} height={72} />
              <View style={styles.doneText}>
                <Text style={styles.doneTitle}>Court Order Active</Text>
                <Text style={styles.doneCopy}>
                  {appsCount} app{appsCount !== 1 ? 's' : ''} under surveillance.
                  Daily limit: {dailyLimitMinutes} min. The court is watching.
                </Text>
              </View>
            </View>
          </CourtCard>
        )}

        {step === 'error' && (
          <CourtCard variant="dark" delay={0}>
            <StampBadge label="Error" tone="danger" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </CourtCard>
        )}

        {step === 'authorizing' && <StatusCard text="Requesting Screen Time authorization…" />}
        {step === 'picking'     && <StatusCard text="Opening app picker…" />}
        {step === 'applying'    && <StatusCard text="Registering daily limit schedule…" />}

        {/* Primary CTA */}
        {step !== 'done' && (
          <CourtButton
            title={step === 'idle' || step === 'error' ? 'Select Apps to Block' : 'Working…'}
            variant="gold"
            loading={isLoading}
            onPress={run}
          />
        )}

        {step === 'done' && (
          <CourtButton
            title="Change App Selection"
            variant="ghost"
            onPress={run}
          />
        )}

        <CourtButton title="Close" variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </CourtBackground>
  );
}

function StepRow({ n, text }: { n: string; text: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{n}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

function StatusCard({ text }: { text: string }) {
  return (
    <CourtCard variant="dark" delay={0}>
      <Text style={styles.statusText}>{text}</Text>
    </CourtCard>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingBottom: 28 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroText: { flex: 1, gap: 8 },
  title: { color: colors.cream, fontSize: 24, lineHeight: 28, fontWeight: '900' },
  copy: { color: colors.parchment, fontSize: 13, lineHeight: 19, fontWeight: '700' },
  sectionTitle: { color: colors.cream, fontSize: 17, fontWeight: '900', marginBottom: 10 },
  steps: { gap: 10 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center',
  },
  stepBadgeText: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  stepText: { flex: 1, color: colors.parchment, fontSize: 13, lineHeight: 19, fontWeight: '700' },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doneText: { flex: 1, gap: 6 },
  doneTitle: { color: colors.cream, fontSize: 18, fontWeight: '900' },
  doneCopy: { color: colors.parchment, fontSize: 13, lineHeight: 19, fontWeight: '700' },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 19, fontWeight: '800', marginTop: 8 },
  statusText: { color: colors.parchment, fontSize: 14, fontWeight: '800', textAlign: 'center', paddingVertical: 8 },
});
