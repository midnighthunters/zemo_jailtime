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
      placeholderTextColor={colors.labelTertiary}
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
    color: colors.blue,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.45,
    textTransform: 'uppercase',
  },
  caption: {
    color: colors.labelSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  input: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceMuted,
    color: colors.label,
    fontSize: 16,
    fontWeight: '600',
  },
  option: {
    gap: 8,
    padding: 14,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderColor: colors.border,
    borderBottomColor: colors.depthEdge,
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  optionSelected: {
    borderColor: '#BFCFF4',
    borderBottomColor: '#BFCFF4',
    backgroundColor: colors.blueLight,
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
    backgroundColor: colors.surfaceMuted,
  },
  optionCopy: {
    flex: 1,
    gap: 3,
  },
  optionTitle: {
    color: colors.label,
    fontSize: 15,
    fontWeight: '700',
  },
  optionTitleSelected: {
    color: colors.blueDark,
  },
  description: {
    color: colors.labelSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  descriptionSelected: {
    color: colors.labelSecondary,
    opacity: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.blue,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.blue,
  },
  meta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    color: colors.labelSecondary,
    fontSize: 11,
    fontWeight: '900',
  },
  metaSelected: {
    backgroundColor: colors.surface,
    color: colors.blueDark,
  },
});
