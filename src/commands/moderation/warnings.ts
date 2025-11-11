import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { Command, PermissionLevel } from '../../types';
import { createEmbed, createErrorEmbed } from '../../utils/embed';
import { getWarnings } from '../../utils/moderation';
import { getDiscordTimestamp } from '../../utils/time';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a user')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user to check warnings for').setRequired(true)
    ),

  permissionLevel: PermissionLevel.Moderator,
  guildOnly: true,

  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) {
      return;
    }

    await interaction.deferReply();

    const targetUser = interaction.options.getUser('user', true);

    try {
      // Get user's warnings
      const warnings = await getWarnings(interaction.guild.id, targetUser.id);

      if (warnings.length === 0) {
        await interaction.editReply({
          embeds: [
            createEmbed({
              title: `Warnings for ${targetUser.tag}`,
              description: 'This user has no warnings.',
              color: 0x57f287, // Green
              timestamp: true,
            }).setThumbnail(targetUser.displayAvatarURL()),
          ],
        });
        return;
      }

      // Create warning list
      const warningList = warnings
        .slice(0, 10) // Show only last 10 warnings
        .map((warning, index) => {
          const moderator = `<@${warning.moderatorId}>`;
          const timestamp = getDiscordTimestamp(warning.timestamp, 'R');
          return `**${index + 1}.** ${timestamp}\n**Moderator:** ${moderator}\n**Reason:** ${warning.reason}`;
        })
        .join('\n\n');

      const embed = createEmbed({
        title: `⚠️ Warnings for ${targetUser.tag}`,
        description: `**Total Warnings:** ${warnings.length}\n\n${warningList}`,
        color: 0xfee75c, // Yellow
        timestamp: true,
      });

      if (warnings.length > 10) {
        embed.setFooter({ text: `Showing last 10 of ${warnings.length} warnings` });
      }

      embed.setThumbnail(targetUser.displayAvatarURL());

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', `Failed to fetch warnings: ${error}`)],
      });
    }
  },
};

export default command;
