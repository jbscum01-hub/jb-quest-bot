const { SlashCommandBuilder } = require('discord.js');
const { safeReply } = require('../utils/safeReply');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start-hunt')
    .setDescription('แนะนำการเริ่ม Treasure Hunt'),

  async execute(interaction) {
    await safeReply(interaction, 'ระบบนี้เริ่มจากปุ่ม **เปิด Ticket** ในห้อง panel ของแต่ละสายแล้ว');
  },
};
