import { Text, type TextStyle, type StyleProp } from 'react-native';

type AnimatedNumberProps = {
  value: number;
  suffix?: string;
  style?: StyleProp<TextStyle>;
};

export function AnimatedNumber({ value, suffix = '', style }: AnimatedNumberProps) {
  return <Text style={style}>{Math.round(value).toLocaleString()}{suffix}</Text>;
}
