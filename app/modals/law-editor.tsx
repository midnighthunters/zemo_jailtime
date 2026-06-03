import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';

export default function LawEditorModal() {
  const router = useRouter();
  return (
    <CourtBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <CourtCard variant="dark">
          <View style={styles.hero}>
            <AssetImage assetKey="ASSET_LAW_BOOK_LIBRARY" width={138} height={138} />
            <View style={styles.text}>
              <StampBadge label="Custom Law" tone="purple" />
              <Text style={styles.title}>Custom Law Charter</Text>
              <Text style={styles.copy}>Custom law names require higher court authority. The editor shell is ready for the next build.</Text>
            </View>
          </View>
        </CourtCard>
        <CourtButton title="Upgrade to Edit" variant="gold" onPress={() => router.replace('/modals/paywall')} />
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
});
