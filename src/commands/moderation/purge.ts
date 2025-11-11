import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField, TextChannel } from 'discord.js';
import { Command, PermissionLevel } from '../../types';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embed';
import { createModLog } from '../../utils/moderation';
import { MOD_ACTIONS, MOD_CONFIG } from '../../config/constants';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setMinValue(1)
        .setMaxValue(MOD_CONFIG.MAX_PURGE_COUNT)
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Only delete messages from this user')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for purging')
        .setRequired(false)
        .setMaxLength(512)
    ),

  permissionLevel: PermissionLevel.Moderator,
  botPermissions: [PermissionsBitField.Flags.ManageMessages],
  guildOnly: true,
  cooldown: 5, // 5 second cooldown to prevent abuse

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild || !interaction.channel) {
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const amount = interaction.options.get('amount', true).value as number;
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.get('reason')?.value as string || 'No reason provided';
    const moderator = interaction.user;

    // Check if channel is a text channel
    if (!(interaction.channel instanceof TextChannel)) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'This command can only be used in text channels.')],
      });
      return;
    }

    try {
      const channel = interaction.channel as TextChannel;

      // Fetch messages
      let messages = await channel.messages.fetch({ limit: amount + 1 }); // +1 to account for command message

      // Filter by user if specified
      if (targetUser) {
        messages = messages.filter((msg) => msg.author.id === targetUser.id);
      }

      // Filter out messages older than 14 days (Discord limitation)
      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const recentMessages = messages.filter((msg) => msg.createdTimestamp > twoWeeksAgo);

      if (recentMessages.size === 0) {
        await interaction.editReply({
          embeds: [
            createErrorEmbed(
              'No Messages',
              'No messages found to delete. Messages older than 14 days cannot be bulk deleted.'
            ),
          ],
        });
        return;
      }

      // Bulk delete
      const deleted = await channel.bulkDelete(recentMessages, true);

      // Log the action
      await createModLog({
        guild: interaction.guild,
        type: MOD_ACTIONS.PURGE,
        target: targetUser || interaction.user, // If no specific user, log as moderator's action
        moderator,
        reason: `Purged ${deleted.size} message(s)${targetUser ? ` from ${targetUser.tag}` : ''}: ${reason}`,
      });

      // Send success message
      const successMsg = await interaction.editReply({
        embeds: [
          createSuccessEmbed(
            'Messages Purged',
            `Successfully deleted **${deleted.size}** message(s)${targetUser ? ` from **${targetUser.tag}**` : ''}.`
          ),
        ],
      });

      // Auto-delete success message after 5 seconds
      setTimeout(async () => {
        try {
          await successMsg.delete();
        } catch {
          // Message might already be deleted
        }
      }, 5000);
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Purge Failed', `Failed to purge messages: ${error}`)],
      });
    }
  },
};

export default command;
