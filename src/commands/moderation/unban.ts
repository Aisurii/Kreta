import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import { Command, PermissionLevel } from '../../types';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embed';
import { createModLog } from '../../utils/moderation';
import { MOD_ACTIONS } from '../../config/constants';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server')
    .addStringOption((option) =>
      option
        .setName('user_id')
        .setDescription('The ID of the user to unban')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for unbanning')
        .setRequired(false)
        .setMaxLength(512)
    ),

  permissionLevel: PermissionLevel.Moderator,
  botPermissions: [PermissionsBitField.Flags.BanMembers],
  guildOnly: true,

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      return;
    }

    await interaction.deferReply();

    const userId = interaction.options.get('user_id', true).value as string;
    const reason = interaction.options.get('reason')?.value as string || 'No reason provided';
    const moderator = interaction.user;

    // Validate user ID format (Discord snowflake)
    if (!/^\d{17,19}$/.test(userId)) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Invalid User ID', 'Please provide a valid Discord user ID.')],
      });
      return;
    }

    try {
      // Check if user is actually banned
      const bans = await interaction.guild.bans.fetch();
      const bannedUser = bans.get(userId);

      if (!bannedUser) {
        await interaction.editReply({
          embeds: [createErrorEmbed('User Not Banned', 'This user is not banned.')],
        });
        return;
      }

      // Unban the user
      await interaction.guild.members.unban(userId, reason);

      // Fetch user info
      const targetUser = await interaction.client.users.fetch(userId);

      // Log the action
      const caseNumber = await createModLog({
        guild: interaction.guild,
        type: MOD_ACTIONS.UNBAN,
        target: targetUser,
        moderator,
        reason,
      });

      // Send success message
      await interaction.editReply({
        embeds: [
          createSuccessEmbed(
            'User Unbanned',
            `**${targetUser.tag}** has been unbanned from the server.\n**Reason:** ${reason}\n**Case:** #${caseNumber}`
          ),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Unban Failed', `Failed to unban user: ${error}`)],
      });
    }
  },
};

export default command;
