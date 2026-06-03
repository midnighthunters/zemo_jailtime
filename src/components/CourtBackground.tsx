import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/src/constants/theme';

type CourtBackgroundProps = {
  children: ReactNode;
  padded?: boolean;
};

export function CourtBackground({ children, padded = true }: CourtBackgroundProps) {
  return (
    <LinearGradient colors={[colors.background, colors.background2, colors.woodDark]} style={styles.root}>
      <View style={styles.spotlight} />
      <View style={styles.sideGlow} />
      <View style={styles.floorRail} />
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, padded && styles.padded]}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  safe: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 18,
  },
  spotlight: {
    position: 'absolute',
    top: -90,
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 200, 61, 0.16)',
  },
  sideGlow: {
    position: 'absolute',
    top: 130,
    right: -120,
    width: 240,
    height: 300,
    borderRadius: 140,
    backgroundColor: 'rgba(215, 53, 42, 0.12)',
  },
  floorRail: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 118,
    borderTopWidth: 3,
    borderColor: 'rgba(255, 200, 61, 0.16)',
    backgroundColor: 'rgba(58, 29, 17, 0.82)',
  },
});
