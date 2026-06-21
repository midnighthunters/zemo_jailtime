import { BlurView } from 'expo-blur';
import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { FocusLaw } from '@/src/types/court';
import { AssetImage } from '@/src/components/AssetImage';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius, shadows } from '@/src/constants/theme';
import { permissionCopy } from '@/src/data/permissions';
import { describesSchedule } from '@/src/utils/lawPolicy';

type LawCardProps = {
  law: FocusLaw;
  locked?: boolean;
  onToggle: () => void;
  delay?: number;
};

export function LawCard({ law, locked, onToggle, delay = 0 }: LawCardProps) {
  const enforcementMode = law.enforcementMode ?? 'softBlock';
  const trigger = law.trigger ?? 'appLaunch';
  const permissionLabels = (law.requiredPermissionIds ?? [])
    .map((id) => permissionCopy(id)?.title)
    .filter((label): label is string => Boolean(label))
    .slice(0, 3);

  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.976, { damping: 18, stiffness: 380 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 13, stiffness: 260 });
  };

  return (
    <Pressable
      onPress={onToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.card,
          law.isEnabled && styles.enabled,
          animStyle,
        ]}
      >
        {/* Native glass blur */}
        {Platform.OS !== 'web' ? (
          <BlurView
            blurType="systemUltraThinMaterial"
            blurAmount={18}
            style={StyleSheet.absoluteFillObject}
            reducedTransparencyFallbackColor="rgba(255,255,255,0.72)"
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.72)' }]} />
        )}
        {/* Color tint — blue when enabled */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            styles.tint,
            law.isEnabled && styles.tintEnabled,
          ]}
        />
        {/* Specular highlight */}
        <View style={styles.highlight} />
        {/* Border */}
        <View style={[styles.border, law.isEnabled && styles.borderEnabled]} />

        {/* Content */}
        <View style={styles.content}>
          <AssetImage assetKey={law.assetKey} width={68} height={68} />
          <View style={styles.body}>
            <View style={styles.topRow}>
              <Text style={styles.title} numberOfLines={1}>{law.name}</Text>
              <Switch
                value={law.isEnabled}
                onValueChange={onToggle}
                thumbColor={colors.white}
                trackColor={{ true: colors.blue, false: 'rgba(120,120,128,0.22)' }}
                ios_backgroundColor="rgba(120,120,128,0.22)"
              />
            </View>
            <Text style={styles.description} numberOfLines={2}>{law.description}</Text>
            <View style={styles.meta}>
              <StampBadge
                label={locked ? 'Pro' : law.category}
                tone={locked ? 'purple' : law.isEnabled ? 'success' : 'blue'}
              />
              <StampBadge
                label={enforcementMode}
                tone={enforcementMode === 'hardBlock' ? 'danger' : 'orange'}
              />
            </View>
            <View style={styles.details}>
              <Text style={styles.detail}>{trigger}</Text>
              <Text style={styles.detail}>{describesSchedule(law)}</Text>
              {permissionLabels.map((label) => (
                <Text key={label} style={styles.detail}>{label}</Text>
              ))}
              <Text style={styles.sentenceTag}>
                {law.firstPunishmentMinutes}–{law.maxSentenceMinutes} min
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.soft,
  },
  enabled: {
    // slight blue shadow when active
    shadowColor: colors.blue,
    shadowOpacity: 0.12,
    shadowRadius: 14,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.xl,
  },
  tintEnabled: {
    backgroundColor: 'rgba(0,122,255,0.06)',
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
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  borderEnabled: {
    borderColor: 'rgba(0,122,255,0.24)',
  },
  body: {
    flex: 1,
    gap: 7,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.label,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  description: {
    color: colors.labelSecondary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '400',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  detail: {
    maxWidth: '100%',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(120,120,128,0.1)',
    color: colors.labelSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  sentenceTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,149,0,0.1)',
    color: colors.orangeDark,
    fontSize: 11,
    fontWeight: '600',
  },
});
