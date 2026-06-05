import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import type { FocusCourtAssetKey } from '@/src/constants/assets';
import { AssetImage } from '@/src/components/AssetImage';
import { colors } from '@/src/constants/theme';

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  assetKey?: FocusCourtAssetKey;
};

export function ScreenHeader({ eyebrow, title, subtitle, assetKey }: ScreenHeaderProps) {
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(withSequence(withTiming(1, { duration: 1800 }), withTiming(0, { duration: 1800 })), -1, false);
  }, [float]);

  const assetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -3 + float.value * 6 }, { rotate: `${-2 + float.value * 4}deg` }],
  }));

  return (
    <Animated.View entering={FadeInDown.duration(340).springify().damping(18)} style={styles.root}>
      <View style={styles.text}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {assetKey ? (
        <Animated.View entering={FadeInRight.duration(360).delay(80).springify().damping(16)} style={assetStyle}>
          <AssetImage assetKey={assetKey} width={88} height={88} />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 8,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    color: colors.cream,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.parchment,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
});
