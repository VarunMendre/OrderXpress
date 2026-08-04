function validateSessionScanPayload(body) {
  const required = ['restaurantId', 'tableId', 'signature', 'expiry', 'nonce'];
  const missing = required.filter((field) => !body[field]);
  if (missing.length > 0) {
    return { ok: false, error: `Missing fields: ${missing.join(', ')}` };
  }
  return { ok: true };
}

function validateCartItemPayload(body) {
  if (!body.menuItemId) return { ok: false, error: 'menuItemId is required.' };
  const quantity = Number(body.quantity || 1);
  if (!Number.isInteger(quantity) || quantity < 1) return { ok: false, error: 'quantity must be a positive integer.' };
  return { ok: true, quantity };
}

module.exports = { validateSessionScanPayload, validateCartItemPayload };
