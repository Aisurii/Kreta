import { Event } from '../types';
import { BotClient } from '../core/client';
import { logger } from '../utils/logger';
import { registerCommands } from '../core/registry';

const event: Event<'ready'> = {
  name: 'ready',
  once: true,
  async execute(client: BotClient) {
    if (!client.user) {
      logger.error('Client user is not available');
      return;
    }

    logger.info(`✓ Bot is online as ${client.user.tag}`);
    logger.info(`✓ Serving ${client.guilds.cache.size} guild(s)`);
    logger.info(`✓ ${client.commands.size} command(s) loaded`);

    // Start activity rotation
    client.startActivityRotation();

    // Register slash commands
    // For development, you can specify a guild ID to register commands instantly
    // For production, remove the guild ID to register globally (takes up to 1 hour)
    try {
      const devGuildId = process.env.DEV_GUILD_ID; // Optional: Add to .env for faster testing
      await registerCommands(client, devGuildId);
    } catch (error) {
      logger.error(`Failed to register commands: ${error}`);
    }

    logger.info('✓ Bot is fully ready!');
  },
};

export default event;
