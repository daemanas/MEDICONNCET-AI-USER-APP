import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVICE = 'ai.mediconnected.user.session';
const PROFILE_KEY = 'mc.profile';

let memory = {accessToken: null, refreshToken: null};

export async function persistTokens({accessToken, refreshToken}) {
  memory.accessToken = accessToken || null;
  memory.refreshToken = refreshToken || memory.refreshToken;
  if (memory.accessToken) {
    await Keychain.setGenericPassword('session', JSON.stringify(memory), {
      service: SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }
}

export async function loadTokens() {
  try {
    const creds = await Keychain.getGenericPassword({service: SERVICE});
    if (creds?.password) {
      memory = JSON.parse(creds.password);
    }
  } catch {
    memory = {accessToken: null, refreshToken: null};
  }
  return memory;
}

export async function getAccessToken() {
  if (!memory.accessToken) {
    await loadTokens();
  }
  return memory.accessToken;
}

export async function getRefreshToken() {
  if (!memory.refreshToken) {
    await loadTokens();
  }
  return memory.refreshToken;
}

export async function persistProfile(profile) {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadProfile() {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearSession() {
  memory = {accessToken: null, refreshToken: null};
  await Keychain.resetGenericPassword({service: SERVICE});
  await AsyncStorage.removeItem(PROFILE_KEY);
}
