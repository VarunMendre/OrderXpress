function validateMenuItemPayload(body) {
  const required = ['name', 'price', 'category'];
  const missing = required.filter((field) => body[field] === undefined || body[field] === null || body[field] === '');
  if (missing.length > 0) {
    return { ok: false, error: `Missing fields: ${missing.join(', ')}` };
  }

  const price = Number(body.price);
  if (Number.isNaN(price) || price < 0) {
    return { ok: false, error: 'price must be a non-negative number.' };
  }

  return { ok: true, price };
}

function validateMenuImagePayload(body) {
  if (!body.imageUrl) {
    return { ok: false, error: 'imageUrl is required.' };
  }
  return { ok: true };
}

module.exports = { validateMenuItemPayload, validateMenuImagePayload };
