import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, shadows } from '@/src/constants/theme';

type FieldLabelProps = {
  title: string;
  caption?: string;
};

type OptionCardProps = {
  title: string;
  description?: string;
  meta?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
};

type IntakeInputProps = {
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
};

export function FieldLabel({ title, caption }: FieldLabelProps) {
  return (
    <View style={styles.labelWrap}>
      <Text style={styles.label}>{title}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

export function OptionCard({ title, description, meta, selected, disabled, onPress, icon }: OptionCardProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.option, selected && styles.optionSelected, disabled && styles.optionDisabled]}
    >
      <View style={styles.optionHeader}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <View style={styles.optionCopy}>
          <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{title}</Text>
          {description ? <Text style={[styles.description, selected && styles.descriptionSelected]}>{description}</Text> : null}
        </View>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected ? <View style={styles.radioDot} /> : null}
        </View>
      </View>
      {meta ? <Text style={[styles.meta, selected && styles.metaSelected]}>{meta}</Text> : null}
    </Pressable>
  );
}

export function IntakeInput({ value, placeholder, onChangeText }: IntakeInputProps) {
  return (
    <TextInput
      value={value}
      placeholder={placeholder}
      placeholderTextColor="rgba(255, 242, 210, 0.48)"
      onChangeText={onChangeText}
      autoCapitalize="words"
      returnKeyType="done"
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  labelWrap: {
    gap: 3,
  },
  label: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  caption: {
    color: colors.parchment,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 242, 210, 0.24)',
    backgroundColor: 'rgba(24, 11, 8, 0.42)',
    color: colors.cream,
    fontSize: 16,
    fontWeight: '800',
  },
  option: {
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 242, 210, 0.18)',
    backgroundColor: 'rgba(255, 242, 210, 0.08)',
    ...shadows.soft,
  },
  optionSelected: {
    borderColor: colors.deepGold,
    backgroundColor: 'rgba(255, 200, 61, 0.94)',
  },
  optionDisabled: {
    opacity: 0.58,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24, 11, 8, 0.26)',
  },
  optionCopy: {
    flex: 1,
    gap: 3,
  },
  optionTitle: {
    color: colors.cream,
    fontSize: 15,
    fontWeight: '900',
  },
  optionTitleSelected: {
    color: colors.ink,
  },
  description: {
    color: colors.parchment,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  descriptionSelected: {
    color: colors.ink,
    opacity: 0.82,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: 'rgba(255, 242, 210, 0.36)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.ink,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  meta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 242, 210, 0.12)',
    color: colors.cream,
    fontSize: 11,
    fontWeight: '900',
  },
  metaSelected: {
    backgroundColor: 'rgba(24, 11, 8, 0.14)',
    color: colors.ink,
  },
});
