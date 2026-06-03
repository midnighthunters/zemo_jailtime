import { StyleSheet, Text, View } from 'react-native';
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
      <AssetImage assetKey={assetKey} width={92} height={92} />
      <View style={styles.bubble}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.line}>{line}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bubble: {
    flex: 1,
    backgroundColor: colors.parchment,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 2,
    borderColor: colors.parchmentDark,
    ...shadows.soft,
  },
  name: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '900',
  },
  line: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
  },
});
