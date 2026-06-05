import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';
import { usePremiumStore } from '@/src/store/usePremiumStore';

const customLawId = 'custom-law-charter';

function NumberStepper({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <View style={styles.stepper}>
      <View style={styles.stepperCopy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value} min</Text>
      </View>
      <View style={styles.stepperButtons}>
        <Pressable style={styles.roundButton} onPress={() => onChange(Math.max(min, value - step))}>
          <Text style={styles.roundButtonText}>-</Text>
        </Pressable>
        <Pressable style={styles.roundButton} onPress={() => onChange(Math.min(max, value + step))}>
          <Text style={styles.roundButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function LawEditorModal() {
  const router = useRouter();
  const isPro = usePremiumStore((state) => state.isPro);
  const law = useCourtStore((state) => state.laws.find((item) => item.id === customLawId));
  const updateLaw = useCourtStore((state) => state.updateLaw);
  const toggleLaw = useCourtStore((state) => state.toggleLaw);
  const [name, setName] = useState(law?.name ?? 'Custom Law Charter');
  const [description, setDescription] = useState(law?.description ?? 'Create your own fake law with real limits.');
  const [dailyLimitMinutes, setDailyLimitMinutes] = useState(law?.dailyLimitMinutes ?? 30);
  const [firstPunishmentMinutes, setFirstPunishmentMinutes] = useState(law?.firstPunishmentMinutes ?? 8);

  const save = () => {
    const result = updateLaw(
      customLawId,
      {
        name: name.trim() || 'Custom Law Charter',
        shortName: name.trim().slice(0, 18) || 'Custom Charter',
        description: description.trim() || 'Create your own fake law with real limits.',
        dailyLimitMinutes,
        firstPunishmentMinutes,
        maxSentenceMinutes: Math.max(firstPunishmentMinutes * 3, law?.maxSentenceMinutes ?? 45),
      },
      isPro,
    );
    if (!result.allowed) router.replace('/modals/paywall');
    else router.back();
  };

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <CourtCard variant="dark">
          <View style={styles.hero}>
            <AssetImage assetKey="ASSET_LAW_BOOK_LIBRARY" width={118} height={118} />
            <View style={styles.text}>
              <StampBadge label="Custom Law" tone={isPro ? 'success' : 'purple'} />
              <Text style={styles.title}>Custom Law Charter</Text>
              <Text style={styles.copy}>Name a law, set the daily limit, and decide the first sentence.</Text>
            </View>
          </View>
        </CourtCard>

        <CourtCard variant="wood" delay={80}>
          <View style={styles.form}>
            <Text style={styles.label}>Law name</Text>
            <TextInput value={name} onChangeText={setName} editable={isPro} placeholder="Custom Law Charter" placeholderTextColor={colors.muted} style={styles.input} />
            <Text style={styles.label}>Court description</Text>
            <TextInput value={description} onChangeText={setDescription} editable={isPro} multiline placeholder="What should this law protect?" placeholderTextColor={colors.muted} style={[styles.input, styles.textArea]} />
            <NumberStepper label="Daily limit" value={dailyLimitMinutes} min={5} max={180} step={5} onChange={setDailyLimitMinutes} />
            <NumberStepper label="First sentence" value={firstPunishmentMinutes} min={3} max={60} step={3} onChange={setFirstPunishmentMinutes} />
          </View>
        </CourtCard>

        {isPro ? (
          <View style={styles.actions}>
            <CourtButton title={law?.isEnabled ? 'Disable Law' : 'Enable Law'} variant="ghost" onPress={() => toggleLaw(customLawId, isPro)} />
            <CourtButton title="Save Law" variant="gold" onPress={save} />
          </View>
        ) : (
          <CourtButton title="Upgrade to Edit" variant="gold" onPress={() => router.replace('/modals/paywall')} />
        )}
        <CourtButton title="Close" variant="ghost" onPress={() => router.back()} />
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
  text: {
    flex: 1,
    gap: 8,
  },
  title: {
    color: colors.cream,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900',
  },
  copy: {
    color: colors.parchment,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  form: {
    gap: 10,
  },
  label: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  input: {
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 242, 210, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 242, 210, 0.18)',
    color: colors.cream,
    fontSize: 14,
    fontWeight: '800',
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  stepper: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  stepperCopy: {
    flex: 1,
    gap: 3,
  },
  value: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: '900',
  },
  stepperButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roundButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
  },
  roundButtonText: {
    color: colors.ink,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '900',
  },
  actions: {
    gap: 10,
  },
});
