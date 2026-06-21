import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { SentenceTimer } from '@/src/components/SentenceTimer';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';

export default function BlockedAppScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ appId: string }>();
  const activeCase = useCourtStore((state) => state.activeCase);
  const suspect = useCourtStore((state) =>
    state.suspects.find((item) => item.id === params.appId),
  );

  return (
    <CourtBackground>
      <View style={styles.content}>
        <CourtCard variant="red" style={styles.card}>
          <View style={styles.center}>
            <AssetImage assetKey="ASSET_STRICT_MODE_LOCK" width={130} height={130} />
            <StampBadge label="App Shielded" tone="danger" />
            <Text style={styles.title}>
              {suspect?.displayName ?? 'Distracting App'} is in custody.
            </Text>
            <Text style={styles.copy}>
              Step away from the app icon. The jail timer is watching.
            </Text>
            <SentenceTimer seconds={activeCase.remainingSentenceSeconds || 600} />
            <CourtButton
              title="🫧  Breathe to Unblock"
              variant="primary"
              onPress={() => router.push({ pathname: '/modals/unblock', params: { appId: params.appId } })}
            />
            <CourtButton
              title="Return to Jail"
              variant="ghost"
              onPress={() => router.replace('/(tabs)/jail')}
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
  card: {},
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
    letterSpacing: 0.35,
  },
  copy: {
    color: colors.labelSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
    textAlign: 'center',
  },
});
