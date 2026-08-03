const mongoose = require('mongoose');
const { config } = require('./index');

async function connectMongo() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  return mongoose.connect(config.mongoUri, {
    autoIndex: true
  });
}

module.exports = { connectMongo };
