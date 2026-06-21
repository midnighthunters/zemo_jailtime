import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import { colors, radius, shadows } from '@/src/constants/theme';

type ProgressDocketProps = {
  items: { label: string; value: string | number }[];
};

export function ProgressDocket({ items }: ProgressDocketProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(300).delay(100).springify().damping(18)}
      layout={LinearTransition.springify().damping(18)}
      style={styles.grid}
    >
      {items.map((item, index) => (
        <Animated.View
          key={item.label}
          entering={FadeInUp.duration(260).delay(140 + index * 55).springify().damping(17)}
          layout={LinearTransition.springify().damping(18)}
          style={styles.item}
        >
          {/* Native glass blur */}
          {Platform.OS !== 'web' ? (
            <BlurView
              blurType="systemUltraThinMaterial"
              blurAmount={18}
              style={StyleSheet.absoluteFillObject}
              reducedTransparencyFallbackColor="rgba(255,255,255,0.72)"
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.72)' }]} />
          )}
          {/* Glass tint */}
          <View style={[StyleSheet.absoluteFillObject, styles.tint]} />
          {/* Specular highlight */}
          <View style={styles.highlight} />
          {/* Border */}
          <View style={styles.border} />

          {/* Content */}
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  item: {
    flex: 1,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    overflow: 'hidden',
    gap: 4,
    ...shadows.soft,
  },
  tint: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.xl,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  value: {
    color: colors.blue,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  label: {
    color: colors.labelSecondary,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.1,
    paddingHorizontal: 8,
  },
});
