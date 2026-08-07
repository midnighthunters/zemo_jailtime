import type { ReactNode } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingArt } from '@/src/constants/assets';
import { ONBOARDING_STEPS, type OnboardingStep } from '@/src/data/onboarding';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtButton } from '@/src/components/CourtButton';
import { colors, radius, shadows } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';

type OnboardingSceneProps = {
  step: OnboardingStep;
  children?: ReactNode;
  overrideCta?: ReactNode;
};

export function OnboardingScene({ step, children, overrideCta }: OnboardingSceneProps) {
  const router = useRouter();
  const completeOnboarding = useCourtStore((state) => state.completeOnboarding);
  const index = ONBOARDING_STEPS.findIndex((item) => item.id === step.id);
  const next = ONBOARDING_STEPS[index + 1];
  const progress = `${((index + 1) / ONBOARDING_STEPS.length) * 100}%` as `${number}%`;

  const goNext = () => {
    if (next) router.push(next.route);
    else {
      completeOnboarding();
      router.replace('/(tabs)/courtroom');
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.topWash} pointerEvents="none" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.progressHeader}>
          <View style={styles.progressCopy}>
            <Text style={styles.brand}>FOCUS COURT</Text>
            <Text style={styles.step}>Briefing {index + 1} of {ONBOARDING_STEPS.length}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: progress }]} />
          </View>
        </View>

        <ImageBackground
          source={OnboardingArt[step.artKey]}
          resizeMode="cover"
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroWash} />
          <View style={styles.assets}>
            {step.assetKeys.map((assetKey) => (
              <View key={assetKey} style={styles.assetStage}>
                <AssetImage assetKey={assetKey} width={82} height={82} />
              </View>
            ))}
          </View>
        </ImageBackground>

        <View style={styles.heading}>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.subtitle}>{step.subtitle}</Text>
        </View>

        {children ? <View style={styles.panel}>{children}</View> : null}
        <View style={styles.cta}>{overrideCta ?? <CourtButton title={step.cta} onPress={goNext} />}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  topWash: {
    position: 'absolute',
    top: -160,
    right: -130,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#EDF2FF',
  },
  content: {
    flexGrow: 1,
    gap: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 36,
  },
  progressHeader: {
    gap: 10,
  },
  progressCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  step: {
    color: colors.labelSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.fillSecondary,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.blue,
  },
  hero: {
    minHeight: 218,
    borderRadius: radius.xxl,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
    overflow: 'hidden',
    justifyContent: 'center',
    ...shadows.card,
  },
  heroImage: {
    borderRadius: radius.xxl,
    opacity: 0.18,
  },
  heroWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.76)',
  },
  assets: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
    padding: 24,
  },
  assetStage: {
    width: 102,
    height: 102,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  heading: {
    gap: 8,
    paddingHorizontal: 2,
  },
  title: {
    color: colors.label,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: colors.labelSecondary,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '500',
  },
  panel: {
    padding: 20,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
    ...shadows.soft,
  },
  cta: {
    paddingTop: 2,
  },
});
