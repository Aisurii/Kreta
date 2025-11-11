import { REST, Routes } from 'discord.js';
import { BotClient } from './client';
import { logger } from '../utils/logger';

/**
 * Register all slash commands with Discord
 * Can register globally or to a specific guild for testing
 */
export async function registerCommands(client: BotClient, guildId?: string): Promise<void> {
  const commands = [];

  // Collect all command data
  for (const [_, command] of client.commands) {
    commands.push(command.data.toJSON());
  }

  const rest = new REST().setToken(process.env.BOT_TOKEN!);

  try {
    logger.info(`Started refreshing ${commands.length} application (/) commands.`);

    if (guildId) {
      // Register commands to a specific guild (instant, for testing)
      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, guildId), {
        body: commands,
      });
      logger.info(
        `Successfully registered ${commands.length} application (/) commands to guild ${guildId}.`
      );
    } else {
      // Register commands globally (takes up to 1 hour to propagate)
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
        body: commands,
      });
      logger.info(
        `Successfully registered ${commands.length} application (/) commands globally.`
      );
    }
  } catch (error) {
    logger.error(`Failed to register commands: ${error}`);
    throw error;
  }
}

/**
 * Delete all commands (useful for cleanup)
 */
export async function deleteAllCommands(guildId?: string): Promise<void> {
  const rest = new REST().setToken(process.env.BOT_TOKEN!);

  try {
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, guildId), {
        body: [],
      });
      logger.info(`Deleted all guild commands for guild ${guildId}`);
    } else {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: [] });
      logger.info('Deleted all global commands');
    }
  } catch (error) {
    logger.error(`Failed to delete commands: ${error}`);
    throw error;
  }
}
