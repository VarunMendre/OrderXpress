function validateCheckoutPayload(body) {
  const required = ['orderType', 'paymentMethod'];
  const missing = required.filter((field) => !body[field]);
  if (missing.length > 0) {
    return { ok: false, error: `Missing fields: ${missing.join(', ')}` };
  }

  if (!['dine-in', 'takeaway'].includes(body.orderType)) {
    return { ok: false, error: 'orderType must be dine-in or takeaway.' };
  }

  if (!['online', 'cash'].includes(body.paymentMethod)) {
    return { ok: false, error: 'paymentMethod must be online or cash.' };
  }

  return { ok: true };
}

module.exports = { validateCheckoutPayload };
