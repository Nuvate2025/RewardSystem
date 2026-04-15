import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { adminUi } from '../../theme/adminUi';
import { AdminHeader } from './components/AdminHeader';

export function AdminSecurityScreen() {
  const insets = useSafeAreaInsets();
  const [quickPin, setQuickPin] = useState(true);
  const [cur, setCur] = useState('');
  const [nw, setNw] = useState('');
  const [cf, setCf] = useState('');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <AdminHeader title="Security & Preferences" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 32 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={[styles.card, adminUi.shadowCard]}>
          <Text style={styles.h1}>Authentication</Text>
          <Text style={styles.desc}>
            Update your access credentials regularly to maintain site-wide
            integrity. We recommend complex phrases.
          </Text>
          <Text style={styles.lbl}>CURRENT PASSWORD</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={cur}
            onChangeText={setCur}
            placeholder="••••••••"
            placeholderTextColor={adminUi.mutedGray}
          />
          <Text style={[styles.lbl, styles.gap]}>NEW PASSWORD</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={nw}
            onChangeText={setNw}
            placeholder="••••••••"
            placeholderTextColor={adminUi.mutedGray}
          />
          <Text style={[styles.lbl, styles.gap]}>CONFIRM NEW PASSWORD</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={cf}
            onChangeText={setCf}
            placeholder="••••••••"
            placeholderTextColor={adminUi.mutedGray}
          />
          <Pressable style={({ pressed }) => [styles.updatePw, pressed && { opacity: 0.92 }]}>
            <Text style={styles.updatePwTxt}>Update Password</Text>
          </Pressable>
        </View>

        <Text style={styles.h1}>Efficiency</Text>
        <Text style={styles.desc}>
          Streamline your workflow with biometric-ready authentication
          shortcuts.
        </Text>
        <View style={[styles.toggleCard, adminUi.shadowCard]}>
          <View style={styles.toggleMid}>
            <Text style={styles.toggleTitle}>Quick Login PIN</Text>
            <Text style={styles.toggleSub}>
              Use a 4-digit PIN instead of a password
            </Text>
          </View>
          <Switch
            value={quickPin}
            onValueChange={setQuickPin}
            trackColor={{ false: '#E5E7EB', true: '#FDBA74' }}
            thumbColor={quickPin ? adminUi.accentOrange : '#f4f3f4'}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: adminUi.screenBg },
  scroll: { paddingHorizontal: 20, paddingTop: 4 },
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: adminUi.radiusLg,
    padding: 18,
    marginBottom: 24,
  },
  h1: {
    fontSize: 20,
    fontWeight: '800',
    color: adminUi.sectionTitle,
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: adminUi.labelMuted,
    lineHeight: 20,
    marginBottom: 18,
  },
  lbl: {
    fontSize: 12,
    fontWeight: '800',
    color: adminUi.navyAlt,
    letterSpacing: 0.4,
  },
  gap: { marginTop: 14 },
  input: {
    marginTop: 8,
    backgroundColor: adminUi.white,
    borderRadius: adminUi.radiusPill,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: adminUi.sectionTitle,
  },
  updatePw: {
    marginTop: 18,
    backgroundColor: adminUi.white,
    borderRadius: adminUi.radiusPill,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    alignItems: 'center',
  },
  updatePwTxt: {
    fontSize: 16,
    fontWeight: '800',
    color: adminUi.accentOrange,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: adminUi.radiusLg,
    padding: 16,
    marginTop: 8,
  },
  toggleMid: { flex: 1, paddingRight: 12 },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: adminUi.navyAlt,
  },
  toggleSub: {
    fontSize: 13,
    color: adminUi.labelMuted,
    marginTop: 4,
    lineHeight: 18,
  },
});
