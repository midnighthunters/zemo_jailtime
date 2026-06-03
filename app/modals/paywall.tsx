import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';
import { usePremiumStore } from '@/src/store/usePremiumStore';

const benefits = [
  'Unlimited suspect apps',
  'Unlimited Focus Laws',
  'Supreme Strict Mode',
  'Advanced evidence reports',
  'Custom law names',
  'Mercy Passes',
  'Courtroom upgrades',
  'Future real blocking features',
];

export default function PaywallModal() {
  const router = useRouter();
  const { packages, purchase, restore, isLoading, error, isPro, setMockPro } = usePremiumStore();

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <CourtCard variant="purple">
          <View style={styles.hero}>
            <View style={styles.heroText}>
              <StampBadge label="Supreme Court Required" tone="gold" />
              <Text style={styles.title}>Upgrade to Supreme Court Mode</Text>
              <Text style={styles.copy}>Unlimited laws. Stronger punishments. Cleaner record.</Text>
            </View>
            <AssetImage assetKey="ASSET_SUPREME_COURT_MODE_PAYWALL" width={142} height={142} />
          </View>
        </CourtCard>

        <View style={styles.benefits}>
          {benefits.map((benefit) => (
            <View key={benefit} style={styles.benefit}>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.packages}>
          {packages.map((pkg) => (
            <CourtCard key={pkg.identifier} variant={pkg.period === 'annual' ? 'wood' : 'dark'}>
              <View style={styles.packageRow}>
                <View style={styles.packageText}>
                  {pkg.badge ? <StampBadge label={pkg.badge} tone="success" /> : null}
                  <Text style={styles.packageTitle}>{pkg.title}</Text>
                  <Text style={styles.packagePrice}>{pkg.price}</Text>
                </View>
                <CourtButton title="Choose" variant="gold" small loading={isLoading} onPress={() => purchase(pkg.identifier)} />
              </View>
            </CourtCard>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {isPro ? <Text style={styles.pro}>Supreme Court Mode active.</Text> : null}

        <CourtButton title="Restore Purchase" variant="ghost" onPress={restore} loading={isLoading} />
        {__DEV__ ? <CourtButton title="Dev: Toggle Pro" variant="wood" onPress={() => setMockPro(!isPro)} /> : null}
        <CourtButton title="Close" variant="ghost" onPress={() => router.back()} />
        <Text style={styles.legal}>Terms and Privacy placeholders are ready for production links.</Text>
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 28,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroText: {
    flex: 1,
    gap: 8,
  },
  title: {
    color: colors.cream,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
  },
  copy: {
    color: colors.parchment,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '800',
  },
  benefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  benefit: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 242, 210, 0.1)',
  },
  benefitText: {
    color: colors.cream,
    fontSize: 12,
    fontWeight: '900',
  },
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
    gap: 5,
  },
  packageTitle: {
    color: colors.cream,
    fontSize: 18,
    fontWeight: '900',
  },
  packagePrice: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '900',
  },
  error: {
    color: colors.gold,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  pro: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  legal: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    fontWeight: '700',
  },
});
