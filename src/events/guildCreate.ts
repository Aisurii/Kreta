import { Guild, REST, Routes } from 'discord.js';
import { Event } from '../types';
import { logger } from '../utils/logger';
import { prisma } from '../database/client';
import { BotClient } from '../core/client';

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

    // Auto-register commands to this guild for instant availability
    try {
      const client = guild.client as BotClient;
      const commands = [];

      for (const [_, command] of client.commands) {
        commands.push(command.data.toJSON());
      }

      const rest = new REST().setToken(process.env.BOT_TOKEN!);

      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID!, guild.id),
        { body: commands }
      );

      logger.info(`✓ Registered ${commands.length} commands to guild ${guild.name}`);
    } catch (error) {
      logger.error(`Failed to register commands to guild ${guild.name}: ${error}`);
    }
  },
};

export default event;
