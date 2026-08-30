import {authApi} from '../api/authApi';
import {userApi} from '../api/userApi';
import {clearLocalUserData} from '../database/database';
import {
  clearSession,
  loadProfile,
  loadTokens,
  persistProfile,
  persistTokens,
} from './tokenStore';

export async function bootstrapSession() {
  const tokens = await loadTokens();
  if (!tokens.accessToken) {
    return {ok: false, profile: null};
  }
  try {
    const profile = await userApi.me();
    await persistProfile(profile);
    return {ok: true, profile};
  } catch (err) {
    if (err.status === 401) {
      await logoutLocal();
      return {ok: false, profile: null};
    }
    const cached = await loadProfile();
    if (cached) {
      return {ok: true, profile: cached, fromCache: true};
    }
    return {ok: false, profile: null};
  }
}

export async function requestOtp(phone) {
  return authApi.requestOtp(phone);
}

export async function verifyOtp({phone, code, name}) {
  const data = await authApi.verifyOtp({phone, code, name});
  await persistTokens({accessToken: data.accessToken, refreshToken: data.refreshToken});
  const profile = {user: data.user, patient: data.patient};
  await persistProfile(profile);
  return profile;
}

export async function logout() {
  try {
    await authApi.logout();
  } catch {
    /* still clear local */
  }
  await logoutLocal();
}

export async function logoutLocal() {
  await clearSession();
  await clearLocalUserData();
}

export async function saveProfile(body) {
  const profile = await userApi.patchMe(body);
  await persistProfile(profile);
  return profile;
}

export async function saveLocation(body) {
  const profile = await userApi.patchLocation(body);
  await persistProfile(profile);
  return profile;
}
