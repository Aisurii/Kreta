import { SlashCommandBuilder, CommandInteraction, PermissionsBitField, GuildMember } from 'discord.js';
import { Command, PermissionLevel } from '../../types';
import { canModerate } from '../../utils/permissions';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embed';
import { createModLog } from '../../utils/moderation';
import { ERROR_MESSAGES, MOD_ACTIONS } from '../../config/constants';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a user (remove timeout)')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user to unmute').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for unmuting')
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
    const reason = interaction.options.get('reason')?.value as string || 'No reason provided';
    const moderator = interaction.user;

    try {
      // Fetch member object
      const targetMember = await interaction.guild.members.fetch(targetUser.id);
      const executorMember = interaction.member as GuildMember;

      // Check if user can moderate target
      const moderationCheck = await canModerate(executorMember, targetMember, PermissionLevel.Moderator);
      if (!moderationCheck.canModerate) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Cannot Unmute User', moderationCheck.reason || ERROR_MESSAGES.NO_PERMISSION)],
        });
        return;
      }

      // Check if user is actually muted
      if (!targetMember.communicationDisabledUntil || targetMember.communicationDisabledUntil <= new Date()) {
        await interaction.editReply({
          embeds: [createErrorEmbed('User Not Muted', 'This user is not currently muted.')],
        });
        return;
      }

      // Unmute the user (remove timeout)
      await targetMember.timeout(null, reason);

      // Log the action
      const caseNumber = await createModLog({
        guild: interaction.guild,
        type: MOD_ACTIONS.UNMUTE,
        target: targetUser,
        moderator,
        reason,
      });

      // Send success message
      await interaction.editReply({
        embeds: [
          createSuccessEmbed(
            'User Unmuted',
            `**${targetUser.tag}** has been unmuted.\n**Reason:** ${reason}\n**Case:** #${caseNumber}`
          ),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Unmute Failed', `Failed to unmute user: ${error}`)],
      });
    }
  },
};

export default command;
