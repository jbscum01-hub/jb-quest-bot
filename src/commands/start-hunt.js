const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const { getEnabledProfessions } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start-hunt')
    .setDescription('เริ่มสร้าง ticket สำหรับ Treasure Hunt'),

  async execute(interaction) {
    const professions = getEnabledProfessions();

    if (!professions.length) {
      await interaction.reply({
        content: 'ยังไม่มีสายที่เปิดใช้งาน',
        ephemeral: true,
      });
      return;
    }

    const defaultProfession = professions[0];

    const modal = new ModalBuilder()
      .setCustomId('start_hunt_modal')
      .setTitle('Start Treasure Hunt');

    const professionInput = new TextInputBuilder()
      .setCustomId('profession_key')
      .setLabel('profession key')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder('เช่น medic')
      .setValue(defaultProfession.key);

    const teamNameInput = new TextInputBuilder()
      .setCustomId('team_name')
      .setLabel('ชื่อทีม')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder('เช่น Alpha');

    modal.addComponents(
      new ActionRowBuilder().addComponents(professionInput),
      new ActionRowBuilder().addComponents(teamNameInput),
    );

    await interaction.showModal(modal);
  },
};
