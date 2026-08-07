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
    <View style={styles.root}>
      <View style={styles.topWash} pointerEvents="none" />
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[styles.safe, padded && styles.padded]}
      >
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 18,
  },
  topWash: {
    position: 'absolute',
    top: -150,
    right: -120,
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: '#EEF3FF',
    opacity: 0.72,
  },
});
