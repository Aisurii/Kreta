console.log('=== BOT STARTING ===');
import 'dotenv/config';
console.log('✓ Loaded dotenv');

console.log('Loading BotClient...');
import { BotClient } from './core/client';
console.log('✓ Loaded BotClient');

console.log('Loading command handler...');
import { loadCommands } from './core/commandHandler';
console.log('✓ Loaded command handler');

console.log('Loading event handler...');
import { loadEvents } from './core/eventHandler';
console.log('✓ Loaded event handler');

console.log('Loading database client...');
import { prisma, disconnectDatabase } from './database/client';
console.log('✓ Loaded database client');

console.log('Loading logger...');
import { logger } from './utils/logger';
console.log('✓ Loaded logger');

console.log('✓ All imports loaded successfully');

// Validate required environment variables
console.log('Checking environment variables...');
const requiredEnvVars = ['BOT_TOKEN', 'CLIENT_ID', 'DATABASE_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}
console.log('✓ All environment variables present');

// Create bot client instance
const client = new BotClient();

// Initialize bot
async function init() {
  try {
    logger.info('Starting bot initialization...');

    // Test database connection
    await prisma.$connect();
    logger.info('✓ Connected to database');

    // Load commands
    await loadCommands(client);

    // Load events
    await loadEvents(client);

    // Login to Discord
    await client.login(process.env.BOT_TOKEN);
  } catch (error) {
    logger.error(`Failed to initialize bot: ${error}`);
    process.exit(1);
  }
}

// Graceful shutdown handler
async function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully...`);

  try {
    // Destroy Discord client
    client.destroy();
    logger.info('✓ Disconnected from Discord');

    // Disconnect from database
    await disconnectDatabase();

    logger.info('✓ Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error(`Error during shutdown: ${error}`);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error}`);
  process.exit(1);
});

// Start the bot
init();
