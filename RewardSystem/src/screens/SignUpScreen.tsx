import React, { useCallback, useEffect, useState } from 'react';
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
import { SixDigitInput } from '../components/SixDigitInput';
import type { RootStackScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';
import { requestOtp, verifyOtp } from '../api/auth';
import { isApiError, userFacingApiMessage } from '../api/client';
import { setSavedPhone } from '../api/storage';

const RESEND_SECONDS = 30;

export function SignUpScreen({
  navigation,
}: RootStackScreenProps<'SignUp'>) {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSignup, setAutoSignup] = useState(false);
  const countryCode = '+91';

  const onSignUp = useCallback(async () => {
    if (phone.length !== 10 || otp.length !== 6) return;
    setVerifying(true);
    setError(null);
    try {
      const r = await verifyOtp({ phone, countryCode, code: otp });
      await setSavedPhone({ phone, countryCode });
      navigation.navigate('SetPin', {
        verificationToken: r.verificationToken,
        phone,
        countryCode,
      });
    } catch (e) {
      if (isApiError(e) && e.status === 0) {
        setError(e.message);
      } else if (isApiError(e)) {
        setError(userFacingApiMessage(e.message));
      } else {
        setError('Invalid verification code.');
      }
    } finally {
      setVerifying(false);
    }
  }, [countryCode, navigation, otp, phone]);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft(s => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Auto-request OTP once phone is complete (Figma shows resend countdown immediately)
    if (phone.length !== 10) return;
    (async () => {
      setSending(true);
      setError(null);
      try {
        const r = await requestOtp({ phone, countryCode });
        setSecondsLeft(RESEND_SECONDS);
        if (r.devCode) {
          setOtp(String(r.devCode));
          setAutoSignup(true);
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'Unable to send OTP. Please try again.',
        );
      } finally {
        setSending(false);
      }
    })();
  }, [phone]);

  useEffect(() => {
    if (!autoSignup) return;
    if (verifying) return;
    if (phone.length !== 10 || otp.length !== 6) return;
    setAutoSignup(false);
    (async () => onSignUp())();
  }, [autoSignup, onSignUp, otp, phone, verifying]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, '0')}`;
  };

  const onResend = async () => {
    if (phone.length !== 10) return;
    setSending(true);
    setError(null);
    try {
      const r = await requestOtp({ phone, countryCode });
      setSecondsLeft(RESEND_SECONDS);
      if (r.devCode) {
        setOtp(String(r.devCode));
        setAutoSignup(true);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to resend OTP. Please try again.',
      );
    } finally {
      setSending(false);
    }
  };

  // `onSignUp` is defined via useCallback above.

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
          <Text style={styles.welcomeGrey}>Welcome to</Text>
          <Text style={styles.bestBonds}>Best Bonds</Text>
          <Text style={styles.sub}>
            Verify and Sign In to assess your rewards.
          </Text>

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
              onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))}
            />
          </View>

          <View style={styles.otpHeader}>
            <Text style={styles.fieldLabel}>VERIFICATION CODE</Text>
            {secondsLeft > 0 ? (
              <Text style={styles.resend}>Resend OTP in {fmt(secondsLeft)}</Text>
            ) : (
              <Pressable onPress={onResend} disabled={sending}>
                <Text style={styles.resendActive}>Resend OTP</Text>
              </Pressable>
            )}
          </View>
          <SixDigitInput value={otp} onChange={setOtp} />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [
              styles.cta,
              pressed && styles.ctaPressed,
            ]}
            disabled={sending || verifying}
            onPress={onSignUp}>
            <Text style={styles.ctaText}>
              {verifying ? 'Signing Up...' : 'Sign Up'}
            </Text>
          </Pressable>

          <Text style={styles.legal}>
            By logging in, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text>
            {' and '}
            <Text style={styles.link}>Privacy Policy</Text>.
          </Text>

          <View style={styles.loginRow}>
            <Text style={styles.loginMuted}>Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
              <Text style={styles.loginLink}>Log in</Text>
            </Pressable>
          </View>
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
    paddingTop: 20,
  },
  welcomeGrey: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.lightGray,
  },
  bestBonds: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.navyAlt,
    marginTop: 4,
  },
  sub: {
    fontSize: 15,
    color: colors.mutedGray,
    marginTop: 12,
    marginBottom: 28,
    lineHeight: 22,
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
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  resend: {
    fontSize: 12,
    color: colors.mutedGray,
    marginBottom: 2,
  },
  resendActive: {
    fontSize: 12,
    color: colors.primaryOrange,
    fontWeight: '600',
    marginBottom: 2,
  },
  cta: {
    marginTop: 36,
    backgroundColor: colors.primaryOrange,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryOrange,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  ctaPressed: { opacity: 0.92 },
  ctaText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  legal: {
    marginTop: 24,
    fontSize: 12,
    color: colors.mutedGray,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: colors.termsOrange,
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  loginMuted: {
    fontSize: 14,
    color: colors.mutedGray,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryOrange,
  },
  error: {
    marginTop: 10,
    fontSize: 13,
    color: '#D14343',
    textAlign: 'center',
  },
});
