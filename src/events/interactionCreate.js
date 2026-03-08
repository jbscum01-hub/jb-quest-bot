const { startSoloHunt } = require('../services/huntService');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction, client);
        return;
      }

      if (interaction.isStringSelectMenu() && interaction.customId === 'start_hunt_select') {
        const professionKey = interaction.values[0];
        await startSoloHunt(interaction, professionKey);
      }
    } catch (error) {
      console.error('interactionCreate error:', error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'เกิดข้อผิดพลาดในการทำงานของบอท',
          ephemeral: true,
        }).catch(() => null);
      } else {
        await interaction.reply({
          content: 'เกิดข้อผิดพลาดในการทำงานของบอท',
          ephemeral: true,
        }).catch(() => null);
      }
    }
  },
};
