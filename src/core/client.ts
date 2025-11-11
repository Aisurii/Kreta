import { Client, Collection, GatewayIntentBits, Partials, ActivityType } from 'discord.js';
import { Command } from '../types';
import { logger } from '../utils/logger';
import { PRESENCE } from '../config/constants';

// Extend the Discord Client to include our command collection
export class BotClient extends Client {
  public commands: Collection<string, Command>;
  public cooldowns: Collection<string, Collection<string, number>>;
  private activityIndex: number = 0;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds, // Access to guild data
        GatewayIntentBits.GuildMembers, // Access to member data (requires privileged intent)
        GatewayIntentBits.GuildModeration, // Access to bans, kicks, etc.
        GatewayIntentBits.GuildMessages, // Access to messages (for AI moderation)
        GatewayIntentBits.MessageContent, // Access to message content (requires privileged intent)
        GatewayIntentBits.GuildVoiceStates, // For voice features (future)
      ],
      partials: [
        Partials.Message, // Allow bot to receive events for messages sent before bot was online
        Partials.Channel, // Allow bot to receive events for channels
        Partials.GuildMember, // Allow bot to receive events for members
        Partials.User, // Allow bot to receive events for users
      ],
      presence: {
        status: PRESENCE.STATUS,
        activities: [
          {
            name: PRESENCE.ACTIVITIES[0].name,
            type: PRESENCE.ACTIVITIES[0].type as ActivityType,
          },
        ],
      },
    });

    this.commands = new Collection();
    this.cooldowns = new Collection();
  }

  /**
   * Start rotating bot activities
   */
  public startActivityRotation() {
    setInterval(() => {
      this.activityIndex = (this.activityIndex + 1) % PRESENCE.ACTIVITIES.length;
      const activity = PRESENCE.ACTIVITIES[this.activityIndex];

      this.user?.setActivity({
        name: activity.name,
        type: activity.type as ActivityType,
      });

      logger.debug(`Activity rotated to: ${activity.name}`);
    }, PRESENCE.ROTATION_INTERVAL);
  }

  /**
   * Get user from cache or fetch from API
   */
  public async getUser(userId: string) {
    try {
      return await this.users.fetch(userId);
    } catch (error) {
      logger.error(`Failed to fetch user ${userId}: ${error}`);
      return null;
    }
  }

  /**
   * Check if a user is on cooldown for a command
   */
  public isOnCooldown(userId: string, commandName: string): number | null {
    if (!this.cooldowns.has(commandName)) {
      return null;
    }

    const now = Date.now();
    const timestamps = this.cooldowns.get(commandName)!;
    const cooldownAmount = timestamps.get(userId);

    if (cooldownAmount && now < cooldownAmount) {
      return (cooldownAmount - now) / 1000; // Return seconds remaining
    }

    return null;
  }

  /**
   * Set a cooldown for a user on a command
   */
  public setCooldown(userId: string, commandName: string, cooldownSeconds: number) {
    if (!this.cooldowns.has(commandName)) {
      this.cooldowns.set(commandName, new Collection());
    }

    const now = Date.now();
    const timestamps = this.cooldowns.get(commandName)!;
    const expirationTime = now + cooldownSeconds * 1000;

    timestamps.set(userId, expirationTime);

    // Auto-delete expired cooldown
    setTimeout(() => {
      timestamps.delete(userId);
    }, cooldownSeconds * 1000);
  }
}
