import { Message } from 'discord.js';
import { Event } from '../types';
import { logger } from '../utils/logger';
import { prisma } from '../database/client';

const event: Event<'messageCreate'> = {
  name: 'messageCreate',
  async execute(message: Message) {
    // Ignore bot messages
    if (message.author.bot) return;

    // Ignore DMs (for now)
    if (!message.guild) return;

    try {
      // Ensure guild exists in database
      await ensureGuild(message.guild.id);

      // Ensure user exists in database
      await ensureUser(message.author.id, message.author.username);

      // TODO: Phase 1 - AI Moderation will be implemented here
      // This will scan messages for toxicity, spam, etc.
      // and flag them in the database for review

      // TODO: Future phases
      // - XP/Leveling system (award XP for messages)
      // - Economy system (random coin drops, etc.)
      // - Custom commands/tags
    } catch (error) {
      logger.error(`Error in messageCreate event: ${error}`);
    }
  },
};

/**
 * Ensure a guild exists in the database, create if not
 */
async function ensureGuild(guildId: string): Promise<void> {
  const existing = await prisma.guild.findUnique({
    where: { id: guildId },
  });

  if (!existing) {
    await prisma.guild.create({
      data: { id: guildId },
    });
    logger.debug(`Created guild entry for ${guildId}`);
  }
}

/**
 * Ensure a user exists in the database, create or update if needed
 */
async function ensureUser(userId: string, username: string): Promise<void> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existing) {
    await prisma.user.create({
      data: { id: userId, username },
    });
    logger.debug(`Created user entry for ${username} (${userId})`);
  } else if (existing.username !== username) {
    // Update username if changed
    await prisma.user.update({
      where: { id: userId },
      data: { username },
    });
  }
}

export default event;
