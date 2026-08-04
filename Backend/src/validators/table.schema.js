function validateTableCountPayload(body) {
  const tableCount = Number(body.tableCount);
  if (!Number.isInteger(tableCount) || tableCount < 1) {
    return { ok: false, error: 'tableCount must be a positive integer.' };
  }
  return { ok: true, tableCount };
}

module.exports = { validateTableCountPayload };
