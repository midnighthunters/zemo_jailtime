import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';

export default function ParoleGrantedModal() {
  const router = useRouter();
  const latest = useCourtStore((state) => state.paroleRecords[0]);

  return (
    <CourtBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <CourtCard variant="dark">
          <View style={styles.center}>
            <AssetImage assetKey="ASSET_COURT_CELEBRATION_CONFETTI" width={160} height={110} />
            <AssetImage assetKey="ASSET_PAROLE_GRANTED_BADGE" width={150} height={150} />
            <StampBadge label="Parole Granted" tone="success" />
            <Text style={styles.title}>Freedom Earned</Text>
            <Text style={styles.copy}>{latest?.message ?? 'Parole granted. Do not waste this freedom.'}</Text>
            <Text style={styles.points}>+{latest?.pointsEarned ?? 20} parole points</Text>
            <AssetImage assetKey="ASSET_DEFENDANT_FREEDOM_WALK" width={126} height={126} />
          </View>
        </CourtCard>
        <CourtButton title="Return to Courtroom" variant="success" onPress={() => router.replace('/(tabs)/courtroom')} />
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 28,
  },
  center: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: colors.cream,
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  copy: {
    color: colors.parchment,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  points: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '900',
  },
});
