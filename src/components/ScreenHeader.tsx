import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { FocusCourtAssetKey } from '@/src/constants/assets';
import { AssetImage } from '@/src/components/AssetImage';
import { colors, radius, shadows } from '@/src/constants/theme';

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  assetKey?: FocusCourtAssetKey;
  rightAction?: ReactNode;
};

export function ScreenHeader({ eyebrow, title, subtitle, assetKey, rightAction }: ScreenHeaderProps) {
  return (
    <Animated.View entering={FadeInDown.duration(180)} style={styles.root}>
      <View style={styles.accent} />
      <View style={styles.content}>
        <View style={styles.text}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
          ) : null}
        </View>

        {rightAction ? <View style={styles.actionStage}>{rightAction}</View> : null}
        {!rightAction && assetKey ? (
          <View style={styles.assetStage}>
            <AssetImage assetKey={assetKey} width={72} height={72} />
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
    overflow: 'hidden',
    ...shadows.card,
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: 20,
    width: 44,
    height: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: colors.blue,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: 20,
  },
  text: {
    flex: 1,
    gap: 5,
  },
  eyebrow: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.label,
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  subtitle: {
    color: colors.labelSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  actionStage: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  assetStage: {
    width: 82,
    height: 82,
    borderRadius: 22,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
