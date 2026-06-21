import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <CourtCard variant="green">
          <View style={styles.center}>
            <Animated.View entering={ZoomIn.duration(400).delay(80).springify().damping(14)}>
              <AssetImage assetKey="ASSET_COURT_CELEBRATION_CONFETTI" width={160} height={110} />
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(360).delay(160).springify().damping(16)}>
              <AssetImage assetKey="ASSET_PAROLE_GRANTED_BADGE" width={144} height={144} />
            </Animated.View>
            <Animated.View entering={FadeInUp.duration(300).delay(240).springify().damping(18)}>
              <StampBadge label="Parole Granted" tone="success" />
            </Animated.View>
            <Animated.Text
              entering={FadeInUp.duration(300).delay(300).springify().damping(18)}
              style={styles.title}
            >
              Freedom Earned
            </Animated.Text>
            <Text style={styles.copy}>
              {latest?.message ?? 'Parole granted. Do not waste this freedom.'}
            </Text>
            <Text style={styles.points}>+{latest?.pointsEarned ?? 20} parole points</Text>
            <Animated.View entering={FadeInUp.duration(340).delay(360).springify().damping(16)}>
              <AssetImage assetKey="ASSET_DEFENDANT_FREEDOM_WALK" width={120} height={120} />
            </Animated.View>
          </View>
        </CourtCard>

        <CourtButton
          title="Return to Courtroom"
          variant="green"
          onPress={() => router.replace('/(tabs)/courtroom')}
        />
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 32,
  },
  center: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  title: {
    color: colors.label,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.35,
  },
  copy: {
    color: colors.labelSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  points: {
    color: colors.greenDark,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
