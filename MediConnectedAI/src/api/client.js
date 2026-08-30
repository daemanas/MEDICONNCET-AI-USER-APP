import axios from 'axios';
import {API_BASE_URL, API_PREFIX, REQUEST_TIMEOUT_MS} from '../constants/config';
import {getAccessToken, getRefreshToken, persistTokens, clearSession} from '../auth/tokenStore';

export const http = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {'Content-Type': 'application/json'},
});

http.interceptors.request.use(async config => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = null;

http.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config || {};
    const status = error.response?.status;
    if (status === 401 && !original._retry) {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = refreshAccess();
        }
        const tokens = await refreshing;
        refreshing = null;
        if (tokens?.accessToken) {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return http(original);
        }
      } catch {
        refreshing = null;
        await clearSession();
      }
    }
    return Promise.reject(normalizeError(error));
  },
);

export async function refreshAccess() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error('NO_REFRESH');
  }
  const res = await axios.post(
    `${API_BASE_URL}${API_PREFIX}/auth/refresh`,
    {refreshToken},
    {timeout: REQUEST_TIMEOUT_MS, headers: {'Content-Type': 'application/json'}},
  );
  const {accessToken, refreshToken: nextRefresh} = res.data || {};
  if (accessToken) {
    await persistTokens({accessToken, refreshToken: nextRefresh || refreshToken});
  }
  return res.data;
}

export function normalizeError(error) {
  if (error?.isNormalized) {
    return error;
  }
  const status = error.response?.status;
  const data = error.response?.data;
  const message =
    data?.error?.message ||
    data?.message ||
    (error.code === 'ECONNABORTED' ? 'The request took too long. Please try again.' : null) ||
    (error.message === 'Network Error' ? 'No internet connection.' : null) ||
    'Something went wrong. Please try again.';
  const err = new Error(message);
  err.status = status;
  err.code = data?.error?.code || error.code;
  err.isNormalized = true;
  err.offline = !error.response;
  return err;
}

export function unwrap(promise) {
  return promise.then(res => res.data);
}
