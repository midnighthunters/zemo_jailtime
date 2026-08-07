import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius, shadows } from '@/src/constants/theme';
import { usePremiumStore } from '@/src/store/usePremiumStore';

const benefits = [
  { symbol: 'square.stack.3d.up.fill', text: 'Unlimited suspect apps' },
  { symbol: 'building.columns.fill', text: 'Unlimited Focus Laws' },
  { symbol: 'lock.shield.fill', text: 'Supreme Strict Mode' },
  { symbol: 'chart.bar.fill', text: 'Advanced evidence reports' },
  { symbol: 'pencil.line', text: 'Custom law names' },
  { symbol: 'ticket.fill', text: 'Mercy Passes' },
  { symbol: 'sparkles', text: 'Courtroom upgrades' },
  { symbol: 'iphone.gen3', text: 'Real iOS blocking' },
];

export default function PaywallModal() {
  const router = useRouter();
  const { packages, purchase, restore, isLoading, error, isPro, setMockPro } = usePremiumStore();

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(300)} style={styles.heroOuter}>
          <View style={styles.premiumAccent} />
          <View style={styles.hero}>
            <View style={styles.heroText}>
              <StampBadge label="Pro Required" tone="purple" />
              <Text style={styles.heroTitle}>Supreme Court Mode</Text>
              <Text style={styles.heroCopy}>Unlimited laws. Stronger punishments. Cleaner record.</Text>
            </View>
            <View style={styles.assetStage}><AssetImage assetKey="ASSET_SUPREME_COURT_MODE_PAYWALL" width={112} height={112} /></View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(280).delay(60)} style={styles.benefitGrid}>
          {benefits.map((benefit) => (
            <View key={benefit.text} style={styles.benefitOuter}>
              <View style={styles.benefitIconStage}><Image source={`sf:${benefit.symbol}`} tintColor={colors.indigo} contentFit="contain" style={styles.benefitIcon} /></View>
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={styles.packages}>
          {packages.map((pkg) => (
            <CourtCard key={pkg.identifier} variant={pkg.period === 'annual' ? 'blue' : 'glass'}>
              <View style={styles.packageRow}>
                <View style={styles.packageText}>
                  {pkg.badge ? <StampBadge label={pkg.badge} tone="success" /> : null}
                  <Text style={styles.packageTitle}>{pkg.title}</Text>
                  <Text style={styles.packagePrice}>{pkg.price}</Text>
                </View>
                <CourtButton title="Choose" variant="primary" small loading={isLoading} onPress={() => purchase(pkg.identifier)} />
              </View>
            </CourtCard>
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {isPro ? <Text style={styles.proText}>Supreme Court Mode active</Text> : null}
        <CourtButton title="Restore Purchase" variant="ghost" onPress={restore} loading={isLoading} />
        {__DEV__ ? <CourtButton title="Dev: Toggle Pro" variant="secondary" onPress={() => setMockPro(!isPro)} /> : null}
        <CourtButton title="Close" variant="ghost" onPress={() => router.back()} />
        <Text style={styles.legal}>Terms and Privacy placeholders are ready for production links.</Text>
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingBottom: 32 },
  heroOuter: { borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: '#DCD5F3', borderBottomWidth: 5, borderBottomColor: '#CFC6ED', overflow: 'hidden', ...shadows.card },
  premiumAccent: { position: 'absolute', top: 0, left: 24, right: 24, height: 4, borderRadius: 2, backgroundColor: colors.indigo },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20 },
  heroText: { flex: 1, gap: 10 },
  assetStage: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', borderRadius: radius.xl, backgroundColor: colors.purpleLight },
  heroTitle: { color: colors.label, fontSize: 26, lineHeight: 32, fontWeight: '700', letterSpacing: -0.35 },
  heroCopy: { color: colors.labelSecondary, fontSize: 15, lineHeight: 21, fontWeight: '400' },
  benefitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  benefitOuter: { width: '48%', minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 9, padding: 11, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderBottomWidth: 3, borderBottomColor: colors.depthEdge },
  benefitIconStage: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purpleLight },
  benefitIcon: { width: 16, height: 16 },
  benefitText: { flex: 1, color: colors.label, fontSize: 12, lineHeight: 16, fontWeight: '500', letterSpacing: -0.1 },
  packages: { gap: 10 },
  packageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  packageText: { flex: 1, gap: 6 },
  packageTitle: { color: colors.label, fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  packagePrice: { color: colors.blue, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  errorText: { color: colors.red, fontSize: 13, lineHeight: 18, textAlign: 'center', fontWeight: '500' },
  proText: { color: colors.greenDark, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  legal: { color: colors.labelTertiary, fontSize: 11, lineHeight: 16, textAlign: 'center', fontWeight: '400' },
});
