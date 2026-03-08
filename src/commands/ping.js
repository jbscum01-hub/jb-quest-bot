const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('เช็กว่าบอทออนไลน์อยู่ไหม'),

  async execute(interaction) {
    await interaction.reply({ content: 'pong', ephemeral: true });
  },
};
