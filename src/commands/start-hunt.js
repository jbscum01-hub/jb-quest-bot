const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start-hunt')
    .setDescription('แสดงวิธีเริ่ม Treasure Hunt'),

  async execute(interaction) {
    await interaction.reply({
      content: 'ระบบนี้ใช้ **Panel แยกตามสาย** แล้ว\nไปที่ห้อง panel ของสายที่ต้องการ แล้วกดปุ่ม **เริ่มเควส** ใต้ panel ได้เลย',
      ephemeral: true,
    });
  },
};
