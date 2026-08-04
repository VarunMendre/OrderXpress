const { validateTableCountPayload } = require('../validators/table.schema');
const { generateTables, listTables, generateQr, getTableSession } = require('../services/table.service');

async function generate(req, res, next) {
  try {
    const validation = validateTableCountPayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: validation.error } });
    }

    const data = await generateTables(req.auth.adminId, validation.tableCount);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function index(req, res, next) {
  try {
    const data = await listTables(req.auth.adminId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function qr(req, res, next) {
  try {
    const data = await generateQr(req.auth.adminId, req.params.tableId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function session(req, res, next) {
  try {
    const data = await getTableSession(req.auth.adminId, req.params.tableId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

module.exports = { generate, index, qr, session };
