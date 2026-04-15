import { isApiError } from '../api/client';
import { getAccessToken, getSavedPhone, setAccessToken } from '../api/storage';
import { getAuthMe, getMyProfile } from '../api/users';
import type { RootStackParamList } from '../navigation/types';
import { isProfileComplete } from './profileCompletion';
import { pickHomeRoute } from './roleRouting';

export type AuthInitialRoute = keyof Pick<
  RootStackParamList,
  'Main' | 'AdminMain' | 'ProfileSetup' | 'Login' | 'SignUp'
>;

function hasTenDigitPhone(phone: string): boolean {
  return phone.replace(/\D/g, '').length === 10;
}

async function meSnapshot() {
  try {
    return (await getAuthMe()).user;
  } catch {
    return null;
  }
}

/**
 * Decides first screen after splash: session + profile completeness + network.
 */
export async function resolveInitialRoute(): Promise<AuthInitialRoute> {
  const [token, { phone }] = await Promise.all([
    getAccessToken(),
    getSavedPhone(),
  ]);

  if (!token) {
    return hasTenDigitPhone(phone) ? 'Login' : 'SignUp';
  }

  try {
    const profile = await getMyProfile();
    const me = await meSnapshot();
    return isProfileComplete(profile)
      ? pickHomeRoute(profile, me ?? undefined)
      : 'ProfileSetup';
  } catch (e) {
    if (isApiError(e) && e.status === 401) {
      await setAccessToken(null);
      return hasTenDigitPhone(phone) ? 'Login' : 'SignUp';
    }
    try {
      const me = await meSnapshot();
      if (me) return pickHomeRoute(me);
    } catch {
      /* ignore */
    }
    return 'Main';
  }
}
