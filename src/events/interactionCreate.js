const { CONFIG } = require('../config');
const { startSoloHunt } = require('../services/huntService');
const { safeReply } = require('../utils/safeReply');
const { getEnabledProfessionsFromDb } = require('../services/professionService');
const {
  buildAdminControlEmbed,
  buildAdminControlComponents,
  createOrRefreshAllPanels,
  createOrRefreshSinglePanel,
} = require('../services/panelService');

function isAdminMember(interaction) {
  const roleIds = [CONFIG.discord.roles.adminRoleId, CONFIG.discord.roles.staffRoleId].filter(Boolean);
  if (!roleIds.length) return true;
  return interaction.member?.roles?.cache?.some((role) => roleIds.includes(role.id));
}

async function refreshAdminMessage(interaction) {
  const professions = await getEnabledProfessionsFromDb();
  if (interaction.message) {
    await interaction.message.edit({
      embeds: [buildAdminControlEmbed(professions)],
      components: buildAdminControlComponents(professions),
    }).catch(() => null);
  }
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction, client);
        return;
      }

      if (interaction.isButton()) {
        const { customId } = interaction;

        if (customId.startsWith(CONFIG.ui.professionStartPrefix)) {
          const professionKey = customId.replace(CONFIG.ui.professionStartPrefix, '');
          await startSoloHunt(interaction, professionKey);
          return;
        }

        if (
          customId === CONFIG.ui.adminCreateAllPanels
          || customId === CONFIG.ui.adminRefreshAllPanels
          || customId === CONFIG.ui.adminCheckPanelStatus
          || customId.startsWith(CONFIG.ui.adminCreatePanelPrefix)
        ) {
          if (!isAdminMember(interaction)) {
            await safeReply(interaction, 'ปุ่มนี้สำหรับแอดมินหรือสตาฟเท่านั้น');
            return;
          }

          if (CONFIG.discord.channels.adminControlChannelId && interaction.channelId !== CONFIG.discord.channels.adminControlChannelId) {
            await safeReply(interaction, `ปุ่มนี้ต้องใช้ในห้อง <#${CONFIG.discord.channels.adminControlChannelId}> เท่านั้น`);
            return;
          }

          if (customId === CONFIG.ui.adminCheckPanelStatus) {
            await interaction.reply({ content: 'กำลังเช็กสถานะ panel...', ephemeral: true });
            await refreshAdminMessage(interaction);
            await interaction.editReply('อัปเดตสถานะ panel เรียบร้อยแล้ว');
            return;
          }

          if (customId === CONFIG.ui.adminCreateAllPanels || customId === CONFIG.ui.adminRefreshAllPanels) {
            await interaction.reply({ content: 'กำลังประมวลผล panel ทุกสาย...', ephemeral: true });
            const forceNewMessage = customId === CONFIG.ui.adminCreateAllPanels;
            const results = await createOrRefreshAllPanels(interaction.guild, { forceNewMessage });
            const ok = results.filter((item) => item.ok).length;
            const fail = results.filter((item) => !item.ok);
            await refreshAdminMessage(interaction);
            const failLines = fail.length
              ? `\nล้มเหลว: ${fail.map((item) => `${item.professionKey} (${item.reason})`).join(', ')}`
              : '';
            await interaction.editReply(`เสร็จแล้ว ✅ สำเร็จ ${ok} สาย${failLines}`);
            return;
          }

          if (customId.startsWith(CONFIG.ui.adminCreatePanelPrefix)) {
            await interaction.reply({ content: 'กำลังสร้าง panel รายสาย...', ephemeral: true });
            const professionKey = customId.replace(CONFIG.ui.adminCreatePanelPrefix, '');
            const result = await createOrRefreshSinglePanel(interaction.guild, professionKey, { forceNewMessage: true });
            await refreshAdminMessage(interaction);
            if (!result.ok) {
              await interaction.editReply(`ไม่สำเร็จ: ${professionKey} (${result.reason})`);
              return;
            }
            await interaction.editReply(`สร้าง panel ให้ ${professionKey} เรียบร้อยแล้ว`);
            return;
          }
        }
      }
    } catch (error) {
      console.error('interactionCreate error:', error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'เกิดข้อผิดพลาดในการทำงานของบอท',
          ephemeral: true,
        }).catch(() => null);
      } else {
        await interaction.reply({
          content: 'เกิดข้อผิดพลาดในการทำงานของบอท',
          ephemeral: true,
        }).catch(() => null);
      }
    }
  },
};
