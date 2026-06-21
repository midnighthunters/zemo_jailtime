import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { usePremiumStore } from '@/src/store/usePremiumStore';
import { colors, radius, shadows } from '@/src/constants/theme';

type PremiumGateProps = {
  reason: string;
  children: ReactNode;
};

export function PremiumGate({ reason, children }: PremiumGateProps) {
  const router = useRouter();
  const isPro = usePremiumStore((state) => state.isPro);
  if (isPro) return <>{children}</>;

  return (
    <Pressable onPress={() => router.push('/modals/paywall')} style={styles.root}>
      {children}
      {/* Strong blur overlay — dims content behind it */}
      <BlurView intensity={60} tint="systemThickMaterial" style={styles.overlay}>
        {/* Glass lock card */}
        <View style={styles.lockCard}>
          <BlurView intensity={80} tint="systemUltraThinMaterial" style={StyleSheet.absoluteFillObject} />
          <View style={styles.lockTint} />
          <View style={styles.lockHighlight} />
          <View style={styles.lockBorder} />
          <Text style={styles.lockIcon}>🏛️</Text>
          <Text style={styles.lockTitle}>SUPREME COURT MODE</Text>
          <Text style={styles.lockCopy}>{reason}</Text>
        </View>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    borderRadius: radius.xl,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  lockCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: 18,
    alignItems: 'center',
    gap: 6,
    ...shadows.strong,
  },
  lockTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(88,86,214,0.1)',
    borderRadius: radius.xl,
  },
  lockHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  lockBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(88,86,214,0.3)',
  },
  lockIcon: {
    fontSize: 28,
  },
  lockTitle: {
    color: colors.indigo,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  lockCopy: {
    color: colors.label,
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 18,
  },
});
