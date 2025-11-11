import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command, PermissionLevel } from '../../types';
import { createEmbed } from '../../utils/embed';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency and response time'),

  permissionLevel: PermissionLevel.User,

  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({
      embeds: [createEmbed({ description: '🏓 Pinging...' })],
      fetchReply: true,
    });

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    const embed = createEmbed({
      title: '🏓 Pong!',
      fields: [
        { name: 'Bot Latency', value: `${latency}ms`, inline: true },
        { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
      ],
      timestamp: true,
    });

    await interaction.editReply({ embeds: [embed] });
  },
};

export default command;
