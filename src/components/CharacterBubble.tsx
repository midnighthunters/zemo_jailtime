import { BlurView } from 'expo-blur';
import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInLeft,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { FocusCourtAssetKey } from '@/src/constants/assets';
import { AssetImage } from '@/src/components/AssetImage';
import { colors, radius, shadows } from '@/src/constants/theme';

type CharacterBubbleProps = {
  assetKey: FocusCourtAssetKey;
  name: string;
  line: string;
};

export function CharacterBubble({ assetKey, name, line }: CharacterBubbleProps) {
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400 }),
        withTiming(0, { duration: 2400 }),
      ),
      -1,
      false,
    );
  }, [float]);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: float.value * -5 },
      { rotate: `${-0.5 + float.value * 1}deg` },
    ],
  }));

  return (
    <View style={styles.root}>
      <Animated.View
        entering={FadeInLeft.duration(320).springify().damping(16)}
        style={avatarStyle}
      >
        <AssetImage assetKey={assetKey} width={78} height={78} />
      </Animated.View>

      <Animated.View
        entering={FadeInRight.duration(340).delay(80).springify().damping(18)}
        style={styles.bubbleOuter}
      >
        {/* Native glass blur */}
        {Platform.OS !== 'web' ? (
          <BlurView
            tint="systemUltraThinMaterial"
            intensity={18}
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.82)' }]} />
        )}
        {/* Tint */}
        <View style={[StyleSheet.absoluteFillObject, styles.tint]} />
        {/* Specular highlight */}
        <View style={styles.highlight} />
        {/* Tail pointer */}
        <View style={styles.tail} />

        {/* Text content */}
        <View style={styles.bubbleContent}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.line}>{line}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bubbleOuter: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
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
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  tail: {
    position: 'absolute',
    left: -6,
    top: '50%',
    marginTop: -5,
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderRightWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'rgba(255,255,255,0.4)',
  },
  bubbleContent: {
    padding: 14,
    gap: 4,
  },
  name: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  line: {
    color: colors.label,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
    letterSpacing: -0.1,
  },
});
