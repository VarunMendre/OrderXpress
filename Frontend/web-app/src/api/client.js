const PRODUCTION_BASE_URL = 'https://orderxpress-1.onrender.com';
const API_BASE_URL = `${PRODUCTION_BASE_URL}/api/v1`;

const SESSION_TOKEN_KEY = 'orderxpress.customer.sessionToken';

let sessionToken = null;
let unauthorizedHandler = null;

export function getSessionToken() {
  return sessionToken;
}

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

export function restoreSessionToken() {
  sessionToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
  return sessionToken;
}

export function clearSessionToken() {
  sessionToken = null;
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'ApiError';
    this.code = code || 'REQUEST_FAILED';
    this.status = status || 0;
  }
}

async function request(path, { method = 'GET', body, params, auth = 'customer' } = {}) {
  let url = API_BASE_URL + path;
  if (params) {
    const qs = Object.keys(params)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&');
    if (qs) url += `?${qs}`;
  }

  const headers = { Accept: 'application/json' };
  if (auth === 'customer' && sessionToken) {
    headers['x-session-token'] = sessionToken;
  }
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

  let json = null;
  try {
    json = await res.json();
  } catch {
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

export const customerApi = {
  scanSession: (payload) => request('/customer/session/scan', { method: 'POST', body: payload }),
  getMenu: () => request('/customer/menu'),
  getCart: () => request('/customer/cart'),
  addCartItem: (item) => request('/customer/cart/items', { method: 'POST', body: item }),
  clearCart: () => request('/customer/cart/clear', { method: 'POST' }),
  checkout: (payload) => request('/orders/checkout', { method: 'POST', body: payload }),
};

export const paymentApi = {
  createRazorpayOrder: (payload) => request('/payments/razorpay/order', { method: 'POST', body: payload, auth: 'admin' }),
  verifyRazorpayPayment: (payload) => request('/payments/razorpay/verify', { method: 'POST', body: payload }),
};

export const orderApi = {
  getOrder: (orderId) => request(`/orders/${orderId}`),
};