import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors, radius } from '@/src/constants/theme';

function TabGlyph({ label, focused }: { label: string; focused: boolean }) {
  return <Text style={{ color: focused ? colors.gold : colors.muted, fontWeight: '900', fontSize: 15 }}>{label}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '900' },
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 12,
          height: 68,
          borderRadius: radius.xl,
          borderTopWidth: 0,
          backgroundColor: 'rgba(42, 18, 12, 0.96)',
          borderWidth: 1,
          borderColor: 'rgba(255, 200, 61, 0.18)',
        },
      }}
    >
      <Tabs.Screen name="courtroom" options={{ title: 'Court', tabBarIcon: ({ focused }) => <TabGlyph label="C" focused={focused} /> }} />
      <Tabs.Screen name="laws" options={{ title: 'Laws', tabBarIcon: ({ focused }) => <TabGlyph label="L" focused={focused} /> }} />
      <Tabs.Screen name="jail" options={{ title: 'Jail', tabBarIcon: ({ focused }) => <TabGlyph label="J" focused={focused} /> }} />
      <Tabs.Screen name="evidence" options={{ title: 'Evidence', tabBarIcon: ({ focused }) => <TabGlyph label="E" focused={focused} /> }} />
      <Tabs.Screen name="parole" options={{ title: 'Parole', tabBarIcon: ({ focused }) => <TabGlyph label="P" focused={focused} /> }} />
    </Tabs>
  );
}
