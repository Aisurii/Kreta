import { SlashCommandBuilder, CommandInteraction, PermissionsBitField, GuildMember } from 'discord.js';
import { Command, PermissionLevel } from '../../types';
import { canModerate } from '../../utils/permissions';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embed';
import { createModLog } from '../../utils/moderation';
import { ERROR_MESSAGES, MOD_ACTIONS } from '../../config/constants';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user to kick').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for kicking')
        .setRequired(false)
        .setMaxLength(512)
    ),

  permissionLevel: PermissionLevel.Moderator,
  botPermissions: [PermissionsBitField.Flags.KickMembers],
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
          embeds: [createErrorEmbed('Cannot Kick User', moderationCheck.reason || ERROR_MESSAGES.NO_PERMISSION)],
        });
        return;
      }

      // Kick the user
      await targetMember.kick(reason);

      // Log the action
      const caseNumber = await createModLog({
        guild: interaction.guild,
        type: MOD_ACTIONS.KICK,
        target: targetUser,
        moderator,
        reason,
      });

      // Send success message
      await interaction.editReply({
        embeds: [
          createSuccessEmbed(
            'User Kicked',
            `**${targetUser.tag}** has been kicked from the server.\n**Reason:** ${reason}\n**Case:** #${caseNumber}`
          ),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Kick Failed', `Failed to kick user: ${error}`)],
      });
    }
  },
};

export default command;
