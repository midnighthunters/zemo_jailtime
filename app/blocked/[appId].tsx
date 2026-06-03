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
  const suspect = useCourtStore((state) => state.suspects.find((item) => item.id === params.appId));

  return (
    <CourtBackground>
      <View style={styles.content}>
        <CourtCard variant="dark">
          <View style={styles.center}>
            <AssetImage assetKey="ASSET_STRICT_MODE_LOCK" width={150} height={150} />
            <StampBadge label="App Shielded" tone="danger" />
            <Text style={styles.title}>{suspect?.displayName ?? 'Distracting App'} is in custody.</Text>
            <Text style={styles.copy}>Step away from the app icon. The jail timer is watching.</Text>
            <SentenceTimer seconds={activeCase.remainingSentenceSeconds || 600} />
            <CourtButton title="Return to Jail" variant="danger" onPress={() => router.replace('/(tabs)/jail')} />
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
  },
  center: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: colors.cream,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  copy: {
    color: colors.parchment,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '800',
    textAlign: 'center',
  },
});
