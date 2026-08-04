const { validateMenuItemPayload, validateMenuImagePayload } = require('../validators/menu.schema');
const {
  listMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadMenuImage,
  getExtraction,
  reviewExtraction
} = require('../services/menu.service');

async function index(req, res, next) {
  try {
    const data = await listMenuItems(req.auth.adminId, req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function store(req, res, next) {
  try {
    const validation = validateMenuItemPayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: validation.error } });
    }

    const data = await createMenuItem(req.auth.adminId, req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const data = await updateMenuItem(req.auth.adminId, req.params.itemId, req.body);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const data = await deleteMenuItem(req.auth.adminId, req.params.itemId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function upload(req, res, next) {
  try {
    const validation = validateMenuImagePayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: validation.error } });
    }

    const data = await uploadMenuImage(req.auth.adminId, req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function extraction(req, res, next) {
  try {
    const data = await getExtraction(req.auth.adminId, req.params.imageId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function review(req, res, next) {
  try {
    const data = await reviewExtraction(req.auth.adminId, req.params.imageId, req.body);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

module.exports = { index, store, update, destroy, upload, extraction, review };
