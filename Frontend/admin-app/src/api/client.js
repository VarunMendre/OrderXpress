import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COOKIE_STORAGE_KEY = 'orderxpress.session.cookie';
const API_PORT = 4000;

let sessionCookie = null;
let unauthorizedHandler = null;

export function getSessionCookie() {
  return sessionCookie;
}

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

export async function restoreSessionCookie() {
  sessionCookie = await AsyncStorage.getItem(COOKIE_STORAGE_KEY);
  return sessionCookie;
}

export async function clearSessionCookie() {
  sessionCookie = null;
  await AsyncStorage.removeItem(COOKIE_STORAGE_KEY);
}

function resolveHost() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost;
  if (hostUri) return hostUri.split(':')[0];
  return 'localhost';
}

export const API_BASE_URL = `http://${resolveHost()}:${API_PORT}/api/v1`;

async function captureSessionCookie(res) {
  try {
    const setCookie = res.headers.get('set-cookie');
    if (!setCookie) return;
    const match = setCookie.match(/session=([^;]+)/);
    if (match) {
      sessionCookie = match[1];
      await AsyncStorage.setItem(COOKIE_STORAGE_KEY, sessionCookie);
    }
  } catch {
    // Some platforms do not expose set-cookie; the JS-side cookie jar is only a
    // fallback — the native session (iOS) still works there.
  }
}

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'ApiError';
    this.code = code || 'REQUEST_FAILED';
    this.status = status || 0;
  }
}

export async function api(path, { method = 'GET', body, params } = {}) {
  let url = API_BASE_URL + path;
  if (params) {
    const qs = Object.keys(params)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&');
    if (qs) url += `?${qs}`;
  }

  const headers = { Accept: 'application/json' };
  if (sessionCookie) headers.Cookie = `session=${sessionCookie}`;
  if (body) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      credentials: 'omit',
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection.', 'NETWORK_ERROR', 0);
  }

  await captureSessionCookie(res);

  let json = null;
  try {
    json = await res.json();
  } catch {
    // non-JSON body — handled below
  }

  if (!res.ok) {
    const message = json?.error?.message || `Request failed (${res.status})`;
    const code = json?.error?.code || `HTTP_${res.status}`;
    if (res.status === 401 && unauthorizedHandler) unauthorizedHandler();
    throw new ApiError(message, code, res.status);
  }

  if (!json || json.success !== true) {
    throw new ApiError('Unexpected server response.', 'BAD_RESPONSE', res.status);
  }

  return json.data;
}