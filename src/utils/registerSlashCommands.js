const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const { CONFIG } = require('../config');

async function registerSlashCommands() {
  if (!CONFIG.discord.token || !CONFIG.discord.clientId || !CONFIG.discord.guildId) {
    console.warn('⚠️ Skip slash command registration: missing DISCORD_TOKEN, CLIENT_ID, or GUILD_ID');
    return;
  }

  const commands = [];
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command?.data) {
      commands.push(command.data.toJSON());
    }
  }

  const rest = new REST({ version: '10' }).setToken(CONFIG.discord.token);
  console.log('Started refreshing application (/) commands...');

  await rest.put(
    Routes.applicationGuildCommands(CONFIG.discord.clientId, CONFIG.discord.guildId),
    { body: commands },
  );

  console.log('Successfully reloaded application (/) commands.');
}

module.exports = { registerSlashCommands };
