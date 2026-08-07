import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppSuspect } from '@/src/types/court';
import { colors, radius, shadows } from '@/src/constants/theme';

type BlockedAppTileProps = {
  suspect: AppSuspect;
  onPress?: () => void;
  locked?: boolean;
};

export function BlockedAppTile({ suspect, onPress, locked = true }: BlockedAppTileProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <View style={styles.tile}>
        <View style={[styles.icon, { backgroundColor: suspect.iconColor }]}>
          <Text style={styles.iconText}>{suspect.isWebsite ? 'W' : suspect.displayName.slice(0, 1).toUpperCase()}</Text>
        </View>
        {locked ? (
          <View style={styles.lockLayer}>
            <View style={styles.lockBadge}>
              <Image source="sf:lock.fill" tintColor={colors.label} contentFit="contain" style={styles.lockGlyph} />
            </View>
          </View>
        ) : null}
      </View>
      <Text style={styles.name} numberOfLines={1}>{suspect.displayName}</Text>
    </Pressable>
  );
}

const TILE = 64;
const styles = StyleSheet.create({
  wrap: { width: TILE, alignItems: 'center', gap: 6 },
  pressed: { transform: [{ translateY: 3 }] },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
    ...shadows.soft,
  },
  icon: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: colors.white, fontSize: 26, fontWeight: '700' },
  lockLayer: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(39,43,48,0.42)' },
  lockBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  lockGlyph: { width: 14, height: 14 },
  name: { color: colors.labelSecondary, fontSize: 11, fontWeight: '600', maxWidth: TILE, textAlign: 'center' },
});
