function validateRegisterPayload(body) {
  const required = [
    'ownerName',
    'restaurantName',
    'email',
    'phone',
    'tableCount',
    'password',
    'confirmPassword',
    'businessType',
    'businessCategory',
    'businessSubCategory',
    'address',
    'city',
    'state',
    'pincode',
    'pan',
    'bankAccountNumber',
    'ifsc',
    'transactionProfile'
  ];

  const missing = required.filter((field) => !body[field]);
  if (missing.length > 0) {
    return { ok: false, error: `Missing fields: ${missing.join(', ')}` };
  }

  if (body.password !== body.confirmPassword) {
    return { ok: false, error: 'Passwords do not match.' };
  }

  if (String(body.password).length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters long.' };
  }

  const tableCount = Number(body.tableCount);
  if (!Number.isInteger(tableCount) || tableCount < 1) {
    return { ok: false, error: 'tableCount must be a positive integer.' };
  }

  return { ok: true };
}

function validateLoginPayload(body) {
  if (!body.email || !body.password) {
    return { ok: false, error: 'Email and password are required.' };
  }
  return { ok: true };
}

module.exports = { validateRegisterPayload, validateLoginPayload };
