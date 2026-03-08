const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { CONFIG } = require('../config');
const { getEnabledProfessionsFromDb } = require('../services/professionService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('professions')
    .setDescription('ดูรายชื่อสาย Treasure Hunt ที่เปิดใช้งาน'),

  async execute(interaction) {
    const professions = await getEnabledProfessionsFromDb();

    const lines = professions.map((profession, index) => {
      return [
        `${index + 1}. ${profession.displayName}`,
        `key: \`${profession.key}\``,
        profession.panelChannelId ? `panel: <#${profession.panelChannelId}>` : 'panel: `ยังไม่ตั้ง`',
        'โหมด: เล่นเดี่ยว',
      ].join(' • ');
    });

    const embed = new EmbedBuilder()
      .setTitle('Treasure Hunt Professions')
      .setDescription(lines.join('\n') || 'ยังไม่มีสายที่เปิดใช้งาน')
      .setFooter({ text: `${CONFIG.settings.cooldownType} • abandoned = restart allowed • solo only` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
