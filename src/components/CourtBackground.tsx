import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
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

  useEffect(() => {
    drift1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    drift2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 9400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 9400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    drift3.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 5800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 5800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [drift1, drift2, drift3]);

  // Large soft orb — top left — blue
  const orb1Style = useAnimatedStyle(() => ({
    opacity: 0.55 + drift1.value * 0.2,
    transform: [
      { translateX: drift1.value * 18 },
      { translateY: drift1.value * 22 },
      { scale: 1 + drift1.value * 0.08 },
    ],
  }));

  // Orb — bottom right — indigo/purple
  const orb2Style = useAnimatedStyle(() => ({
    opacity: 0.45 + drift2.value * 0.18,
    transform: [
      { translateX: drift2.value * -24 },
      { translateY: drift2.value * -16 },
      { scale: 1 + drift2.value * 0.06 },
    ],
  }));

  // Small orb — center top — cyan/teal
  const orb3Style = useAnimatedStyle(() => ({
    opacity: 0.35 + drift3.value * 0.15,
    transform: [
      { translateX: drift3.value * 12 },
      { translateY: drift3.value * -8 },
      { scale: 1 + drift3.value * 0.1 },
    ],
  }));

  return (
    <LinearGradient
      colors={['#EEF3FF', '#F5F0FF', '#F2F6FF']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.root}
    >
      {/* Ambient orb 1 — soft blue */}
      <Animated.View style={[styles.orb1, orb1Style]} />
      {/* Ambient orb 2 — soft purple */}
      <Animated.View style={[styles.orb2, orb2Style]} />
      {/* Ambient orb 3 — soft cyan/teal accent */}
      <Animated.View style={[styles.orb3, orb3Style]} />

      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[styles.safe, padded && styles.padded]}
      >
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  safe: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 16,
  },
  // Large diffuse blue orb — top-left
  orb1: {
    position: 'absolute',
    top: -160,
    left: -120,
    width: 480,
    height: 480,
    borderRadius: 240,
    backgroundColor: 'rgba(120,160,255,0.28)',
  },
  // Large diffuse purple orb — bottom-right
  orb2: {
    position: 'absolute',
    bottom: -180,
    right: -140,
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: 'rgba(168,130,255,0.22)',
  },
  // Small teal orb — center top
  orb3: {
    position: 'absolute',
    top: 80,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(100,210,230,0.18)',
  },
});
