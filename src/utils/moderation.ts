import { Guild, User, TextChannel, EmbedBuilder } from 'discord.js';
import { prisma } from '../database/client';
import { logger } from './logger';
import { createModActionEmbed } from './embed';

export interface ModLogOptions {
  guild: Guild;
  type: string;
  target: User;
  moderator: User;
  reason: string;
  duration?: number; // in seconds
  evidence?: string;
}

/**
 * Create a moderation log entry in the database and send notification
 */
export async function createModLog(options: ModLogOptions): Promise<number> {
  const { guild, type, target, moderator, reason, duration, evidence } = options;

  try {
    // Get next case number for this guild
    const lastCase = await prisma.modLog.findFirst({
      where: { guildId: guild.id },
      orderBy: { caseNumber: 'desc' },
    });

    const caseNumber = (lastCase?.caseNumber || 0) + 1;

    // Create mod log entry
    await prisma.modLog.create({
      data: {
        guildId: guild.id,
        caseNumber,
        type,
        targetId: target.id,
        moderatorId: moderator.id,
        reason,
        duration,
        evidence,
      },
    });

    // Send log to mod log channel if configured
    await sendModLog(guild, {
      action: type,
      target,
      moderator,
      reason,
      caseNumber,
      duration: duration ? formatDuration(duration * 1000) : undefined,
    });

    // Send DM to target user (optional, can be configured per server)
    await notifyUser(target, {
      guild,
      action: type,
      reason,
      moderator,
      duration: duration ? formatDuration(duration * 1000) : undefined,
    });

    logger.info(
      `Mod action logged: ${type} | Guild: ${guild.name} | Target: ${target.tag} | Mod: ${moderator.tag} | Case: #${caseNumber}`
    );

    return caseNumber;
  } catch (error) {
    logger.error(`Failed to create mod log: ${error}`);
    throw error;
  }
}

/**
 * Send moderation log to the guild's mod log channel
 */
async function sendModLog(
  guild: Guild,
  options: {
    action: string;
    target: User;
    moderator: User;
    reason: string;
    caseNumber: number;
    duration?: string;
  }
): Promise<void> {
  try {
    // Get guild config from database
    const guildConfig = await prisma.guild.findUnique({
      where: { id: guild.id },
    });

    if (!guildConfig?.modLogChannelId) {
      logger.debug(`No mod log channel configured for guild ${guild.name}`);
      return;
    }

    // Get the channel
    const channel = await guild.channels.fetch(guildConfig.modLogChannelId);
    if (!channel || !channel.isTextBased()) {
      logger.warn(`Mod log channel ${guildConfig.modLogChannelId} not found or not text-based`);
      return;
    }

    // Create embed
    const embed = createModActionEmbed(options);

    // Send to channel
    await (channel as TextChannel).send({ embeds: [embed] });
  } catch (error) {
    logger.error(`Failed to send mod log to channel: ${error}`);
  }
}

/**
 * Notify a user via DM about a moderation action
 */
async function notifyUser(
  user: User,
  options: {
    guild: Guild;
    action: string;
    reason: string;
    moderator: User;
    duration?: string;
  }
): Promise<void> {
  try {
    const { guild, action, reason, duration } = options;

    const embed = new EmbedBuilder()
      .setTitle(`You have been ${action}${action.endsWith('e') ? 'd' : 'ed'} in ${guild.name}`)
      .setColor(0xed4245)
      .addFields({ name: 'Reason', value: reason || 'No reason provided' })
      .setTimestamp();

    if (duration) {
      embed.addFields({ name: 'Duration', value: duration });
    }

    embed.setFooter({ text: 'If you believe this was a mistake, please contact the server moderators.' });

    await user.send({ embeds: [embed] });
    logger.debug(`Sent DM notification to ${user.tag} for ${action}`);
  } catch (error) {
    // User might have DMs disabled or blocked the bot
    logger.debug(`Could not send DM to ${user.tag}: ${error}`);
  }
}

/**
 * Format duration from milliseconds to human-readable string
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days} day${days !== 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}

/**
 * Add a warning to the database
 */
export async function addWarning(
  guildId: string,
  userId: string,
  moderatorId: string,
  reason: string
): Promise<void> {
  await prisma.warning.create({
    data: {
      guildId,
      userId,
      moderatorId,
      reason,
    },
  });
}

/**
 * Get user warnings from the database
 */
export async function getWarnings(guildId: string, userId: string) {
  return await prisma.warning.findMany({
    where: {
      guildId,
      userId,
    },
    orderBy: {
      timestamp: 'desc',
    },
  });
}
