import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/v1`;

const TOKEN_STORAGE_KEY = 'auth_token';

let authToken = null;
let unauthorizedHandler = null;

// Call this once on app boot (e.g. in AuthContext) to restore any saved
// token before the first request goes out.
export async function restoreSessionCookie() {
  try {
    const stored = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) authToken = stored;
  } catch {
    // ignore — will just start unauthenticated
  }
}

// Call this right after a successful login/register response, passing
// data.tokens.bearer from the response body.
export async function setAuthToken(token) {
  authToken = token;
  try {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // ignore — token still works for this session, just won't persist
  }
}

// Call this on logout.
export async function clearSessionCookie() {
  authToken = null;
  try {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

// Lets other modules (e.g. AuthContext) register a callback that runs
// whenever a request comes back 401, so the app can redirect to Login.
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
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
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  if (body) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection.', 'NETWORK_ERROR', 0);
  }

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