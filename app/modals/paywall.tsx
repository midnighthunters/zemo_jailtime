import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <LinearGradient
          colors={['rgba(88,86,214,0.14)', 'rgba(175,82,222,0.1)']}
          style={styles.heroGradient}
        >
          <View style={styles.hero}>
            <View style={styles.heroText}>
              <StampBadge label="Pro Required" tone="purple" />
              <Text style={styles.title}>Supreme Court Mode</Text>
              <Text style={styles.copy}>
                Unlimited laws. Stronger punishments. Cleaner record.
              </Text>
            </View>
            <AssetImage
              assetKey="ASSET_SUPREME_COURT_MODE_PAYWALL"
              width={130}
              height={130}
            />
          </View>
        </LinearGradient>

        {/* ── Benefits ─────────────────────────────────────────────── */}
        <View style={styles.benefitGrid}>
          {benefits.map((benefit) => (
            <View key={benefit.text} style={styles.benefit}>
              <Text style={styles.benefitIcon}>{benefit.icon}</Text>
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </View>

        {/* ── Packages ─────────────────────────────────────────────── */}
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

  // ── hero ──
  heroGradient: {
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(88,86,214,0.28)',
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
  title: {
    color: colors.label,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: 0.35,
  },
  copy: {
    color: colors.labelSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
  },

  // ── benefits ──
  benefitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  benefitIcon: { fontSize: 15 },
  benefitText: { color: colors.label, fontSize: 13, fontWeight: '500' },

  // ── packages ──
  packages: { gap: 10 },
  packageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  packageText: { flex: 1, gap: 6 },
  packageTitle: { color: colors.label, fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  packagePrice: { color: colors.blue, fontSize: 16, fontWeight: '700' },

  // ── misc ──
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
