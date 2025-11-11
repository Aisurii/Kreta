import { Guild } from 'discord.js';
import { Event } from '../types';
import { logger } from '../utils/logger';
import { prisma } from '../database/client';

const event: Event<'guildCreate'> = {
  name: 'guildCreate',
  async execute(guild: Guild) {
    logger.info(`Joined new guild: ${guild.name} (${guild.id})`);

    try {
      // Create guild entry in database
      await prisma.guild.create({
        data: {
          id: guild.id,
        },
      });
      logger.info(`Created database entry for guild ${guild.name}`);
    } catch (error) {
      // Guild might already exist if bot rejoined
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        logger.debug(`Guild ${guild.name} already exists in database`);
      } else {
        logger.error(`Failed to create guild entry for ${guild.name}: ${error}`);
      }
    }
  },
};

export default event;
