import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingArt } from '@/src/constants/assets';
import { ONBOARDING_STEPS, type OnboardingStep } from '@/src/data/onboarding';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtButton } from '@/src/components/CourtButton';
import { colors, radius, shadows } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';

type OnboardingSceneProps = {
  step: OnboardingStep;
  children?: ReactNode;
  /** Provide a custom CTA block to replace the default single CourtButton. */
  overrideCta?: ReactNode;
};

export function OnboardingScene({ step, children, overrideCta }: OnboardingSceneProps) {
  const router = useRouter();
  const completeOnboarding = useCourtStore((state) => state.completeOnboarding);
  const index = ONBOARDING_STEPS.findIndex((item) => item.id === step.id);
  const next = ONBOARDING_STEPS[index + 1];
  const art = OnboardingArt[step.artKey];

  const goNext = () => {
    if (next) router.push(next.route);
    else {
      completeOnboarding();
      router.replace('/(tabs)/courtroom');
    }
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={art} resizeMode="cover" style={styles.backgroundArt} imageStyle={styles.image} />
      <LinearGradient colors={['rgba(24, 11, 8, 0.1)', 'rgba(24, 11, 8, 0.48)', colors.background]} style={styles.tint}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.top}>
            <Text style={styles.step}>COURT BRIEFING {index + 1}/{ONBOARDING_STEPS.length}</Text>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.subtitle}>{step.subtitle}</Text>
          </View>
          <View style={styles.assets}>
            {step.assetKeys.map((assetKey) => (
              <AssetImage key={assetKey} assetKey={assetKey} width={88} height={88} />
            ))}
          </View>
          {children ? (
            <View style={styles.panel}>
              {children}
            </View>
          ) : null}
          {overrideCta ?? <CourtButton title={step.cta} onPress={goNext} />}
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
