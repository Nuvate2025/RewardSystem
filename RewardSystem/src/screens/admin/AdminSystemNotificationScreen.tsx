import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TxTicketOrange } from '../../assets/svgs';
import { adminUi } from '../../theme/adminUi';
import { AdminHeader } from './components/AdminHeader';

export function AdminSystemNotificationScreen() {
  const insets = useSafeAreaInsets();
  const [highValue, setHighValue] = useState(true);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <AdminHeader title="System Notification" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 32 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.hero}>Alert Protocols</Text>
        <Text style={styles.sub}>
          Configure high-priority system signals that require immediate
          administrative oversight.
        </Text>
        <Text style={styles.section}>System Alerts</Text>
        <View style={[styles.row, adminUi.shadowCard]}>
          <View style={styles.iconWrap}>
            <TxTicketOrange width={26} height={26} />
          </View>
          <View style={styles.mid}>
            <Text style={styles.rowTitle}>High-Value Redemptions</Text>
            <Text style={styles.rowSub}>Immediate SMS & Email</Text>
          </View>
          <Switch
            value={highValue}
            onValueChange={setHighValue}
            trackColor={{ false: '#E5E7EB', true: '#FDBA74' }}
            thumbColor={highValue ? adminUi.accentOrange : '#f4f3f4'}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: adminUi.screenBg },
  scroll: { paddingHorizontal: 20, paddingTop: 4 },
  hero: {
    fontSize: 24,
    fontWeight: '800',
    color: adminUi.sectionTitle,
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: adminUi.labelMuted,
    lineHeight: 20,
    marginBottom: 20,
  },
  section: {
    fontSize: 13,
    fontWeight: '800',
    color: adminUi.labelMuted,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: adminUi.radiusLg,
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: adminUi.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mid: { flex: 1 },
  rowTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: adminUi.sectionTitle,
  },
  rowSub: {
    fontSize: 13,
    color: adminUi.labelMuted,
    marginTop: 2,
  },
});
