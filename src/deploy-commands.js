const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { CONFIG } = require('./config');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(CONFIG.discord.token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    await rest.put(
      Routes.applicationGuildCommands(CONFIG.discord.clientId, CONFIG.discord.guildId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
})();
