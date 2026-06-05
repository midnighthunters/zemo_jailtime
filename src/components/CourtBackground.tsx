import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/src/constants/theme';

type CourtBackgroundProps = {
  children: ReactNode;
  padded?: boolean;
};

export function CourtBackground({ children, padded = true }: CourtBackgroundProps) {
  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [glow]);

  const spotlightStyle = useAnimatedStyle(() => ({
    opacity: 0.78 + glow.value * 0.22,
    transform: [{ translateY: glow.value * 12 }, { scale: 1 + glow.value * 0.05 }],
  }));

  const sideGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + glow.value * 0.2,
    transform: [{ translateX: glow.value * -18 }, { translateY: glow.value * 10 }, { scale: 1 + glow.value * 0.07 }],
  }));

  const railStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: glow.value * 4 }],
  }));

  return (
    <LinearGradient colors={[colors.background, colors.background2, colors.woodDark]} style={styles.root}>
      <Animated.View style={[styles.spotlight, spotlightStyle]} />
      <Animated.View style={[styles.sideGlow, sideGlowStyle]} />
      <Animated.View style={[styles.floorRail, railStyle]} />
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, padded && styles.padded]}>
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
    paddingHorizontal: 18,
  },
  spotlight: {
    position: 'absolute',
    top: -90,
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 200, 61, 0.16)',
  },
  sideGlow: {
    position: 'absolute',
    top: 130,
    right: -120,
    width: 240,
    height: 300,
    borderRadius: 140,
    backgroundColor: 'rgba(215, 53, 42, 0.12)',
  },
  floorRail: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 118,
    borderTopWidth: 3,
    borderColor: 'rgba(255, 200, 61, 0.16)',
    backgroundColor: 'rgba(58, 29, 17, 0.82)',
  },
});
