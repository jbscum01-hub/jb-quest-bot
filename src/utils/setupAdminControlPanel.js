const { buildAdminControlComponents, buildAdminControlEmbed } = require('../services/panelService');
const { getEnabledProfessionsFromDb } = require('../services/professionService');
const { CONFIG } = require('../config');

function hasAdminControlSignature(message) {
  const firstRow = message.components?.[0];
  const firstButton = firstRow?.components?.[0];
  return firstButton?.customId === CONFIG.ui.adminCreateAllPanels;
}

async function findExistingAdminPanel(channel, botUserId) {
  const messages = await channel.messages.fetch({ limit: 20 }).catch(() => null);
  if (!messages) return null;

  return messages.find((message) => message.author?.id === botUserId && hasAdminControlSignature(message)) || null;
}

async function setupAdminControlPanel(client) {
  const channelId = CONFIG.discord.channels.adminControlChannelId;
  if (!channelId) {
    console.warn('⚠️ ADMIN_CONTROL_CHANNEL_ID is not set, skip admin panel setup');
    return;
  }

  const channel = client.channels.cache.get(channelId) || await client.channels.fetch(channelId).catch(() => null);
  if (!channel || !channel.isTextBased()) {
    console.warn('⚠️ Admin control channel not found or not text based');
    return;
  }

  const professions = await getEnabledProfessionsFromDb();
  const embed = buildAdminControlEmbed(professions);
  const components = buildAdminControlComponents(professions);

  const existing = await findExistingAdminPanel(channel, client.user.id);
  if (existing) {
    await existing.edit({ embeds: [embed], components }).catch(() => null);
    console.log('✅ Admin control panel refreshed');
    return;
  }

  await channel.send({ embeds: [embed], components });
  console.log('✅ Admin control panel created');
}

module.exports = { setupAdminControlPanel };
