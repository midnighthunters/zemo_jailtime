import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePremiumStore } from '@/src/store/usePremiumStore';
import { colors, radius, shadows } from '@/src/constants/theme';

type PremiumGateProps = { reason: string; children: ReactNode };

export function PremiumGate({ reason, children }: PremiumGateProps) {
  const router = useRouter();
  const isPro = usePremiumStore((state) => state.isPro);
  if (isPro) return <>{children}</>;

  return (
    <Pressable accessibilityRole="button" accessibilityLabel="View Supreme Court Mode" onPress={() => router.push('/modals/paywall')} style={styles.root}>
      {children}
      <View style={styles.overlay}>
        <View style={styles.lockCard}>
          <View style={styles.iconStage}><Image source="sf:crown.fill" tintColor={colors.indigo} contentFit="contain" style={styles.lockIcon} /></View>
          <Text style={styles.lockTitle}>SUPREME COURT MODE</Text>
          <Text style={styles.lockCopy}>{reason}</Text>
          <View style={styles.cta}><Text style={styles.ctaText}>View premium</Text></View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { overflow: 'hidden', borderRadius: radius.xl },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(247,248,250,0.9)' },
  lockCard: { width: '100%', borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: '#DCD5F3', borderBottomWidth: 4, borderBottomColor: '#CFC6ED', padding: 18, alignItems: 'center', gap: 7, ...shadows.strong },
  iconStage: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.purpleLight, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  lockIcon: { width: 21, height: 21 },
  lockTitle: { color: colors.indigo, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center' },
  lockCopy: { color: colors.labelSecondary, fontSize: 13, fontWeight: '400', textAlign: 'center', lineHeight: 18 },
  cta: { marginTop: 4, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: colors.indigo },
  ctaText: { color: colors.white, fontSize: 12, fontWeight: '700' },
});
