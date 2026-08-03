const { createClient } = require('redis');
const { config } = require('./index');

let client;

async function connectRedis() {
  if (client && client.isOpen) return client;
  client = createClient({ url: config.redisUrl });
  client.on('error', (error) => {
    console.error('[redis] client error', error);
  });
  await client.connect();
  return client;
}

function getRedisClient() {
  return client;
}

module.exports = { connectRedis, getRedisClient };
