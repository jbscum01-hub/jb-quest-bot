const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { CONFIG, getRequiredEnvWarnings } = require('./config');
const { registerEvents } = require('./handlers/registerEvents');
const { registerCommands } = require('./handlers/registerCommands');
const { query, pool } = require('./db/pool');

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
  try {
    await query('select 1');
    console.log('✅ Connected to Neon PostgreSQL');
  } catch (error) {
    console.error('❌ Failed to connect to Neon PostgreSQL:', error.message);
  }

  console.log(`✅ ${CONFIG.app.name} v${CONFIG.app.version} logged in as ${client.user.tag}`);
});

async function shutdown(signal) {
  console.log(`Received ${signal}, closing bot...`);
  await pool.end().catch(() => null);
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

client.login(CONFIG.discord.token);
