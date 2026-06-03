import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';

const reasons = ['Work emergency', 'Family emergency', 'Navigation/payment need', 'Other'];

export default function EmergencyBypassModal() {
  const router = useRouter();
  const [selected, setSelected] = useState(reasons[0]);
  const requestMercy = useCourtStore((state) => state.requestMercy);
  const mercyPasses = useCourtStore((state) => state.profile.mercyPasses);

  return (
    <CourtBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <CourtCard variant="dark">
          <View style={styles.hero}>
            <AssetImage assetKey="ASSET_EMERGENCY_BYPASS_KEY" width={132} height={132} />
            <View style={styles.heroText}>
              <StampBadge label="Emergency Bypass" tone="gold" />
              <Text style={styles.title}>The court allows emergencies, not excuses.</Text>
              <Text style={styles.copy}>Mercy passes left: {mercyPasses}</Text>
            </View>
          </View>
        </CourtCard>

        <View style={styles.options}>
          {reasons.map((reason) => (
            <Pressable key={reason} onPress={() => setSelected(reason)} style={[styles.reason, selected === reason && styles.selected]}>
              <Text style={[styles.reasonText, selected === reason && styles.selectedText]}>{reason}</Text>
            </Pressable>
          ))}
        </View>

        <CourtCard variant="wood">
          <View style={styles.row}>
            <AssetImage assetKey="ASSET_ATTORNEY_CROC_EVIDENCE" width={98} height={98} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Attorney Croc</Text>
              <Text style={styles.rowCopy}>We request mercy under the Emergency Clause. Reason: {selected}.</Text>
            </View>
            <AssetImage assetKey="ASSET_MERCY_PASS_TICKET" width={78} height={78} />
          </View>
        </CourtCard>

        <CourtButton
          title="Use Mercy Pass"
          variant="danger"
          onPress={() => {
            const granted = requestMercy();
            router.replace(granted ? '/modals/parole-granted' : '/modals/paywall');
          }}
        />
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 28,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroText: {
    flex: 1,
    gap: 8,
  },
  title: {
    color: colors.cream,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
  },
  copy: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '900',
  },
  options: {
    gap: 10,
  },
  reason: {
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 242, 210, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 242, 210, 0.16)',
  },
  selected: {
    backgroundColor: colors.gold,
    borderColor: colors.deepGold,
  },
  reasonText: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: '900',
  },
  selectedText: {
    color: colors.ink,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  rowCopy: {
    color: colors.cream,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
});
