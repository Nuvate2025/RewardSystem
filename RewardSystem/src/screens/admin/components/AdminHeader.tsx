import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackArrowLeft } from '../../../assets/svgs';
import { adminUi } from '../../../theme/adminUi';

type Props = {
  title: string;
  onBack?: () => void;
};

export function AdminHeader({ title, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.wrap, { paddingTop: Math.max(insets.top, 12) }]}>
      <Pressable
        hitSlop={12}
        onPress={() => (onBack ? onBack() : navigation.goBack())}
        style={styles.back}
        accessibilityRole="button"
        accessibilityLabel="Go back">
        <BackArrowLeft width={22} height={22} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.backSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: adminUi.screenBg,
  },
  back: { paddingVertical: 4 },
  title: {
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    color: adminUi.sectionTitle,
    textAlign: 'center',
  },
  backSpacer: { width: 22 },
});
