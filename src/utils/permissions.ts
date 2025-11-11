import { GuildMember, PermissionResolvable, PermissionsBitField } from 'discord.js';
import { PermissionLevel } from '../types';
import { prisma } from '../database/client';
import { logger } from './logger';

/**
 * Get the permission level of a guild member
 */
export async function getPermissionLevel(member: GuildMember): Promise<PermissionLevel> {
  // Bot owner/administrator always has highest permission
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return PermissionLevel.Administrator;
  }

  try {
    // Get guild config from database
    const guildConfig = await prisma.guild.findUnique({
      where: { id: member.guild.id },
    });

    // Check if user has admin role
    if (guildConfig?.adminRoleId && member.roles.cache.has(guildConfig.adminRoleId)) {
      return PermissionLevel.Administrator;
    }

    // Check if user has mod role
    if (guildConfig?.modRoleId && member.roles.cache.has(guildConfig.modRoleId)) {
      return PermissionLevel.Moderator;
    }

    // Default to user permission
    return PermissionLevel.User;
  } catch (error) {
    logger.error(`Failed to get permission level for ${member.user.tag}: ${error}`);
    return PermissionLevel.User;
  }
}

/**
 * Check if a member has the required permission level
 */
export async function hasPermission(
  member: GuildMember,
  requiredLevel: PermissionLevel
): Promise<boolean> {
  const memberLevel = await getPermissionLevel(member);
  return memberLevel >= requiredLevel;
}

/**
 * Check if a member has specific Discord permissions
 */
export function hasDiscordPermissions(
  member: GuildMember,
  permissions: PermissionResolvable[]
): boolean {
  return permissions.every((permission) => member.permissions.has(permission));
}

/**
 * Check if the bot has specific Discord permissions in a guild
 */
export function botHasPermissions(
  botMember: GuildMember,
  permissions: PermissionResolvable[]
): boolean {
  return permissions.every((permission) => botMember.permissions.has(permission));
}

/**
 * Check role hierarchy - returns true if executor's highest role is higher than target's
 */
export function checkRoleHierarchy(executor: GuildMember, target: GuildMember): boolean {
  // Guild owner can always act
  if (executor.guild.ownerId === executor.id) {
    return true;
  }

  // Get highest roles
  const executorHighestRole = executor.roles.highest;
  const targetHighestRole = target.roles.highest;

  return executorHighestRole.position > targetHighestRole.position;
}

/**
 * Check if bot can act on target (role hierarchy check)
 */
export function botCanActOn(botMember: GuildMember, target: GuildMember): boolean {
  // Bot can't act on guild owner
  if (target.guild.ownerId === target.id) {
    return false;
  }

  const botHighestRole = botMember.roles.highest;
  const targetHighestRole = target.roles.highest;

  return botHighestRole.position > targetHighestRole.position;
}

/**
 * Check if a user can moderate another user
 * Combines permission level and role hierarchy checks
 */
export async function canModerate(
  executor: GuildMember,
  target: GuildMember,
  requiredLevel: PermissionLevel = PermissionLevel.Moderator
): Promise<{ canModerate: boolean; reason?: string }> {
  // Check if executor is trying to act on themselves
  if (executor.id === target.id) {
    return { canModerate: false, reason: 'You cannot perform this action on yourself.' };
  }

  // Check if target is a bot (optional: you may want to allow this)
  if (target.user.bot) {
    return { canModerate: false, reason: 'You cannot perform this action on a bot.' };
  }

  // Check permission level
  const hasRequiredPermission = await hasPermission(executor, requiredLevel);
  if (!hasRequiredPermission) {
    return { canModerate: false, reason: 'You do not have permission to perform this action.' };
  }

  // Check role hierarchy
  const hasHigherRole = checkRoleHierarchy(executor, target);
  if (!hasHigherRole) {
    return {
      canModerate: false,
      reason: 'You cannot perform this action on a user with a higher or equal role.',
    };
  }

  // Check if bot can act on target
  const botMember = executor.guild.members.me;
  if (!botMember) {
    return { canModerate: false, reason: 'Bot member not found in guild.' };
  }

  const botCanAct = botCanActOn(botMember, target);
  if (!botCanAct) {
    return {
      canModerate: false,
      reason: 'I cannot perform this action on a user with a higher or equal role than mine.',
    };
  }

  return { canModerate: true };
}
