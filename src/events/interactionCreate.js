const { CONFIG } = require('../config');
const { safeReply } = require('../utils/safeReply');
const { getEnabledProfessionsFromDb } = require('../services/professionService');
const {
  buildAdminControlEmbed,
  buildAdminControlComponents,
  createOrRefreshAllPanels,
  createOrRefreshSinglePanel,
} = require('../services/panelService');
const {
  openProfessionTicket,
  approveProfessionTicket,
  rejectProfessionTicket,
  showCurrentClue,
  unlockNextClue,
  abandonCurrentHunt,
  completeCurrentHunt,
  closeTicket,
} = require('../services/huntService');

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

      if (!interaction.isButton()) return;
      const { customId } = interaction;

      if (customId.startsWith(CONFIG.ui.openTicketPrefix)) {
        const professionKey = customId.replace(CONFIG.ui.openTicketPrefix, '');
        await openProfessionTicket(interaction, professionKey);
        return;
      }

      if ([
        CONFIG.ui.adminCreateAllPanels,
        CONFIG.ui.adminRefreshAllPanels,
        CONFIG.ui.adminCheckPanelStatus,
      ].includes(customId) || customId.startsWith(CONFIG.ui.adminCreatePanelPrefix)) {
        if (!isAdminMember(interaction)) return safeReply(interaction, 'ปุ่มนี้สำหรับแอดมินหรือสตาฟเท่านั้น');
        if (CONFIG.discord.channels.adminControlChannelId && interaction.channelId !== CONFIG.discord.channels.adminControlChannelId) {
          return safeReply(interaction, `ปุ่มนี้ต้องใช้ในห้อง <#${CONFIG.discord.channels.adminControlChannelId}> เท่านั้น`);
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
          await interaction.editReply(`เสร็จแล้ว ✅ สำเร็จ ${ok} สาย${fail.length ? ` | ล้มเหลว: ${fail.map((x) => x.professionKey).join(', ')}` : ''}`);
          return;
        }

        await interaction.reply({ content: 'กำลังสร้าง panel รายสาย...', ephemeral: true });
        const professionKey = customId.replace(CONFIG.ui.adminCreatePanelPrefix, '');
        const result = await createOrRefreshSinglePanel(interaction.guild, professionKey, { forceNewMessage: true });
        await refreshAdminMessage(interaction);
        await interaction.editReply(result.ok ? `สร้าง panel ให้ ${professionKey} เรียบร้อยแล้ว` : `ไม่สำเร็จ: ${professionKey} (${result.reason})`);
        return;
      }

      if (customId === CONFIG.ui.huntApprove) return approveProfessionTicket(interaction);
      if (customId === CONFIG.ui.huntReject) return rejectProfessionTicket(interaction);
      if (customId === CONFIG.ui.huntShowClue) return showCurrentClue(interaction);
      if (customId === CONFIG.ui.huntUnlockNextClue) return unlockNextClue(interaction);
      if (customId === CONFIG.ui.huntAbandon) return abandonCurrentHunt(interaction);
      if (customId === CONFIG.ui.huntComplete) return completeCurrentHunt(interaction);
      if (customId === CONFIG.ui.huntCloseTicket) return closeTicket(interaction);
    } catch (error) {
      console.error('interactionCreate error:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'เกิดข้อผิดพลาดในการทำงานของบอท', ephemeral: true }).catch(() => null);
      } else {
        await interaction.reply({ content: 'เกิดข้อผิดพลาดในการทำงานของบอท', ephemeral: true }).catch(() => null);
      }
    }
  },
};
