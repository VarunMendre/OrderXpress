import { api } from './client';

export const tableApi = {
  generate: (tableCount) => api('/tables/generate', { method: 'POST', body: { tableCount } }),
  list: () => api('/tables'),
  getQR: (tableId) => api(`/tables/${tableId}/qr`, { method: 'POST' }),
};

export const menuApi = {
  list: (params = {}) => api('/menu-items', { params }),
  create: (payload) => api('/menu-items', { method: 'POST', body: payload }),
  update: (itemId, payload) => api(`/menu-items/${itemId}`, { method: 'PATCH', body: payload }),
  delete: (itemId) => api(`/menu-items/${itemId}`, { method: 'DELETE' }),
  uploadImage: (payload) => api('/menu-images', { method: 'POST', body: payload }),
  getExtraction: (imageId) => api(`/menu-images/${imageId}/extraction`),
  reviewExtraction: (imageId, detectedItems) => api(`/menu-images/${imageId}/review`, { method: 'POST', body: { detectedItems } }),
};

export const orderApi = {
  list: (params = {}) => api('/orders', { params }),
  get: (orderId) => api(`/orders/${orderId}`),
  updateStatus: (orderId, action) => api(`/orders/${orderId}/status`, { method: 'PATCH', body: { action } }),
  markCashPaid: (orderId) => api(`/payments/cash/${orderId}/mark-paid`, { method: 'POST' }),
};

export const paymentApi = {
  createRazorpayOrder: (payload) => api('/payments/razorpay/order', { method: 'POST', body: payload }),
  verifyRazorpayPayment: (payload) => api('/payments/razorpay/verify', { method: 'POST', body: payload }),
};