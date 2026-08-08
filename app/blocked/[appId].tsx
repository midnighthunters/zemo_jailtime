import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';
import { caseFocusRemainingSeconds, jailedCaseForApp } from '@/src/utils/docket';
import { formatMinutes } from '@/src/utils/format';

/**
 * Native-block fallback. Shows the case holding this app and routes straight to
 * the focus timer that can release it.
 */
export default function BlockedAppScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ appId: string }>();
  const suspect = useCourtStore((state) =>
    state.suspects.find((item) => item.id === params.appId),
  );
  const courtCase = useCourtStore((state) => jailedCaseForApp(state.cases, params.appId));

  const appName = suspect?.displayName ?? courtCase?.appName ?? 'This app';
  const owedMinutes = courtCase
    ? Math.max(1, Math.ceil(caseFocusRemainingSeconds(courtCase) / 60))
    : 0;

  return (
    <CourtBackground>
      <View style={styles.content}>
        <CourtCard variant={courtCase ? 'red' : 'green'}>
          <View style={styles.center}>
            <AssetImage assetKey="ASSET_STRICT_MODE_LOCK" width={130} height={130} />
            <StampBadge
              label={courtCase ? 'In custody' : 'Released'}
              tone={courtCase ? 'danger' : 'success'}
            />
            <Text style={styles.title}>
              {courtCase ? `${appName} is in custody.` : `${appName} is open.`}
            </Text>
            <Text style={styles.copy}>
              {courtCase
                ? `${courtCase.lawName} was broken. Serve ${formatMinutes(owedMinutes)} of focus and the court releases it.`
                : 'No case is holding this app. You are free to carry on.'}
            </Text>

            {courtCase ? (
              <CourtButton
                title={`Start ${formatMinutes(owedMinutes)} Focus Timer`}
                variant="primary"
                onPress={() =>
                  router.push({
                    pathname: '/modals/focus-timer',
                    params: { caseId: courtCase.id },
                  })
                }
              />
            ) : null}
            <CourtButton
              title="Back to Court"
              variant="ghost"
              onPress={() => router.replace('/(tabs)/courtroom')}
            />
          </View>
        </CourtCard>
      </View>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 4,
  },
  center: {
    alignItems: 'center',
    gap: 14,
    paddingVertical: 8,
  },
  title: {
    color: colors.label,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  copy: {
    color: colors.labelSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
    textAlign: 'center',
  },
});
