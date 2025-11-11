import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command, PermissionLevel } from '../../types';
import { createEmbed, createErrorEmbed } from '../../utils/embed';
import { prisma } from '../../database/client';
import { getDiscordTimestamp } from '../../utils/time';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('modlogs')
    .setDescription('View moderation logs')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Filter by user')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Filter by action type')
        .setRequired(false)
        .addChoices(
          { name: 'Warn', value: 'warn' },
          { name: 'Kick', value: 'kick' },
          { name: 'Ban', value: 'ban' },
          { name: 'Unban', value: 'unban' },
          { name: 'Mute', value: 'mute' },
          { name: 'Unmute', value: 'unmute' }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName('case')
        .setDescription('View a specific case number')
        .setMinValue(1)
        .setRequired(false)
    ),

  permissionLevel: PermissionLevel.Moderator,
  guildOnly: true,

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      return;
    }

    await interaction.deferReply();

    const targetUser = interaction.options.getUser('user');
    const actionType = interaction.options.get('type')?.value as string;
    const caseNumber = interaction.options.get('case')?.value as number;

    try {
      // Build query filters
      const where: any = { guildId: interaction.guild.id };
      if (targetUser) where.targetId = targetUser.id;
      if (actionType) where.type = actionType;
      if (caseNumber) where.caseNumber = caseNumber;

      // Fetch mod logs
      const logs = await prisma.modLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: caseNumber ? 1 : 10, // If specific case, show only that one; otherwise show last 10
      });

      if (logs.length === 0) {
        await interaction.editReply({
          embeds: [
            createEmbed({
              title: '📋 Moderation Logs',
              description: 'No moderation logs found matching the criteria.',
              timestamp: true,
            }),
          ],
        });
        return;
      }

      // If viewing a specific case, show detailed view
      if (caseNumber && logs.length === 1) {
        const log = logs[0];
        const target = await interaction.client.users.fetch(log.targetId);
        const moderator = await interaction.client.users.fetch(log.moderatorId);

        const embed = createEmbed({
          title: `📋 Case #${log.caseNumber}`,
          fields: [
            { name: 'Action', value: log.type.toUpperCase(), inline: true },
            { name: 'Status', value: log.status, inline: true },
            { name: 'Target', value: `${target.tag} (${target.id})`, inline: false },
            { name: 'Moderator', value: `${moderator.tag}`, inline: false },
            { name: 'Reason', value: log.reason || 'No reason provided', inline: false },
            { name: 'Date', value: getDiscordTimestamp(log.timestamp, 'F'), inline: false },
          ],
          timestamp: true,
        });

        if (log.duration) {
          embed.addFields({ name: 'Duration', value: `${log.duration} seconds`, inline: true });
        }

        if (log.evidence) {
          embed.addFields({ name: 'Evidence', value: log.evidence, inline: false });
        }

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Create log list
      const logList = await Promise.all(
        logs.map(async (log) => {
          const target = await interaction.client.users.fetch(log.targetId).catch(() => null);
          const moderator = await interaction.client.users.fetch(log.moderatorId).catch(() => null);

          const targetDisplay = target ? target.tag : `Unknown User (${log.targetId})`;
          const moderatorDisplay = moderator ? moderator.tag : `Unknown (${log.moderatorId})`;
          const timestamp = getDiscordTimestamp(log.timestamp, 'R');

          return `**Case #${log.caseNumber}** | ${log.type.toUpperCase()} | ${timestamp}\n` +
                 `**Target:** ${targetDisplay} | **Mod:** ${moderatorDisplay}\n` +
                 `**Reason:** ${log.reason.substring(0, 100)}${log.reason.length > 100 ? '...' : ''}`;
        })
      );

      let title = '📋 Moderation Logs';
      if (targetUser) title += ` for ${targetUser.tag}`;
      if (actionType) title += ` (${actionType})`;

      const embed = createEmbed({
        title,
        description: logList.join('\n\n'),
        timestamp: true,
      });

      embed.setFooter({ text: 'Showing last 10 logs. Use /modlogs case:<number> for details.' });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', `Failed to fetch mod logs: ${error}`)],
      });
    }
  },
};

export default command;
