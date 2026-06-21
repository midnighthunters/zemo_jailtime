import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInLeft,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
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
      withSequence(withTiming(1, { duration: 2200 }), withTiming(0, { duration: 2200 })),
      -1,
      false,
    );
  }, [float]);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value * -4 }],
  }));

  return (
    <View style={styles.root}>
      <Animated.View
        entering={FadeInLeft.duration(300).springify().damping(16)}
        style={avatarStyle}
      >
        <AssetImage assetKey={assetKey} width={82} height={82} />
      </Animated.View>
      <Animated.View
        entering={FadeInRight.duration(320).delay(80).springify().damping(18)}
        style={styles.bubble}
      >
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.line}>{line}</Text>
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
  bubble: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: radius.xl,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    gap: 4,
    ...shadows.soft,
  },
  name: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  line: {
    color: colors.label,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
});
