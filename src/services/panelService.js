const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { CONFIG } = require('../config');
const {
  getEnabledProfessionsFromDb,
  getProfessionByKeyFromDb,
  updatePanelMapping,
} = require('./professionService');

function buildProfessionPanelEmbed(profession) {
  return new EmbedBuilder()
    .setColor(profession.color || 0x00aeff)
    .setTitle(`🗺 TREASURE HUNT : ${profession.missionTitle}`)
    .setDescription([
      '━━━━━━━━━━━━━━━━━━━━',
      '',
      `สาย : ${profession.name} | ระดับ : ${profession.levelText}`,
      `ความยาก : ${profession.difficultyStars}`,
      '',
      '📜 ภารกิจ:',
      'ตามหา Treasure Chest ที่ซ่อนอยู่ในโลกของ SCUM',
      'โดยใช้ Clue ที่ได้รับทีละขั้น',
      '',
      '🔎 ความคืบหน้า:',
      'Clue 1 🔒',
      'Clue 2 🔒',
      'Clue 3 🔒',
      'Clue 4 🔒',
      'Final Mission 🔒',
      '',
      '📍 วิธีเริ่มภารกิจ:',
      'กดปุ่มด้านล่างเพื่อเปิด Ticket แล้วรอแอดมินอนุมัติ',
      '',
      '🎖 ปลดล็อก:',
      `Role : ${profession.rewardText}`,
      '━━━━━━━━━━━━━━━━━━━━',
    ].join('\n'));
}

function buildProfessionPanelComponents(profession) {
  const button = new ButtonBuilder()
    .setCustomId(`${CONFIG.ui.openTicketPrefix}${profession.key}`)
    .setLabel('เปิด Ticket')
    .setStyle(ButtonStyle.Success)
    .setEmoji('🎫');

  return [new ActionRowBuilder().addComponents(button)];
}

function buildAdminControlEmbed(professions) {
  const lines = professions.map((profession) => {
    const panel = profession.panelChannelId ? `<#${profession.panelChannelId}>` : '`ยังไม่ตั้ง panel_channel_id`';
    const submit = profession.submissionChannelId ? `<#${profession.submissionChannelId}>` : '`ยังไม่ตั้ง submission_channel_id`';
    return `${profession.emoji} **${profession.key}** → panel ${panel} | log ${submit}`;
  });

  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🛠️ Treasure Hunt Admin Control')
    .setDescription([
      'ห้องนี้ใช้ควบคุมการสร้างและรีเฟรช Panel ของทุกสาย',
      '',
      '• สร้างทุก Panel',
      '• รีเฟรชทุก Panel',
      '• เช็กสถานะ',
      '',
      lines.join('\n') || 'ยังไม่มี profession ในฐานข้อมูล',
    ].join('\n'))
    .setFooter({ text: 'Admin only' });
}

function buildAdminControlComponents(professions) {
  const rows = [];
  rows.push(new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(CONFIG.ui.adminCreateAllPanels).setLabel('สร้างทุก Panel').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(CONFIG.ui.adminRefreshAllPanels).setLabel('รีเฟรชทุก Panel').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(CONFIG.ui.adminCheckPanelStatus).setLabel('เช็กสถานะ').setStyle(ButtonStyle.Secondary),
  ));

  for (let i = 0; i < professions.length; i += 5) {
    const chunk = professions.slice(i, i + 5);
    rows.push(new ActionRowBuilder().addComponents(
      ...chunk.map((profession) => new ButtonBuilder()
        .setCustomId(`${CONFIG.ui.adminCreatePanelPrefix}${profession.key}`)
        .setLabel(profession.key)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(profession.emoji)),
    ));
  }

  return rows;
}

async function upsertProfessionPanel(guild, profession, { forceNewMessage = false } = {}) {
  if (!profession?.panelChannelId) {
    return { ok: false, professionKey: profession?.key, reason: 'missing panel_channel_id' };
  }

  const channel = guild.channels.cache.get(profession.panelChannelId)
    || await guild.channels.fetch(profession.panelChannelId).catch(() => null);

  if (!channel || !channel.isTextBased()) {
    return { ok: false, professionKey: profession.key, reason: 'panel channel not found or not text based' };
  }

  const embed = buildProfessionPanelEmbed(profession);
  const components = buildProfessionPanelComponents(profession);

  let message = null;
  if (!forceNewMessage && profession.panelMessageId) {
    message = await channel.messages.fetch(profession.panelMessageId).catch(() => null);
  }

  if (message) {
    await message.edit({ embeds: [embed], components });
    await updatePanelMapping(profession.key, channel.id, message.id);
    return { ok: true, professionKey: profession.key, action: 'updated', channelId: channel.id, messageId: message.id };
  }

  const sent = await channel.send({ embeds: [embed], components });
  await updatePanelMapping(profession.key, channel.id, sent.id);
  return { ok: true, professionKey: profession.key, action: 'created', channelId: channel.id, messageId: sent.id };
}

async function createOrRefreshAllPanels(guild, options = {}) {
  const professions = await getEnabledProfessionsFromDb();
  const results = [];
  for (const profession of professions) {
    // eslint-disable-next-line no-await-in-loop
    results.push(await upsertProfessionPanel(guild, profession, options));
  }
  return results;
}

async function createOrRefreshSinglePanel(guild, professionKey, options = {}) {
  const profession = await getProfessionByKeyFromDb(professionKey);
  if (!profession || !profession.enabled) {
    return { ok: false, professionKey, reason: 'profession not found or disabled' };
  }
  return upsertProfessionPanel(guild, profession, options);
}

module.exports = {
  buildAdminControlEmbed,
  buildAdminControlComponents,
  buildProfessionPanelEmbed,
  buildProfessionPanelComponents,
  createOrRefreshAllPanels,
  createOrRefreshSinglePanel,
};
