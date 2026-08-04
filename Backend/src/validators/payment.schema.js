function validateRazorpayOrderPayload(body) {
  const required = ['orderId', 'amount', 'currency'];
  const missing = required.filter((field) => !body[field] && body[field] !== 0);
  if (missing.length > 0) {
    return { ok: false, error: `Missing fields: ${missing.join(', ')}` };
  }
  return { ok: true };
}

function validateWebhookPayload(body) {
  if (!body.payload || !body.event) {
    return { ok: false, error: 'Invalid webhook payload.' };
  }
  return { ok: true };
}

module.exports = { validateRazorpayOrderPayload, validateWebhookPayload };
