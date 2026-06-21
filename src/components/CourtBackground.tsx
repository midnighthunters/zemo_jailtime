import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type CourtBackgroundProps = {
  children: ReactNode;
  padded?: boolean;
};

export function CourtBackground({ children, padded = true }: CourtBackgroundProps) {
  const drift1 = useSharedValue(0);
  const drift2 = useSharedValue(0);
  const drift3 = useSharedValue(0);
  const drift4 = useSharedValue(0);

  useEffect(() => {
    drift1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 8200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 8200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    drift2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 11400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 11400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    drift3.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 6800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 6800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    drift4.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [drift1, drift2, drift3, drift4]);

  // Layer 0 — large diffuse blue orb, top-left
  const orb1Style = useAnimatedStyle(() => ({
    opacity: 0.52 + drift1.value * 0.18,
    transform: [
      { translateX: drift1.value * 22 },
      { translateY: drift1.value * 28 },
      { scale: 1 + drift1.value * 0.1 },
    ],
  }));

  // Layer 0 — large diffuse indigo/purple orb, bottom-right
  const orb2Style = useAnimatedStyle(() => ({
    opacity: 0.4 + drift2.value * 0.16,
    transform: [
      { translateX: drift2.value * -28 },
      { translateY: drift2.value * -20 },
      { scale: 1 + drift2.value * 0.07 },
    ],
  }));

  // Layer 0 — small teal/cyan accent orb, center-top
  const orb3Style = useAnimatedStyle(() => ({
    opacity: 0.3 + drift3.value * 0.18,
    transform: [
      { translateX: drift3.value * 16 },
      { translateY: drift3.value * -10 },
      { scale: 1 + drift3.value * 0.12 },
    ],
  }));

  // Layer 0 — subtle pink/rose orb, mid-left for specular richness
  const orb4Style = useAnimatedStyle(() => ({
    opacity: 0.18 + drift4.value * 0.1,
    transform: [
      { translateX: drift4.value * 14 },
      { translateY: drift4.value * 18 },
      { scale: 1 + drift4.value * 0.06 },
    ],
  }));

  return (
    <View style={styles.root}>
      {/* Base gradient — Layer 0 */}
      <LinearGradient
        colors={['#EAF0FF', '#F0EAFF', '#EAF5FF']}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient light orbs — Layer 0 */}
      <Animated.View style={[styles.orb1, orb1Style]} />
      <Animated.View style={[styles.orb2, orb2Style]} />
      <Animated.View style={[styles.orb3, orb3Style]} />
      <Animated.View style={[styles.orb4, orb4Style]} />

      {/* Subtle overall blur to unify ambient light — creates "fogged glass" depth */}
      <BlurView
        tint="systemUltraThinMaterial"
        intensity={8}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Content layer — Layer 1 */}
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[styles.safe, padded && styles.padded]}
      >
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#EAF0FF',
  },
  safe: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 16,
  },

  // ── Ambient orbs ────────────────────────────────────────────────────────
  // Layer 0: Background depth orbs — large, diffuse, low-saturation

  // Blue orb — top-left, primary ambient light source
  orb1: {
    position: 'absolute',
    top: -200,
    left: -150,
    width: 560,
    height: 560,
    borderRadius: 280,
    backgroundColor: 'rgba(100,150,255,0.32)',
  },

  // Indigo/purple orb — bottom-right
  orb2: {
    position: 'absolute',
    bottom: -220,
    right: -160,
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(150,100,255,0.24)',
  },

  // Teal/cyan orb — upper-right accent
  orb3: {
    position: 'absolute',
    top: 60,
    right: -80,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(60,200,230,0.2)',
  },

  // Rose orb — mid-left, subtle warmth for specular variety
  orb4: {
    position: 'absolute',
    top: '35%',
    left: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,100,150,0.12)',
  },
});
