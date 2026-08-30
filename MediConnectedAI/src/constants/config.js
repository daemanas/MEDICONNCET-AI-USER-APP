import {Platform} from 'react-native';
import Config from 'react-native-config';

function readBaseUrl() {
  const fromEnv = (Config?.API_BASE_URL || '').trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (__DEV__) {
    return Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://127.0.0.1:5000';
  }
  return '';
}

export const API_BASE_URL = readBaseUrl();
export const API_PREFIX = '/api/mobile';
export const REQUEST_TIMEOUT_MS = 20000;
export const SEARCH_DEBOUNCE_MS = 400;
export const SYNC_PAGE_LIMIT = 400;
