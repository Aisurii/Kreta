import { Interaction, PermissionsBitField } from 'discord.js';
import { Event } from '../types';
import { BotClient } from '../core/client';
import { logger } from '../utils/logger';
import { hasPermission, botHasPermissions } from '../utils/permissions';
import { createErrorEmbed } from '../utils/embed';
import { ERROR_MESSAGES } from '../config/constants';

const event: Event<'interactionCreate'> = {
  name: 'interactionCreate',
  async execute(interaction: Interaction) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      await handleCommand(interaction);
    }

    // Handle autocomplete
    if (interaction.isAutocomplete()) {
      await handleAutocomplete(interaction);
    }
  },
};

async function handleCommand(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;

  const client = interaction.client as BotClient;
  const command = client.commands.get(interaction.commandName);

  if (!command) {
    logger.warn(`Command ${interaction.commandName} not found`);
    return;
  }

  // Check if command is guild-only
  if (command.guildOnly && !interaction.inGuild()) {
    await interaction.reply({
      embeds: [createErrorEmbed('Error', 'This command can only be used in a server.')],
      ephemeral: true,
    });
    return;
  }

  // Guild-specific checks
  if (interaction.inGuild() && interaction.guild && interaction.member) {
    const member = await interaction.guild.members.fetch(interaction.user.id);

    // Check user permissions
    const hasRequiredPermission = await hasPermission(member, command.permissionLevel);
    if (!hasRequiredPermission) {
      await interaction.reply({
        embeds: [createErrorEmbed('No Permission', ERROR_MESSAGES.NO_PERMISSION)],
        ephemeral: true,
      });
      return;
    }

    // Check bot permissions
    const botMember = interaction.guild.members.me;
    if (botMember && command.botPermissions) {
      const hasBotPermissions = botHasPermissions(botMember, command.botPermissions);
      if (!hasBotPermissions) {
        const missingPerms = command.botPermissions
          .filter((perm) => !botMember.permissions.has(perm))
          .map((perm) => `\`${new PermissionsBitField(perm).toArray().join(', ')}\``)
          .join(', ');

        await interaction.reply({
          embeds: [
            createErrorEmbed(
              'Bot Missing Permissions',
              `${ERROR_MESSAGES.BOT_NO_PERMISSION}\n\nMissing: ${missingPerms}`
            ),
          ],
          ephemeral: true,
        });
        return;
      }
    }
  }

  // Check cooldown
  if (command.cooldown) {
    const remainingCooldown = client.isOnCooldown(interaction.user.id, command.data.name);
    if (remainingCooldown) {
      await interaction.reply({
        embeds: [
          createErrorEmbed(
            'Cooldown',
            `Please wait ${remainingCooldown.toFixed(1)} second(s) before using this command again.`
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    // Set cooldown
    client.setCooldown(interaction.user.id, command.data.name, command.cooldown);
  }

  // Execute command
  try {
    logger.debug(
      `${interaction.user.tag} (${interaction.user.id}) used /${command.data.name} in ${interaction.guild?.name || 'DM'}`
    );
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Error executing command ${command.data.name}: ${error}`);

    const errorEmbed = createErrorEmbed(
      'Command Error',
      ERROR_MESSAGES.UNKNOWN_ERROR
    );

    // Reply or follow up depending on interaction state
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
}

async function handleAutocomplete(interaction: Interaction) {
  if (!interaction.isAutocomplete()) return;

  const client = interaction.client as BotClient;
  const command = client.commands.get(interaction.commandName);

  if (!command || !command.autocomplete) {
    return;
  }

  try {
    await command.autocomplete(interaction);
  } catch (error) {
    logger.error(`Error executing autocomplete for ${command.data.name}: ${error}`);
  }
}

export default event;
