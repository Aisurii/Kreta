import { SlashCommandBuilder, CommandInteraction, GuildMember } from 'discord.js';
import { Command, PermissionLevel } from '../../types';
import { canModerate } from '../../utils/permissions';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embed';
import { createModLog, addWarning } from '../../utils/moderation';
import { ERROR_MESSAGES, MOD_ACTIONS } from '../../config/constants';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user to warn').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(true)
        .setMaxLength(512)
    ),

  permissionLevel: PermissionLevel.Moderator,
  guildOnly: true,

  async execute(interaction: CommandInteraction) {
    if (!interaction.guild || !interaction.member) {
      return;
    }

    await interaction.deferReply();

    const targetUser = interaction.options.getUser('user', true);
    const reason = interaction.options.get('reason', true).value as string;
    const moderator = interaction.user;

    try {
      // Fetch member object
      const targetMember = await interaction.guild.members.fetch(targetUser.id);
      const executorMember = interaction.member as GuildMember;

      // Check if user can moderate target
      const moderationCheck = await canModerate(executorMember, targetMember, PermissionLevel.Moderator);
      if (!moderationCheck.canModerate) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Cannot Warn User', moderationCheck.reason || ERROR_MESSAGES.NO_PERMISSION)],
        });
        return;
      }

      // Add warning to database
      await addWarning(interaction.guild.id, targetUser.id, moderator.id, reason);

      // Log the action
      const caseNumber = await createModLog({
        guild: interaction.guild,
        type: MOD_ACTIONS.WARN,
        target: targetUser,
        moderator,
        reason,
      });

      // Send success message
      await interaction.editReply({
        embeds: [
          createSuccessEmbed(
            'User Warned',
            `**${targetUser.tag}** has been warned.\n**Reason:** ${reason}\n**Case:** #${caseNumber}`
          ),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Warn Failed', `Failed to warn user: ${error}`)],
      });
    }
  },
};

export default command;
