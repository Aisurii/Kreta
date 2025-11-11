// Bot Configuration Constants

export const BOT_CONFIG = {
  // Bot version
  VERSION: '1.0.0',

  // Default embed color (Discord blurple)
  EMBED_COLOR: 0x5865f2,

  // Error embed color (red)
  ERROR_COLOR: 0xed4245,

  // Success embed color (green)
  SUCCESS_COLOR: 0x57f287,

  // Warning embed color (yellow)
  WARNING_COLOR: 0xfee75c,

  // Info embed color (blue)
  INFO_COLOR: 0x5865f2,
} as const;

// Moderation Configuration
export const MOD_CONFIG = {
  // Default toxicity threshold (0-100, higher = more lenient)
  DEFAULT_TOXICITY_THRESHOLD: 70,

  // Maximum bulk delete count for purge command
  MAX_PURGE_COUNT: 100,

  // Maximum mute duration in days
  MAX_MUTE_DAYS: 28, // Discord's maximum timeout duration

  // Reasons character limits
  MAX_REASON_LENGTH: 512,

  // Mod log embed settings
  MODLOG_SHOW_AVATAR: true,
  MODLOG_SHOW_ID: true,
} as const;

// Permission Levels
export const PERMISSION_LEVELS = {
  USER: 0,
  MODERATOR: 1,
  ADMINISTRATOR: 2,
} as const;

// Action Types for Moderation
export const MOD_ACTIONS = {
  WARN: 'warn',
  KICK: 'kick',
  BAN: 'ban',
  UNBAN: 'unban',
  MUTE: 'mute',
  UNMUTE: 'unmute',
  PURGE: 'purge',
} as const;

// AI Moderation Types
export const FLAGGED_REASONS = {
  TOXICITY: 'toxicity',
  SPAM: 'spam',
  HARASSMENT: 'harassment',
  HATE_SPEECH: 'hate_speech',
  NSFW: 'nsfw',
  PHISHING: 'phishing',
} as const;

// Time constants (in milliseconds)
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// Bot presence configuration
export const PRESENCE = {
  STATUS: 'online' as const,
  ACTIVITIES: [
    { name: 'with slash commands', type: 0 }, // Playing
    { name: 'the server', type: 3 }, // Watching
    { name: 'your commands', type: 2 }, // Listening
  ],
  // Rotate activity every 5 minutes
  ROTATION_INTERVAL: 5 * 60 * 1000,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NO_PERMISSION: 'You do not have permission to use this command.',
  BOT_NO_PERMISSION: 'I do not have permission to perform this action.',
  USER_NOT_FOUND: 'User not found.',
  INVALID_USER: 'Invalid user provided.',
  CANNOT_ACTION_SELF: 'You cannot perform this action on yourself.',
  CANNOT_ACTION_BOT: 'You cannot perform this action on a bot.',
  ROLE_HIERARCHY: 'You cannot perform this action on a user with a higher or equal role.',
  BOT_ROLE_HIERARCHY: 'I cannot perform this action on a user with a higher or equal role than mine.',
  MISSING_REASON: 'You must provide a reason.',
  INVALID_DURATION: 'Invalid duration provided.',
  DATABASE_ERROR: 'A database error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again later.',
} as const;
