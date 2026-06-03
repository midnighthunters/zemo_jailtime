import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { usePremiumStore } from '@/src/store/usePremiumStore';
import { colors, radius } from '@/src/constants/theme';

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
      <BlurView intensity={26} tint="dark" style={styles.overlay}>
        <View style={styles.lock}>
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
    borderRadius: radius.lg,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  lock: {
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: 'rgba(36, 22, 71, 0.86)',
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
  },
  lockTitle: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  lockCopy: {
    color: colors.cream,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});
