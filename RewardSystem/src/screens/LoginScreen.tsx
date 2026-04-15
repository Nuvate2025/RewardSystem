import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EyeToggle } from '../components/EyeToggle';
import { SixDigitInput } from '../components/SixDigitInput';
import type { RootStackScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';
import { figma } from '../theme/figmaTokens';
import { loginWithPin } from '../api/auth';
import { isApiError, userFacingApiMessage } from '../api/client';
import { getMyProfile } from '../api/users';
import { getSavedPhone, setAccessToken, setSavedPhone } from '../api/storage';
import { isProfileComplete } from '../auth/profileCompletion';
import { pickHomeRoute } from '../auth/roleRouting';

const LOGIN_COUNTRY_CODE = '+91';

export function LoginScreen({
  navigation,
}: RootStackScreenProps<'Login'>) {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [hidePin, setHidePin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { phone: saved } = await getSavedPhone();
        const digits = saved.replace(/\D/g, '').slice(0, 10);
        if (!cancelled && digits.length === 10) setPhone(digits);
      } catch {
        /* storage unavailable — user enters phone manually */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onEnter = async () => {
    const digits = phone.replace(/\D/g, '').slice(0, 10);
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (pin.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      const r = await loginWithPin({ phone: digits, pin });
      const token =
        r &&
        typeof r === 'object' &&
        'accessToken' in r &&
        typeof (r as { accessToken: unknown }).accessToken === 'string'
          ? (r as { accessToken: string }).accessToken
          : null;
      if (!token?.length) {
        setError('Login response was invalid. Check that the API is running.');
        return;
      }
      await setAccessToken(token);
      await setSavedPhone({ phone: digits, countryCode: LOGIN_COUNTRY_CODE });
      const pinSnap = {
        roles: r.roles,
        permissions: r.permissions,
      };
      try {
        const profile = await getMyProfile();
        if (!isProfileComplete(profile)) {
          navigation.navigate('ProfileSetup');
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: pickHomeRoute(pinSnap, profile) }],
          });
        }
      } catch (profileErr) {
        if (isApiError(profileErr) && profileErr.status === 401) {
          await setAccessToken(null);
          setError('Session expired. Please sign in again.');
          return;
        }
        // Offline / server error after successful PIN — route from login RBAC if present
        navigation.reset({
          index: 0,
          routes: [{ name: pickHomeRoute(pinSnap) }],
        });
      }
    } catch (e) {
      if (isApiError(e)) {
        if (e.status === 401) {
          setError('Invalid PIN.');
        } else if (e.status === 0) {
          setError(e.message);
        } else {
          setError(userFacingApiMessage(e.message));
        }
      } else {
        const msg = e instanceof Error ? e.message : String(e);
        setError(
          msg && msg !== '[object Object]'
            ? msg
            : 'Something went wrong. Try again.',
        );
      }
    } finally {
      setLoading(false);
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
          <Text style={styles.title}>Login In</Text>

          <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
          <View style={styles.phoneRow}>
            <View style={styles.country}>
              <Text style={styles.countryText}>+91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter 10 digit number"
              placeholderTextColor={colors.lightGray}
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={t => {
                setPhone(t.replace(/\D/g, '').slice(0, 10));
                if (error) setError(null);
              }}
              autoFocus
            />
          </View>

          <View style={styles.labelRow}>
            <Text style={styles.label}>ENTER 6-DIGIT PIN</Text>
            <EyeToggle onToggle={() => setHidePin(h => !h)} />
          </View>
          <SixDigitInput
            value={pin}
            onChange={setPin}
            secure={hidePin}
          />

          <View style={styles.forgotRow}>
            <Text style={styles.forgotMuted}>Forgot PIN? </Text>
            <Pressable onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.forgotLink}>Setup New Pin</Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            disabled={loading}
            onPress={onEnter}>
            <Text style={styles.ctaText}>{loading ? 'Entering...' : 'Enter'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: figma.textTitle,
    marginBottom: 28,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.labelGray,
    marginBottom: 10,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.white,
    marginBottom: 24,
  },
  country: {
    backgroundColor: colors.codeBg,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
  },
  countryText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.navy,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.navy,
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
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  forgotMuted: {
    fontSize: 14,
    color: colors.mutedGray,
  },
  forgotLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryOrange,
  },
  cta: {
    marginTop: 40,
    backgroundColor: colors.primaryOrange,
    borderRadius: figma.radiusLargeButton,
    paddingVertical: 16,
    alignItems: 'center',
    ...figma.shadowCta,
  },
  ctaPressed: { opacity: 0.92 },
  ctaText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  error: {
    marginTop: 18,
    fontSize: 13,
    color: '#D14343',
    textAlign: 'right',
  },
});
