const crypto = require('crypto');
const { Admin } = require('../models/admin.model');
const { Restaurant } = require('../models/restaurant.model');
const { Table } = require('../models/table.model');
const { CustomerSession } = require('../models/customer-session.model');
const { config } = require('../config');

async function generateTables(adminId, tableCountInput) {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  const restaurant = await Restaurant.findById(admin.restaurantId);
  if (!restaurant) {
    const error = new Error('Restaurant not found.');
    error.statusCode = 404;
    throw error;
  }

  const tableCount = tableCountInput || restaurant.tableCount || 0;
  if (!tableCount || tableCount < 1) {
    const error = new Error('Table count is required.');
    error.statusCode = 400;
    throw error;
  }

  const existingTables = await Table.find({ restaurantId: restaurant._id }).sort({ tableNumber: 1 });
  const existingNumbers = new Set(existingTables.map((table) => table.tableNumber));
  const toCreate = [];

  for (let index = 1; index <= tableCount; index += 1) {
    if (!existingNumbers.has(index)) {
      toCreate.push({
        restaurantId: restaurant._id,
        tableNumber: index,
        tableLabel: `Table ${String(index).padStart(2, '0')}`
      });
    }
  }

  if (toCreate.length > 0) {
    await Table.insertMany(toCreate);
  }

  return Table.find({ restaurantId: restaurant._id }).sort({ tableNumber: 1 }).lean();
}

async function listTables(adminId) {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  return Table.find({ restaurantId: admin.restaurantId }).sort({ tableNumber: 1 }).lean();
}

async function generateQr(adminId, tableId) {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  const table = await Table.findOne({ _id: tableId, restaurantId: admin.restaurantId });
  if (!table) {
    const error = new Error('Table not found.');
    error.statusCode = 404;
    throw error;
  }

  const payload = {
    restaurantId: String(admin.restaurantId),
    tableId: String(table._id),
    tableNumber: table.tableNumber,
    issuedAt: new Date().toISOString()
  };

  const rawPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto.createHmac('sha256', config.jwtSecret).update(rawPayload).digest('hex');

  table.qrPayload = rawPayload;
  table.qrSignature = signature;
  await table.save();

  return {
    table: table.toObject(),
    qr: {
      payload: rawPayload,
      signature
    }
  };
}

async function getTableSession(adminId, tableId) {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  return CustomerSession.findOne({
    restaurantId: admin.restaurantId,
    tableId,
    sessionStatus: 'active'
  })
    .sort({ createdAt: -1 })
    .lean();
}

module.exports = { generateTables, listTables, generateQr, getTableSession };
