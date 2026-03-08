const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { CONFIG, getRequiredEnvWarnings } = require('./config');
const { registerEvents } = require('./handlers/registerEvents');
const { registerCommands } = require('./handlers/registerCommands');

const missingEnv = getRequiredEnvWarnings();
if (missingEnv.length) {
  console.warn(`⚠️ Missing required env: ${missingEnv.join(', ')}`);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();

registerCommands(client);
registerEvents(client);

client.once('ready', async () => {
  console.log(`✅ ${CONFIG.app.name} v${CONFIG.app.version} logged in as ${client.user.tag}`);
});

client.login(CONFIG.discord.token);
