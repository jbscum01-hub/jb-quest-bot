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
    .setTitle(`${profession.emoji} Treasure Hunt • ${profession.displayName}`)
    .setDescription([
      `ยินดีต้อนรับสู่เส้นทางของ${profession.name}`,
      '',
      'ภารกิจนี้เป็น Treasure Hunt แบบเล่นเดี่ยว ผู้เล่นจะต้องตามหาเบาะแสของสายนี้ทีละขั้น',
      'จนไปถึงตำแหน่งสุดท้ายที่ซ่อนสมบัติไว้',
      '',
      '╭ วิธีการเล่น',
      '├ กดปุ่ม **เริ่มเควส** ด้านล่าง',
      '├ ระบบจะสร้าง ticket ส่วนตัวให้คุณอัตโนมัติ',
      '├ ภายใน ticket จะมี clue ส่งตามลำดับ',
      '└ ไปให้ถึงจุดหมายสุดท้ายเพื่อพิชิตเควสนี้',
      '',
      '╭ สิ่งที่ควรรู้',
      '├ เล่นได้แบบเดี่ยวเท่านั้น',
      '├ หาก **abandoned** สามารถเริ่มใหม่ได้',
      '├ หาก **completed** แล้ว จะเริ่มซ้ำไม่ได้',
      '└ ห้ามส่งต่อหรือเผยแพร่ clue ของสายนี้ให้ผู้อื่น',
      '',
      '╭ รางวัลเมื่อสำเร็จ',
      `├ ได้รับ Role: ${profession.displayName}`,
      '└ บันทึกความสำเร็จลงในระบบของเซิร์ฟเวอร์',
      '',
      'กดปุ่มด้านล่างเมื่อคุณพร้อมเริ่มภารกิจ',
    ].join('\n'))
    .setFooter({ text: 'Treasure Hunt System • Solo Mode' });
}

function buildProfessionPanelComponents(profession) {
  const button = new ButtonBuilder()
    .setCustomId(`${CONFIG.ui.professionStartPrefix}${profession.key}`)
    .setLabel(`เริ่มเควส${profession.name}`)
    .setStyle(ButtonStyle.Success)
    .setEmoji(profession.emoji);

  return [new ActionRowBuilder().addComponents(button)];
}

function buildAdminControlEmbed(professions) {
  const lines = professions.map((profession) => {
    const channel = profession.panelChannelId ? `<#${profession.panelChannelId}>` : '`ยังไม่ตั้ง panel_channel_id`';
    return `${profession.emoji} **${profession.key}** → ${channel}`;
  });

  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🛠️ Treasure Hunt Admin Control')
    .setDescription([
      'ห้องนี้ใช้ควบคุมการสร้างและรีเฟรช Panel ของทุกสาย',
      '',
      'ปุ่มที่มีให้ใช้',
      '• **สร้างทุก Panel** → ส่ง panel ไปทุกห้องที่ตั้ง `panel_channel_id` ไว้แล้ว',
      '• **รีเฟรชทุก Panel** → แก้ไข panel เดิมจาก `panel_message_id` ถ้ามี',
      '• **เช็กสถานะ** → ดูว่ามีสายไหนยังไม่ตั้งค่าห้อง panel',
      '',
      'สถานะปัจจุบัน',
      lines.join('\n') || 'ยังไม่มี profession ในฐานข้อมูล',
    ].join('\n'))
    .setFooter({ text: 'Admin only' });
}

function buildAdminControlComponents(professions) {
  const rows = [];
  rows.push(new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(CONFIG.ui.adminCreateAllPanels)
      .setLabel('สร้างทุก Panel')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(CONFIG.ui.adminRefreshAllPanels)
      .setLabel('รีเฟรชทุก Panel')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(CONFIG.ui.adminCheckPanelStatus)
      .setLabel('เช็กสถานะ')
      .setStyle(ButtonStyle.Secondary),
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
    return {
      ok: false,
      professionKey: profession?.key,
      reason: 'missing panel_channel_id',
    };
  }

  const channel = guild.channels.cache.get(profession.panelChannelId)
    || await guild.channels.fetch(profession.panelChannelId).catch(() => null);

  if (!channel || !channel.isTextBased()) {
    return {
      ok: false,
      professionKey: profession.key,
      reason: 'panel channel not found or not text based',
    };
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
    const result = await upsertProfessionPanel(guild, profession, options);
    results.push(result);
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
