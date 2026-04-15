import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  Pressable,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EyeToggle } from '../components/EyeToggle';
import { SixDigitInput } from '../components/SixDigitInput';
import type { RootStackScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';
import { setPin as apiSetPin } from '../api/auth';
import { isApiError, userFacingApiMessage } from '../api/client';
import { setAccessToken } from '../api/storage';
import { getMyProfile } from '../api/users';
import { isProfileComplete } from '../auth/profileCompletion';
import { pickHomeRoute } from '../auth/roleRouting';

export function SetPinScreen({
  route,
  navigation,
}: RootStackScreenProps<'SetPin'>) {
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [hidePin, setHidePin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onConfirm = async () => {
    if (pin.length !== 6 || confirm.length !== 6) return;
    if (pin !== confirm) {
      setError('PINs do not match.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const r = await apiSetPin({
        verificationToken: route.params.verificationToken,
        pin,
      });
      const token =
        r &&
        typeof r === 'object' &&
        'accessToken' in r &&
        typeof (r as { accessToken: unknown }).accessToken === 'string'
          ? (r as { accessToken: string }).accessToken
          : null;
      if (!token?.length) {
        setError('Could not create a session. Try again.');
        return;
      }
      await setAccessToken(token);
      const pinSnap = {
        roles: r.roles,
        permissions: r.permissions,
      };
      try {
        const profile = await getMyProfile();
        if (!isProfileComplete(profile)) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'ProfileSetup' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: pickHomeRoute(pinSnap, profile) }],
          });
        }
      } catch (profileErr) {
        if (isApiError(profileErr) && profileErr.status === 401) {
          await setAccessToken(null);
          setError('Session expired. Please verify your phone again.');
          return;
        }
        navigation.reset({
          index: 0,
          routes: [{ name: pickHomeRoute(pinSnap) }],
        });
      }
    } catch (e) {
      if (isApiError(e)) {
        if (e.status === 0) setError(e.message);
        else setError(userFacingApiMessage(e.message));
      } else {
        const msg = e instanceof Error ? e.message : String(e);
        setError(
          msg && msg !== '[object Object]'
            ? msg
            : 'Unable to set PIN. Please try again.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: 28 + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Set PIN</Text>

          <View style={styles.labelRow}>
            <Text style={styles.label}>NEW PIN</Text>
            <EyeToggle onToggle={() => setHidePin(h => !h)} />
          </View>
          <SixDigitInput
            value={pin}
            onChange={setPin}
            secure={hidePin}
            autoFocus
          />

          <Text style={[styles.label, styles.labelSp]}>CONFIRM PIN</Text>
          <SixDigitInput value={confirm} onChange={setConfirm} secure={hidePin} />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            disabled={saving}
            onPress={onConfirm}>
            <Text style={styles.ctaText}>
              {saving ? 'Confirming...' : 'Confirm Pin'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 32,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.labelGray,
  },
  labelSp: {
    marginTop: 28,
    marginBottom: 10,
  },
  cta: {
    marginTop: 40,
    backgroundColor: colors.white,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryOrange,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  ctaPressed: { opacity: 0.9 },
  ctaText: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: '700',
  },
  error: {
    marginTop: 14,
    fontSize: 13,
    color: '#D14343',
    textAlign: 'center',
  },
});
