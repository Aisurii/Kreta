import { readdirSync } from 'fs';
import { join } from 'path';
import { BotClient } from './client';
import { Event } from '../types';
import { logger } from '../utils/logger';

/**
 * Load all events from the events directory
 */
export async function loadEvents(client: BotClient): Promise<void> {
  const eventsPath = join(__dirname, '..', 'events');
  const eventFiles = readdirSync(eventsPath).filter(
    (file) => file.endsWith('.ts') || file.endsWith('.js')
  );

  let loadedCount = 0;
  let failedCount = 0;

  for (const file of eventFiles) {
    try {
      const filePath = join(eventsPath, file);
      // Dynamic import for TypeScript/JavaScript files
      const eventModule = await import(filePath);
      const event: Event = eventModule.default || eventModule;

      // Validate event structure
      if (!event.name || !event.execute) {
        logger.warn(`Event at ${filePath} is missing required "name" or "execute" property`);
        failedCount++;
        continue;
      }

      // Register event listener
      if (event.once) {
        client.once(event.name, (...args) => {
          Promise.resolve(event.execute(...args)).catch((error: unknown) => {
            logger.error(`Error executing once event ${event.name}: ${error}`);
          });
        });
      } else {
        client.on(event.name, (...args) => {
          Promise.resolve(event.execute(...args)).catch((error: unknown) => {
            logger.error(`Error executing event ${event.name}: ${error}`);
          });
        });
      }

      loadedCount++;
      logger.debug(`Loaded event: ${event.name} from ${file}`);
    } catch (error) {
      logger.error(`Failed to load event from ${file}: ${error}`);
      failedCount++;
    }
  }

  logger.info(`Successfully loaded ${loadedCount} event(s)${failedCount > 0 ? `, failed to load ${failedCount}` : ''}`);
}
