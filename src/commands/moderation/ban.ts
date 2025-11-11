import { SlashCommandBuilder, CommandInteraction, PermissionsBitField, GuildMember } from 'discord.js';
import { Command, PermissionLevel } from '../../types';
import { canModerate } from '../../utils/permissions';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embed';
import { createModLog } from '../../utils/moderation';
import { ERROR_MESSAGES, MOD_ACTIONS } from '../../config/constants';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user to ban').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for banning')
        .setRequired(false)
        .setMaxLength(512)
    )
    .addIntegerOption((option) =>
      option
        .setName('delete_days')
        .setDescription('Number of days of messages to delete (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)
    ),

  permissionLevel: PermissionLevel.Moderator,
  botPermissions: [PermissionsBitField.Flags.BanMembers],
  guildOnly: true,

  async execute(interaction: CommandInteraction) {
    if (!interaction.guild || !interaction.member) {
      return;
    }

    await interaction.deferReply();

    const targetUser = interaction.options.getUser('user', true);
    const reason = interaction.options.get('reason')?.value as string || 'No reason provided';
    const deleteDays = (interaction.options.get('delete_days')?.value as number) || 0;
    const moderator = interaction.user;

    try {
      // Try to fetch member object (might not exist if user not in server)
      let targetMember: GuildMember | null = null;
      try {
        targetMember = await interaction.guild.members.fetch(targetUser.id);
      } catch {
        // User is not in the server, that's fine for bans
      }

      // If user is in server, check permissions
      if (targetMember) {
        const executorMember = interaction.member as GuildMember;
        const moderationCheck = await canModerate(executorMember, targetMember, PermissionLevel.Moderator);

        if (!moderationCheck.canModerate) {
          await interaction.editReply({
            embeds: [createErrorEmbed('Cannot Ban User', moderationCheck.reason || ERROR_MESSAGES.NO_PERMISSION)],
          });
          return;
        }
      }

      // Ban the user
      await interaction.guild.members.ban(targetUser, {
        deleteMessageSeconds: deleteDays * 24 * 60 * 60,
        reason,
      });

      // Log the action
      const caseNumber = await createModLog({
        guild: interaction.guild,
        type: MOD_ACTIONS.BAN,
        target: targetUser,
        moderator,
        reason,
      });

      // Send success message
      await interaction.editReply({
        embeds: [
          createSuccessEmbed(
            'User Banned',
            `**${targetUser.tag}** has been banned from the server.\n**Reason:** ${reason}\n**Case:** #${caseNumber}${deleteDays > 0 ? `\n**Messages Deleted:** Last ${deleteDays} day(s)` : ''}`
          ),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Ban Failed', `Failed to ban user: ${error}`)],
      });
    }
  },
};

export default command;
