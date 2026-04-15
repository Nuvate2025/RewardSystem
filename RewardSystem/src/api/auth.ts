import { apiPost } from './client';

/**
 * Mobile onboarding & PIN auth (see Figma Onboarding & Authentication).
 *
 * | Step | Screen / action      | Endpoint              | Body |
 * |------|----------------------|-----------------------|------|
 * | 1    | Sign up — send OTP   | POST /auth/otp/request | `{ phone, countryCode }` (10-digit national + e.g. "+91") |
 * | 2    | Sign up — verify OTP | POST /auth/otp/verify  | `{ phone, countryCode, code }` (6-digit OTP, not "pin") |
 * | 3    | Set PIN              | POST /auth/pin/set     | `{ verificationToken, pin }` → **accessToken** (JWT) |
 * | 4    | Login (return visits)| POST /auth/pin/login   | `{ phone, pin }` (10 digits; server uses +91 + phone) → **accessToken** |
 *
 * After step 3, the app uses the JWT from **setPin** and loads profile (`GET /users/me/profile`);
 * calling **pin/login** again right away is optional and only needed when signing in later.
 *
 * Web/admin flows use `POST /auth/register` and `POST /auth/login` (email + password) — not used in this app.
 */

export type RequestOtpResponse = {
  requestId: string;
  otpSent: boolean;
  devCode?: string;
};

export type VerifyOtpResponse = {
  verificationToken: string;
};

export type SetPinResponse = {
  accessToken: string;
  roles?: string[];
  permissions?: string[];
};

export type PinLoginResponse = {
  accessToken: string;
  roles?: string[];
  permissions?: string[];
};

export async function requestOtp(params: { phone: string; countryCode: string }) {
  return apiPost<RequestOtpResponse>('/auth/otp/request', params);
}

export async function verifyOtp(params: { phone: string; countryCode: string; code: string }) {
  return apiPost<VerifyOtpResponse>('/auth/otp/verify', params);
}

export async function setPin(params: { verificationToken: string; pin: string }) {
  return apiPost<SetPinResponse>('/auth/pin/set', params);
}

export async function loginWithPin(params: { phone: string; pin: string }) {
  return apiPost<PinLoginResponse>('/auth/pin/login', params);
}

