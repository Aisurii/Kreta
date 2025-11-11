import { TIME } from '../config/constants';

/**
 * Parse a duration string (e.g., "1h", "30m", "7d") into milliseconds
 */
export function parseDuration(duration: string): number | null {
  const match = duration.match(/^(\d+)([smhdw])$/i);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers: Record<string, number> = {
    s: TIME.SECOND,
    m: TIME.MINUTE,
    h: TIME.HOUR,
    d: TIME.DAY,
    w: TIME.WEEK,
  };

  return value * (multipliers[unit] || 0);
}

/**
 * Format milliseconds into a human-readable duration
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / TIME.SECOND);
  const minutes = Math.floor(ms / TIME.MINUTE);
  const hours = Math.floor(ms / TIME.HOUR);
  const days = Math.floor(ms / TIME.DAY);
  const weeks = Math.floor(ms / TIME.WEEK);

  if (weeks > 0) return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  if (days > 0) return `${days} day${days !== 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}

/**
 * Format a relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(timestamp: Date): string {
  const now = Date.now();
  const diff = timestamp.getTime() - now;
  const absDiff = Math.abs(diff);

  const isPast = diff < 0;
  const duration = formatDuration(absDiff);

  return isPast ? `${duration} ago` : `in ${duration}`;
}

/**
 * Format a timestamp into a readable date string
 */
export function formatTimestamp(timestamp: Date | number, style: 'short' | 'long' = 'long'): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;

  if (style === 'short') {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/**
 * Get a Discord timestamp format string
 * See: https://discord.com/developers/docs/reference#message-formatting-timestamp-styles
 */
export function getDiscordTimestamp(timestamp: Date | number, style: 'R' | 'F' | 'D' | 'T' | 'f' | 'd' | 't' = 'F'): string {
  const unixTimestamp = typeof timestamp === 'number' ? Math.floor(timestamp / 1000) : Math.floor(timestamp.getTime() / 1000);
  return `<t:${unixTimestamp}:${style}>`;
}
