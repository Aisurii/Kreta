import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionResolvable,
  AutocompleteInteraction,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';

// Permission level enum
export enum PermissionLevel {
  User = 0,
  Moderator = 1,
  Administrator = 2,
}

// Command interface that all commands must implement
export interface Command {
  // Command data for slash command registration
  data: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'> | SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;

  // Permission level required to use this command
  permissionLevel: PermissionLevel;

  // Bot permissions required to execute this command
  botPermissions?: PermissionResolvable[];

  // Whether this command can only be used in guilds
  guildOnly?: boolean;

  // Whether this command is enabled
  enabled?: boolean;

  // Cooldown in seconds (per user)
  cooldown?: number;

  // Main execution function
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;

  // Optional autocomplete handler
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

// Command category enum for organization
export enum CommandCategory {
  General = 'general',
  Moderation = 'moderation',
  Economy = 'economy',
  Leveling = 'leveling',
  Games = 'games',
  Music = 'music',
  Utility = 'utility',
  Admin = 'admin',
}
