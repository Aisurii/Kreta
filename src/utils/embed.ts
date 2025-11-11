import { EmbedBuilder, User } from 'discord.js';
import { BOT_CONFIG } from '../config/constants';

/**
 * Create a standard embed with default styling
 */
export function createEmbed(options: {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: string;
  timestamp?: boolean;
}): EmbedBuilder {
  const embed = new EmbedBuilder().setColor(options.color ?? BOT_CONFIG.EMBED_COLOR);

  if (options.title) embed.setTitle(options.title);
  if (options.description) embed.setDescription(options.description);
  if (options.fields) embed.addFields(options.fields);
  if (options.footer) embed.setFooter({ text: options.footer });
  if (options.timestamp) embed.setTimestamp();

  return embed;
}

/**
 * Create a success embed (green)
 */
export function createSuccessEmbed(title: string, description?: string): EmbedBuilder {
  return createEmbed({
    title: `✅ ${title}`,
    description,
    color: BOT_CONFIG.SUCCESS_COLOR,
    timestamp: true,
  });
}

/**
 * Create an error embed (red)
 */
export function createErrorEmbed(title: string, description?: string): EmbedBuilder {
  return createEmbed({
    title: `❌ ${title}`,
    description,
    color: BOT_CONFIG.ERROR_COLOR,
    timestamp: true,
  });
}

/**
 * Create a warning embed (yellow)
 */
export function createWarningEmbed(title: string, description?: string): EmbedBuilder {
  return createEmbed({
    title: `⚠️ ${title}`,
    description,
    color: BOT_CONFIG.WARNING_COLOR,
    timestamp: true,
  });
}

/**
 * Create an info embed (blue)
 */
export function createInfoEmbed(title: string, description?: string): EmbedBuilder {
  return createEmbed({
    title: `ℹ️ ${title}`,
    description,
    color: BOT_CONFIG.INFO_COLOR,
    timestamp: true,
  });
}

/**
 * Create a moderation action embed
 */
export function createModActionEmbed(options: {
  action: string;
  moderator: User;
  target: User;
  reason: string;
  duration?: string;
  caseNumber?: number;
}): EmbedBuilder {
  const { action, moderator, target, reason, duration, caseNumber } = options;

  const embed = createEmbed({
    title: `${getActionEmoji(action)} ${action.charAt(0).toUpperCase() + action.slice(1)}`,
    color: getActionColor(action),
    timestamp: true,
  });

  embed.addFields(
    { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
    { name: 'Moderator', value: `${moderator.tag}`, inline: true }
  );

  if (caseNumber) {
    embed.addFields({ name: 'Case', value: `#${caseNumber}`, inline: true });
  }

  embed.addFields({ name: 'Reason', value: reason || 'No reason provided' });

  if (duration) {
    embed.addFields({ name: 'Duration', value: duration, inline: true });
  }

  embed.setThumbnail(target.displayAvatarURL());

  return embed;
}

/**
 * Get emoji for action type
 */
function getActionEmoji(action: string): string {
  const emojis: Record<string, string> = {
    warn: '⚠️',
    kick: '👢',
    ban: '🔨',
    unban: '🔓',
    mute: '🔇',
    unmute: '🔊',
    purge: '🗑️',
  };
  return emojis[action.toLowerCase()] || '📝';
}

/**
 * Get color for action type
 */
function getActionColor(action: string): number {
  const colors: Record<string, number> = {
    warn: BOT_CONFIG.WARNING_COLOR,
    kick: 0xffa500, // Orange
    ban: BOT_CONFIG.ERROR_COLOR,
    unban: BOT_CONFIG.SUCCESS_COLOR,
    mute: 0x95a5a6, // Gray
    unmute: BOT_CONFIG.SUCCESS_COLOR,
    purge: 0x3498db, // Blue
  };
  return colors[action.toLowerCase()] || BOT_CONFIG.INFO_COLOR;
}
