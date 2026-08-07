import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';
import type { FocusCourtAssetKey } from '@/src/constants/assets';
import { AssetImage } from '@/src/components/AssetImage';
import { colors, radius, shadows } from '@/src/constants/theme';

type CharacterBubbleProps = {
  assetKey: FocusCourtAssetKey;
  name: string;
  line: string;
};

export function CharacterBubble({ assetKey, name, line }: CharacterBubbleProps) {
  return (
    <View style={styles.root}>
      <Animated.View entering={FadeInLeft.duration(260)} style={styles.avatarStage}>
        <AssetImage assetKey={assetKey} width={70} height={70} />
      </Animated.View>

      <Animated.View entering={FadeInRight.duration(280).delay(60)} style={styles.bubble}>
        <View style={styles.tail} />
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
  avatarStage: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
    ...shadows.soft,
  },
  bubble: {
    flex: 1,
    gap: 4,
    padding: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
    ...shadows.soft,
  },
  tail: {
    position: 'absolute',
    left: -7,
    top: 28,
    width: 14,
    height: 14,
    transform: [{ rotate: '45deg' }],
    backgroundColor: colors.surface,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: colors.border,
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
