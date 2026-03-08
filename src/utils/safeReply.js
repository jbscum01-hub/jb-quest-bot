async function safeReply(interaction, content) {
  if (interaction.replied || interaction.deferred) {
    return interaction.followUp({ content, ephemeral: true });
  }
  return interaction.reply({ content, ephemeral: true });
}

module.exports = { safeReply };
