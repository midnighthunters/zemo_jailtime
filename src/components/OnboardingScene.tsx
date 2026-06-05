import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { OnboardingArt } from '@/src/constants/assets';
import { ONBOARDING_STEPS, type OnboardingStep } from '@/src/data/onboarding';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtButton } from '@/src/components/CourtButton';
import { colors, radius, shadows } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';

type OnboardingSceneProps = {
  step: OnboardingStep;
  children?: ReactNode;
};

export function OnboardingScene({ step, children }: OnboardingSceneProps) {
  const router = useRouter();
  const completeOnboarding = useCourtStore((state) => state.completeOnboarding);
  const index = ONBOARDING_STEPS.findIndex((item) => item.id === step.id);
  const next = ONBOARDING_STEPS[index + 1];
  const art = OnboardingArt[step.artKey];
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(withSequence(withTiming(1, { duration: 5200 }), withTiming(0, { duration: 5200 })), -1, false);
  }, [drift]);

  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1.02 + drift.value * 0.035 }, { translateY: drift.value * -12 }],
  }));

  const goNext = () => {
    if (next) router.push(next.route);
    else {
      completeOnboarding();
      router.replace('/(tabs)/courtroom');
    }
  };

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.backgroundArt, backgroundStyle]}>
        <ImageBackground source={art} resizeMode="cover" style={styles.backgroundArt} imageStyle={styles.image} />
      </Animated.View>
      <LinearGradient colors={['rgba(24, 11, 8, 0.1)', 'rgba(24, 11, 8, 0.48)', colors.background]} style={styles.tint}>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInUp.duration(360).springify().damping(18)} style={styles.top}>
            <Text style={styles.step}>COURT BRIEFING {index + 1}/{ONBOARDING_STEPS.length}</Text>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.subtitle}>{step.subtitle}</Text>
          </Animated.View>
          <View style={styles.assets}>
            {step.assetKeys.map((assetKey, assetIndex) => (
              <Animated.View key={assetKey} entering={FadeInUp.duration(300).delay(120 + assetIndex * 60).springify().damping(16)}>
                <AssetImage assetKey={assetKey} width={88} height={88} />
              </Animated.View>
            ))}
          </View>
          {children ? (
            <Animated.View entering={FadeInUp.duration(320).delay(180).springify().damping(18)} style={styles.panel}>
              {children}
            </Animated.View>
          ) : null}
          <CourtButton title={step.cta} onPress={goNext} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  backgroundArt: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    opacity: 0.72,
  },
  tint: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: 18,
    padding: 18,
    paddingTop: 60,
    paddingBottom: 32,
  },
  top: {
    gap: 8,
  },
  step: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    color: colors.cream,
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '900',
    textShadowColor: colors.black,
    textShadowRadius: 14,
  },
  subtitle: {
    color: colors.parchment,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '800',
  },
  assets: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  panel: {
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(58, 29, 17, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 242, 210, 0.18)',
    ...shadows.soft,
  },
});
