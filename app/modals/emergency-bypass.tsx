import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius, shadows } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';

const reasons = [
  'Work emergency',
  'Family emergency',
  'Navigation / payment need',
  'Other',
];

function ReasonPill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => [styles.reasonOuter, selected && styles.reasonSelected, pressed && styles.reasonPressed]}
    >
      <View style={[styles.reasonRadio, selected && styles.reasonRadioSelected]}>{selected ? <View style={styles.reasonRadioDot} /> : null}</View>
      <Text style={[styles.reasonText, selected && styles.reasonTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function EmergencyBypassModal() {
  const router = useRouter();
  const [selected, setSelected] = useState(reasons[0]);
  const requestMercy = useCourtStore((state) => state.requestMercy);
  const mercyPasses = useCourtStore((state) => state.profile.mercyPasses);

  return (
    <CourtBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <CourtCard variant="purple">
          <View style={styles.hero}>
            <AssetImage assetKey="ASSET_EMERGENCY_BYPASS_KEY" width={124} height={124} />
            <View style={styles.heroText}>
              <StampBadge label="Emergency Bypass" tone="gold" />
              <Text style={styles.title}>
                The court allows emergencies, not excuses.
              </Text>
              <Text style={styles.mercyCount}>
                Mercy passes remaining: <Text style={styles.mercyCountValue}>{mercyPasses}</Text>
              </Text>
            </View>
          </View>
        </CourtCard>

        {/* ── Reason selection ─────────────────────────────────────── */}
        <View style={styles.optionsLabel}>
          <Text style={styles.optionsSectionTitle}>Select your reason</Text>
        </View>
        <View style={styles.options}>
          {reasons.map((reason) => (
            <ReasonPill
              key={reason}
              label={reason}
              selected={selected === reason}
              onPress={() => setSelected(reason)}
            />
          ))}
        </View>

        {/* ── Attorney quote ───────────────────────────────────────── */}
        <CourtCard variant="glass">
          <View style={styles.row}>
            <AssetImage assetKey="ASSET_ATTORNEY_CROC_EVIDENCE" width={88} height={88} />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>ATTORNEY CROC</Text>
              <Text style={styles.rowCopy}>
                We request mercy under the Emergency Clause. Reason: {selected}.
              </Text>
            </View>
            <AssetImage assetKey="ASSET_MERCY_PASS_TICKET" width={68} height={68} />
          </View>
        </CourtCard>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <CourtButton
          title="Use Mercy Pass"
          variant="destructive"
          onPress={() => {
            const granted = requestMercy();
            router.replace(granted ? '/modals/parole-granted' : '/modals/paywall');
          }}
        />
        <CourtButton title="Cancel" variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 32,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroText: {
    flex: 1,
    gap: 10,
  },
  title: {
    color: colors.label,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  mercyCount: {
    color: colors.labelSecondary,
    fontSize: 13,
    fontWeight: '400',
  },
  mercyCountValue: {
    color: colors.indigo,
    fontWeight: '700',
  },

  optionsLabel: {
    paddingHorizontal: 2,
  },
  optionsSectionTitle: {
    color: colors.label,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  options: {
    gap: 10,
  },
  reasonOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...shadows.soft,
  },
  reasonSelected: {
    borderColor: '#C9D7F7',
    borderBottomColor: '#B9C8EF',
    backgroundColor: '#FBFCFF',
  },
  reasonPressed: { transform: [{ translateY: 3 }], borderBottomWidth: 1.5, marginBottom: 2.5 },
  reasonRadio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.borderStrong, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  reasonRadioSelected: { borderColor: colors.blue },
  reasonRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  reasonText: {
    color: colors.label,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  reasonTextSelected: {
    color: colors.blue,
    fontWeight: '600',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowText: {
    flex: 1,
    gap: 5,
  },
  rowLabel: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  rowCopy: {
    color: colors.label,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
});
