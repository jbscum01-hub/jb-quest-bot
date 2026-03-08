const { SlashCommandBuilder } = require('discord.js');
const { CONFIG } = require('../config');
const { safeReply } = require('../utils/safeReply');
const { getEnabledProfessionsFromDb } = require('../services/professionService');
const { buildAdminControlEmbed, buildAdminControlComponents } = require('../services/panelService');

function isAdmin(interaction) {
  const roleIds = [CONFIG.discord.roles.adminRoleId, CONFIG.discord.roles.staffRoleId].filter(Boolean);
  if (!roleIds.length) return true;
  return interaction.member.roles.cache.some((role) => roleIds.includes(role.id));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-admin-panel')
    .setDescription('สร้างหรือตั้งค่า Admin Control Panel สำหรับ Treasure Hunt'),

  async execute(interaction) {
    if (!isAdmin(interaction)) {
      await safeReply(interaction, 'คำสั่งนี้สำหรับแอดมินหรือสตาฟเท่านั้น');
      return;
    }

    if (CONFIG.discord.channels.adminControlChannelId && interaction.channelId !== CONFIG.discord.channels.adminControlChannelId) {
      await safeReply(interaction, `กรุณาใช้คำสั่งนี้ในห้อง <#${CONFIG.discord.channels.adminControlChannelId}> เท่านั้น`);
      return;
    }

    const professions = await getEnabledProfessionsFromDb();
    const embed = buildAdminControlEmbed(professions);
    const components = buildAdminControlComponents(professions);

    await interaction.channel.send({ embeds: [embed], components });
    await safeReply(interaction, 'สร้าง Admin Control Panel เรียบร้อยแล้ว');
  },
};
