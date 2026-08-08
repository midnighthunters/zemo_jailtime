import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppSuspect } from '@/src/types/court';
import { colors, radius, shadows } from '@/src/constants/theme';

type BlockedAppTileProps = {
  suspect: AppSuspect;
  onPress?: () => void;
  locked?: boolean;
};

/** App tile with a text lock state. Icon-free by design. */
export function BlockedAppTile({ suspect, onPress, locked = true }: BlockedAppTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${suspect.displayName}${locked ? ', locked' : ', open'}`}
      accessibilityState={{ disabled: false }}
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <View style={styles.tile}>
        <View style={[styles.icon, { backgroundColor: suspect.iconColor }]}>
          <Text style={styles.iconText}>
            {suspect.isWebsite ? 'W' : suspect.displayName.slice(0, 1).toUpperCase()}
          </Text>
        </View>
        {locked ? (
          <View style={styles.lockLayer}>
            <View style={styles.lockBadge}>
              <Text style={styles.lockLabel}>LOCKED</Text>
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
  lockLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(39,43,48,0.52)',
  },
  lockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.xs,
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  lockLabel: { color: colors.redDark, fontSize: 8, fontWeight: '700', letterSpacing: 0.4 },
  name: { color: colors.labelSecondary, fontSize: 11, fontWeight: '600', maxWidth: TILE, textAlign: 'center' },
});
