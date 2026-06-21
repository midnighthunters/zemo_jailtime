import { BlurView } from 'expo-blur';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppSuspect } from '@/src/types/court';
import { colors, radius, shadows } from '@/src/constants/theme';

type BlockedAppTileProps = {
  suspect: AppSuspect;
  onPress?: () => void;
  /** When true the app is currently locked and shows the lock overlay. */
  locked?: boolean;
};

// A compact app icon tile with a frosted lock overlay. Used to surface the
// apps that are currently in custody at the top of the Jail screen.
export function BlockedAppTile({ suspect, onPress, locked = true }: BlockedAppTileProps) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <View style={styles.tile}>
        <View style={[styles.icon, { backgroundColor: suspect.iconColor }]}>
          <Text style={styles.iconText}>
            {suspect.isWebsite ? '🌐' : suspect.displayName.slice(0, 1).toUpperCase()}
          </Text>
        </View>

        {locked ? (
          <View style={styles.lockLayer}>
            {Platform.OS !== 'web' ? (
              <BlurView tint="dark" intensity={22} style={StyleSheet.absoluteFillObject} />
            ) : (
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.32)' }]} />
            )}
            <View style={styles.lockBadge}>
              <Text style={styles.lockGlyph}>🔒</Text>
            </View>
          </View>
        ) : null}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {suspect.displayName}
      </Text>
    </Pressable>
  );
}

const TILE = 64;

const styles = StyleSheet.create({
  wrap: {
    width: TILE,
    alignItems: 'center',
    gap: 6,
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 18,
    overflow: 'hidden',
    ...shadows.soft,
  },
  icon: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '700',
  },
  lockLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  lockBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  lockGlyph: {
    fontSize: 15,
  },
  name: {
    color: colors.labelSecondary,
    fontSize: 11,
    fontWeight: '600',
    maxWidth: TILE,
    textAlign: 'center',
  },
});
