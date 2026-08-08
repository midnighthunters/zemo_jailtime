import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';
import { caseFocusRemainingSeconds, primaryJailedCase } from '@/src/utils/docket';
import { formatMinutes } from '@/src/utils/format';

/**
 * Deep-link target for the shield screen. iOS never tells us which app the user
 * tapped, so this reports the case holding the selection and routes to the focus
 * timer that clears it. The `appId` segment is accepted for link compatibility
 * but is not treated as a real app identity.
 */
export default function BlockedAppScreen() {
  const router = useRouter();
  useLocalSearchParams<{ appId?: string }>();

  const courtCase = useCourtStore((state) => primaryJailedCase(state.cases));
  const enforcementEnabled = useCourtStore((state) => state.enforcementEnabled);
  const locked = Boolean(courtCase) && enforcementEnabled;

  const owedMinutes = courtCase
    ? Math.max(1, Math.ceil(caseFocusRemainingSeconds(courtCase) / 60))
    : 0;

  return (
    <CourtBackground>
      <View style={styles.content}>
        <CourtCard variant={locked ? 'red' : 'green'}>
          <View style={styles.center}>
            <AssetImage assetKey="ASSET_STRICT_MODE_LOCK" width={130} height={130} />
            <StampBadge
              label={locked ? 'In custody' : 'Released'}
              tone={locked ? 'danger' : 'success'}
            />
            <Text style={styles.title}>
              {locked ? 'Your apps are in custody.' : 'Your apps are open.'}
            </Text>
            <Text style={styles.copy}>
              {locked && courtCase
                ? `${courtCase.lawName} was broken. Serve ${formatMinutes(owedMinutes)} of focus and the court releases them.`
                : 'No case is holding your apps. You are free to carry on.'}
            </Text>

            {locked && courtCase ? (
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
