import { readdirSync } from 'fs';
import { join } from 'path';
import { BotClient } from './client';
import { Command } from '../types';
import { logger } from '../utils/logger';

/**
 * Load all commands from the commands directory
 */
export async function loadCommands(client: BotClient): Promise<void> {
  const commandsPath = join(__dirname, '..', 'commands');
  const commandFolders = readdirSync(commandsPath);

  let loadedCount = 0;
  let failedCount = 0;

  for (const folder of commandFolders) {
    const folderPath = join(commandsPath, folder);

    // Check if it's a directory
    try {
      const stat = require('fs').statSync(folderPath);
      if (!stat.isDirectory()) continue;
    } catch {
      continue;
    }

    const commandFiles = readdirSync(folderPath).filter(
      (file) => file.endsWith('.ts') || file.endsWith('.js')
    );

    for (const file of commandFiles) {
      try {
        const filePath = join(folderPath, file);
        // Dynamic import for TypeScript/JavaScript files
        const commandModule = await import(filePath);
        const command: Command = commandModule.default || commandModule;

        // Validate command structure
        if (!command.data || !command.execute) {
          logger.warn(`Command at ${filePath} is missing required "data" or "execute" property`);
          failedCount++;
          continue;
        }

        // Check if command is enabled (default to true)
        if (command.enabled === false) {
          logger.debug(`Command ${command.data.name} is disabled, skipping`);
          continue;
        }

        // Add command to collection
        client.commands.set(command.data.name, command);
        loadedCount++;
        logger.debug(`Loaded command: ${command.data.name} from ${folder}/${file}`);
      } catch (error) {
        logger.error(`Failed to load command from ${folder}/${file}: ${error}`);
        failedCount++;
      }
    }
  }

  logger.info(`Successfully loaded ${loadedCount} command(s)${failedCount > 0 ? `, failed to load ${failedCount}` : ''}`);
}

/**
 * Reload a specific command
 */
export async function reloadCommand(client: BotClient, commandName: string): Promise<boolean> {
  try {
    // Find the command file
    const commandsPath = join(__dirname, '..', 'commands');
    const folders = readdirSync(commandsPath);

    for (const folder of folders) {
      const folderPath = join(commandsPath, folder);
      const files = readdirSync(folderPath);

      for (const file of files) {
        const filePath = join(folderPath, file);

        // Clear require cache
        delete require.cache[require.resolve(filePath)];

        const commandModule = await import(filePath);
        const command: Command = commandModule.default || commandModule;

        if (command.data.name === commandName) {
          client.commands.set(command.data.name, command);
          logger.info(`Reloaded command: ${commandName}`);
          return true;
        }
      }
    }

    logger.warn(`Command ${commandName} not found for reload`);
    return false;
  } catch (error) {
    logger.error(`Failed to reload command ${commandName}: ${error}`);
    return false;
  }
}
