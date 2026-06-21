import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius, shadows } from '@/src/constants/theme';
import { usePremiumStore } from '@/src/store/usePremiumStore';

const benefits = [
  { icon: '∞', text: 'Unlimited suspect apps' },
  { icon: '⚖️', text: 'Unlimited Focus Laws' },
  { icon: '🔒', text: 'Supreme Strict Mode' },
  { icon: '📊', text: 'Advanced evidence reports' },
  { icon: '✏️', text: 'Custom law names' },
  { icon: '🎟️', text: 'Mercy Passes' },
  { icon: '🏛️', text: 'Courtroom upgrades' },
  { icon: '📱', text: 'Real iOS blocking (coming)' },
];

export default function PaywallModal() {
  const router = useRouter();
  const { packages, purchase, restore, isLoading, error, isPro, setMockPro } = usePremiumStore();

  return (
    <CourtBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── Hero — deep glass with gradient overlay ────────────── */}
        <Animated.View
          entering={FadeInDown.duration(400).springify().damping(18)}
          style={styles.heroOuter}
        >
          {Platform.OS !== 'web' ? (
            <BlurView
              blurType="systemUltraThinMaterial"
              blurAmount={24}
              style={StyleSheet.absoluteFillObject}
              reducedTransparencyFallbackColor="rgba(255,255,255,0.82)"
            />
          ) : null}
          {/* Gradient tint — purple/indigo premium hue */}
          <LinearGradient
            colors={['rgba(88,86,214,0.12)', 'rgba(175,82,222,0.08)']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.heroHighlight} />
          <View style={styles.heroBorder} />

          <View style={styles.hero}>
            <View style={styles.heroText}>
              <StampBadge label="Pro Required" tone="purple" />
              <Text style={styles.heroTitle}>Supreme Court Mode</Text>
              <Text style={styles.heroCopy}>
                Unlimited laws. Stronger punishments. Cleaner record.
              </Text>
            </View>
            <AssetImage assetKey="ASSET_SUPREME_COURT_MODE_PAYWALL" width={128} height={128} />
          </View>
        </Animated.View>

        {/* ── Benefits grid — glass pills ───────────────────────── */}
        <Animated.View
          entering={FadeInUp.duration(340).delay(80).springify().damping(18)}
          style={styles.benefitGrid}
        >
          {benefits.map((benefit, index) => (
            <Animated.View
              key={benefit.text}
              entering={FadeInUp.duration(280).delay(100 + index * 40).springify().damping(17)}
              style={styles.benefitOuter}
            >
              {Platform.OS !== 'web' ? (
                <BlurView
                  blurType="systemUltraThinMaterial"
                  blurAmount={14}
                  style={StyleSheet.absoluteFillObject}
                  reducedTransparencyFallbackColor="rgba(255,255,255,0.72)"
                />
              ) : null}
              <View style={[StyleSheet.absoluteFillObject, styles.benefitTint]} />
              <View style={styles.benefitHighlight} />
              <View style={styles.benefitBorder} />
              <Text style={styles.benefitIcon}>{benefit.icon}</Text>
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </Animated.View>
          ))}
        </Animated.View>

        {/* ── Packages ─────────────────────────────────────────── */}
        <View style={styles.packages}>
          {packages.map((pkg) => (
            <CourtCard
              key={pkg.identifier}
              variant={pkg.period === 'annual' ? 'blue' : 'glass'}
            >
              <View style={styles.packageRow}>
                <View style={styles.packageText}>
                  {pkg.badge ? <StampBadge label={pkg.badge} tone="success" /> : null}
                  <Text style={styles.packageTitle}>{pkg.title}</Text>
                  <Text style={styles.packagePrice}>{pkg.price}</Text>
                </View>
                <CourtButton
                  title="Choose"
                  variant="primary"
                  small
                  loading={isLoading}
                  onPress={() => purchase(pkg.identifier)}
                />
              </View>
            </CourtCard>
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {isPro ? (
          <Text style={styles.proText}>✓ Supreme Court Mode active</Text>
        ) : null}

        <CourtButton
          title="Restore Purchase"
          variant="ghost"
          onPress={restore}
          loading={isLoading}
        />
        {__DEV__ ? (
          <CourtButton
            title="Dev: Toggle Pro"
            variant="secondary"
            onPress={() => setMockPro(!isPro)}
          />
        ) : null}
        <CourtButton title="Close" variant="ghost" onPress={() => router.back()} />

        <Text style={styles.legal}>
          Terms and Privacy placeholders are ready for production links.
        </Text>
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 32,
  },

  // ── Hero ──
  heroOuter: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(88,86,214,0.22)',
    ...shadows.card,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  heroText: {
    flex: 1,
    gap: 10,
  },
  heroHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  heroBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.xl,
    borderWidth: 0, // Already set on outer
  },
  heroTitle: {
    color: colors.label,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: 0.35,
  },
  heroCopy: {
    color: colors.labelSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
  },

  // ── Benefits ──
  benefitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  benefitOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...shadows.soft,
  },
  benefitTint: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.pill,
  },
  benefitHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
  },
  benefitBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  benefitIcon: {
    fontSize: 15,
  },
  benefitText: {
    color: colors.label,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.1,
  },

  // ── Packages ──
  packages: {
    gap: 10,
  },
  packageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  packageText: {
    flex: 1,
    gap: 6,
  },
  packageTitle: {
    color: colors.label,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  packagePrice: {
    color: colors.blue,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // ── Misc ──
  errorText: {
    color: colors.red,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  proText: {
    color: colors.greenDark,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  legal: {
    color: colors.labelTertiary,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    fontWeight: '400',
  },
});
