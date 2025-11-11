import { SlashCommandBuilder, CommandInteraction, PermissionsBitField, GuildMember } from 'discord.js';
import { Command, PermissionLevel } from '../../types';
import { canModerate } from '../../utils/permissions';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embed';
import { createModLog } from '../../utils/moderation';
import { parseDuration, formatDuration } from '../../utils/time';
import { ERROR_MESSAGES, MOD_ACTIONS, MOD_CONFIG } from '../../config/constants';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user (timeout)')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user to mute').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('duration')
        .setDescription('Duration (e.g., 10m, 2h, 1d)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for muting')
        .setRequired(false)
        .setMaxLength(512)
    ),

  permissionLevel: PermissionLevel.Moderator,
  botPermissions: [PermissionsBitField.Flags.ModerateMembers],
  guildOnly: true,

  async execute(interaction: CommandInteraction) {
    if (!interaction.guild || !interaction.member) {
      return;
    }

    await interaction.deferReply();

    const targetUser = interaction.options.getUser('user', true);
    const durationStr = interaction.options.get('duration', true).value as string;
    const reason = interaction.options.get('reason')?.value as string || 'No reason provided';
    const moderator = interaction.user;

    // Parse duration
    const durationMs = parseDuration(durationStr);
    if (!durationMs) {
      await interaction.editReply({
        embeds: [
          createErrorEmbed(
            'Invalid Duration',
            'Please provide a valid duration (e.g., 10m, 2h, 1d).\nFormat: `<number><unit>` where unit is s, m, h, d, or w'
          ),
        ],
      });
      return;
    }

    // Check max duration (Discord limit is 28 days)
    const maxDuration = MOD_CONFIG.MAX_MUTE_DAYS * 24 * 60 * 60 * 1000;
    if (durationMs > maxDuration) {
      await interaction.editReply({
        embeds: [
          createErrorEmbed(
            'Duration Too Long',
            `Maximum mute duration is ${MOD_CONFIG.MAX_MUTE_DAYS} days.`
          ),
        ],
      });
      return;
    }

    try {
      // Fetch member object
      const targetMember = await interaction.guild.members.fetch(targetUser.id);
      const executorMember = interaction.member as GuildMember;

      // Check if user can moderate target
      const moderationCheck = await canModerate(executorMember, targetMember, PermissionLevel.Moderator);
      if (!moderationCheck.canModerate) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Cannot Mute User', moderationCheck.reason || ERROR_MESSAGES.NO_PERMISSION)],
        });
        return;
      }

      // Check if user is already muted
      if (targetMember.communicationDisabledUntil && targetMember.communicationDisabledUntil > new Date()) {
        await interaction.editReply({
          embeds: [createErrorEmbed('User Already Muted', 'This user is already muted.')],
        });
        return;
      }

      // Mute the user (timeout)
      await targetMember.timeout(durationMs, reason);

      const durationFormatted = formatDuration(durationMs);

      // Log the action
      const caseNumber = await createModLog({
        guild: interaction.guild,
        type: MOD_ACTIONS.MUTE,
        target: targetUser,
        moderator,
        reason,
        duration: Math.floor(durationMs / 1000), // Convert to seconds
      });

      // Send success message
      await interaction.editReply({
        embeds: [
          createSuccessEmbed(
            'User Muted',
            `**${targetUser.tag}** has been muted.\n**Duration:** ${durationFormatted}\n**Reason:** ${reason}\n**Case:** #${caseNumber}`
          ),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Mute Failed', `Failed to mute user: ${error}`)],
      });
    }
  },
};

export default command;
