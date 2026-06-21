import { BlurView } from 'expo-blur';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { AppSuspect } from '@/src/types/court';
import { colors, radius, shadows } from '@/src/constants/theme';
import { StampBadge } from '@/src/components/StampBadge';

type SuspectAppCardProps = {
  suspect: AppSuspect;
  onPress?: () => void;
  compact?: boolean;
  delay?: number;
};

export function SuspectAppCard({ suspect, onPress, compact, delay = 0 }: SuspectAppCardProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.972, { damping: 18, stiffness: 380 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 13, stiffness: 260 }); }}
    >
      <Animated.View
        style={[
          styles.card,
          compact && styles.compact,
          animStyle,
        ]}
      >
        {/* Native glass blur */}
        {Platform.OS !== 'web' ? (
          <BlurView
            tint="systemUltraThinMaterial"
            intensity={18}
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.72)' }]} />
        )}
        {/* Tint — blue when selected */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            styles.tint,
            suspect.isSelected && styles.tintSelected,
          ]}
        />
        {/* Specular highlight */}
        <View style={styles.highlight} />
        {/* Border */}
        <View style={[styles.border, suspect.isSelected && styles.borderSelected]} />

        {/* Content */}
        <View style={styles.inner}>
          <View style={[styles.icon, { backgroundColor: suspect.iconColor }]}>
            <Text style={styles.iconText}>{suspect.displayName.slice(0, 1)}</Text>
          </View>
          <View style={styles.body}>
            <Text style={styles.name}>{suspect.displayName}</Text>
            <Text style={styles.villain}>{suspect.villainName}</Text>
            {!compact ? (
              <Text style={styles.meta}>
                {suspect.dailyOpenCount} opens · {suspect.dailyUsageMinutes} min today
              </Text>
            ) : null}
          </View>
          {suspect.isPremium ? <StampBadge label="Pro" tone="purple" /> : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.soft,
  },
  compact: {
    flex: 1,
    minWidth: 150,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.xl,
  },
  tintSelected: {
    backgroundColor: 'rgba(0,122,255,0.07)',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
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
  borderSelected: {
    borderColor: 'rgba(0,122,255,0.26)',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.label,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  villain: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: '500',
  },
  meta: {
    color: colors.labelSecondary,
    fontSize: 11,
    fontWeight: '400',
    marginTop: 1,
  },
});
