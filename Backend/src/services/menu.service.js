const { Admin } = require('../models/admin.model');
const { MenuItem } = require('../models/menu-item.model');
const { MenuImage } = require('../models/menu-image.model');
const { MenuExtraction } = require('../models/menu-extraction.model');

async function listMenuItems(adminId, filters = {}) {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  const query = { restaurantId: admin.restaurantId };
  if (filters.category) query.category = filters.category;
  if (filters.available !== undefined) query.isAvailable = filters.available === 'true' || filters.available === true;
  if (filters.search) query.name = { $regex: filters.search, $options: 'i' };

  return MenuItem.find(query).sort({ createdAt: -1 }).lean();
}

async function createMenuItem(adminId, payload) {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  const item = await MenuItem.create({
    restaurantId: admin.restaurantId,
    name: payload.name.trim(),
    description: payload.description || '',
    price: Number(payload.price),
    category: payload.category.trim(),
    imageUrl: payload.imageUrl || '',
    isVegetarian: Boolean(payload.isVegetarian),
    portionType: payload.portionType || '',
    isAvailable: payload.isAvailable !== undefined ? Boolean(payload.isAvailable) : true,
    sourceExtractionId: payload.sourceExtractionId || null
  });

  return item.toObject();
}

async function updateMenuItem(adminId, itemId, payload) {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  const update = {};
  if (payload.name !== undefined) update.name = payload.name.trim();
  if (payload.description !== undefined) update.description = payload.description;
  if (payload.price !== undefined) update.price = Number(payload.price);
  if (payload.category !== undefined) update.category = payload.category.trim();
  if (payload.imageUrl !== undefined) update.imageUrl = payload.imageUrl;
  if (payload.isVegetarian !== undefined) update.isVegetarian = Boolean(payload.isVegetarian);
  if (payload.portionType !== undefined) update.portionType = payload.portionType;
  if (payload.isAvailable !== undefined) update.isAvailable = Boolean(payload.isAvailable);

  const item = await MenuItem.findOneAndUpdate(
    { _id: itemId, restaurantId: admin.restaurantId },
    update,
    { new: true }
  );

  if (!item) {
    const error = new Error('Menu item not found.');
    error.statusCode = 404;
    throw error;
  }

  return item.toObject();
}

async function deleteMenuItem(adminId, itemId) {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  const result = await MenuItem.deleteOne({ _id: itemId, restaurantId: admin.restaurantId });
  if (result.deletedCount === 0) {
    const error = new Error('Menu item not found.');
    error.statusCode = 404;
    throw error;
  }

  return { deleted: true };
}

async function uploadMenuImage(adminId, payload) {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  const image = await MenuImage.create({
    restaurantId: admin.restaurantId,
    imageUrl: payload.imageUrl,
    fileName: payload.fileName || '',
    mimeType: payload.mimeType || '',
    fileSize: Number(payload.fileSize || 0),
    ocrStatus: 'uploaded',
    retentionStatus: 'retained'
  });

  const extraction = await MenuExtraction.create({
    restaurantId: admin.restaurantId,
    menuImageId: image._id,
    provider: payload.provider || 'pending',
    rawText: payload.rawText || '',
    confidenceScore: Number(payload.confidenceScore || 0),
    detectedItems: Array.isArray(payload.detectedItems) ? payload.detectedItems : [],
    reviewStatus: 'pending'
  });

  return { image: image.toObject(), extraction: extraction.toObject() };
}

async function getExtraction(adminId, imageId) {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  return MenuExtraction.findOne({ restaurantId: admin.restaurantId, menuImageId: imageId }).lean();
}

async function reviewExtraction(adminId, imageId, payload) {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  const extraction = await MenuExtraction.findOneAndUpdate(
    { restaurantId: admin.restaurantId, menuImageId: imageId },
    {
      reviewStatus: 'accepted',
      reviewedBy: admin._id,
      reviewedAt: new Date(),
      detectedItems: Array.isArray(payload.detectedItems) ? payload.detectedItems : []
    },
    { new: true }
  );

  if (!extraction) {
    const error = new Error('Extraction not found.');
    error.statusCode = 404;
    throw error;
  }

  const createdItems = [];
  for (const item of extraction.detectedItems || []) {
    const created = await MenuItem.create({
      restaurantId: admin.restaurantId,
      name: item.name,
      description: item.description || '',
      price: Number(item.price || 0),
      category: item.category || 'Uncategorized',
      imageUrl: item.imageUrl || '',
      isVegetarian: Boolean(item.isVegetarian),
      portionType: item.portionType || '',
      isAvailable: true,
      sourceExtractionId: extraction._id
    });
    createdItems.push(created.toObject());
  }

  return { extraction: extraction.toObject(), createdItems };
}

module.exports = {
  listMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadMenuImage,
  getExtraction,
  reviewExtraction
};
