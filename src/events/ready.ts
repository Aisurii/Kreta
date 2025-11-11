import { Client } from 'discord.js';
import { Event } from '../types';
import { BotClient } from '../core/client';
import { logger } from '../utils/logger';
import { registerCommands } from '../core/registry';

const event: Event<'ready'> = {
  name: 'ready',
  once: true,
  async execute(client: Client<true>) {
    const botClient = client as BotClient;

    if (!botClient.user) {
      logger.error('Client user is not available');
      return;
    }

    logger.info(`✓ Bot is online as ${botClient.user.tag}`);
    logger.info(`✓ Serving ${botClient.guilds.cache.size} guild(s)`);
    logger.info(`✓ ${botClient.commands.size} command(s) loaded`);

    // Start activity rotation
    botClient.startActivityRotation();

    // Register slash commands
    // For development, you can specify a guild ID to register commands instantly
    // For production, remove the guild ID to register globally (takes up to 1 hour)
    try {
      const devGuildId = process.env.DEV_GUILD_ID; // Optional: Add to .env for faster testing
      await registerCommands(botClient, devGuildId);
    } catch (error) {
      logger.error(`Failed to register commands: ${error}`);
    }

    logger.info('✓ Bot is fully ready!');
  },
};

export default event;
