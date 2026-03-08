const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const { getEnabledProfessions } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start-hunt')
    .setDescription('เริ่มสร้าง ticket สำหรับ Treasure Hunt แบบเล่นเดี่ยว'),

  async execute(interaction) {
    const professions = getEnabledProfessions();

    if (!professions.length) {
      await interaction.reply({
        content: 'ยังไม่มีสายที่เปิดใช้งาน',
        ephemeral: true,
      });
      return;
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId('start_hunt_select')
      .setPlaceholder('เลือกสายอาชีพที่ต้องการเริ่ม')
      .addOptions(
        professions.map((profession) => ({
          label: profession.name,
          description: `${profession.displayName} • เล่นเดี่ยว`,
          value: profession.key,
          emoji: profession.emoji,
        })),
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: 'เลือกระบบ Treasure Hunt ที่ต้องการเริ่มจาก dropdown ด้านล่าง',
      components: [row],
      ephemeral: true,
    });
  },
};
