const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { CONFIG, getEnabledProfessions } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('professions')
    .setDescription('ดูรายชื่อสาย Treasure Hunt ที่เปิดใช้งาน'),

  async execute(interaction) {
    const professions = getEnabledProfessions();

    const lines = professions.map((profession, index) => {
      return [
        `${index + 1}. ${profession.displayName}`,
        `key: \`${profession.key}\``,
        `ทีม: ${profession.minTeamSize}-${profession.maxTeamSize} คน`,
      ].join(' • ');
    });

    const embed = new EmbedBuilder()
      .setTitle('Treasure Hunt Professions')
      .setDescription(lines.join('\n') || 'ยังไม่มีสายที่เปิดใช้งาน')
      .setFooter({ text: `${CONFIG.settings.cooldownType} • abandoned = cancel` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
