const path = require('path');
const fs = require('fs');

function registerCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (!command.data || !command.execute) {
      console.warn(`⚠️ Invalid command file: ${file}`);
      continue;
    }

    client.commands.set(command.data.name, command);
  }
}

module.exports = { registerCommands };
