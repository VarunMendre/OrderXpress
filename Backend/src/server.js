const { createApp } = require('./app');
const { config } = require('./config');
const { connectMongo } = require('./config/mongo');
const { connectRedis } = require('./config/redis');

async function bootstrap() {
  await connectMongo();
  await connectRedis();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`[server] listening on port ${config.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('[server] failed to start', error);
  process.exit(1);
});
