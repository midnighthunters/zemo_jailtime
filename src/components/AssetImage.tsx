import type { ImageStyle, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { FocusCourtAssets, type FocusCourtAssetKey } from '@/src/constants/assets';
import { colors, radius } from '@/src/constants/theme';

type AssetImageProps = {
  assetKey: FocusCourtAssetKey;
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  absolute?: boolean;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  opacity?: number;
};

export function AssetImage({
  assetKey,
  width = 120,
  height = 120,
  style,
  containerStyle,
  absolute,
  top,
  right,
  bottom,
  left,
  opacity = 1,
}: AssetImageProps) {
  const source = FocusCourtAssets[assetKey];
  const frameStyle: StyleProp<ViewStyle> = [
    { width, height, opacity },
    absolute ? { position: 'absolute', top, right, bottom, left } : null,
    containerStyle,
  ];

  if (!source) {
    return (
      <View style={[styles.placeholder, frameStyle]}>
        <Text style={styles.placeholderText}>COURT ASSET</Text>
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={frameStyle}>
      <Image source={source} style={[styles.image, style]} contentFit="contain" transition={120} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.parchment,
    borderWidth: 2,
    borderColor: colors.parchmentDark,
  },
  placeholderText: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: '900',
  },
});
