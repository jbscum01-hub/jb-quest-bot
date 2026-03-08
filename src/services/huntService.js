const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { CONFIG } = require('../config');
const { buildTicketChannelName } = require('../utils/channelName');
const { safeReply } = require('../utils/safeReply');
const {
  createPendingRun,
  findLatestRunByUserAndProfession,
  findRunByTicketChannelId,
  approveRun,
  rejectRun,
  advanceClue,
  abandonRun,
  completeRun,
  logQuestAction,
} = require('./questRunService');
const { getProfessionByKeyFromDb } = require('./professionService');
const { getClueByProfessionAndNo } = require('./clueService');

function memberIsStaff(interaction) {
  const roleIds = [CONFIG.discord.roles.adminRoleId, CONFIG.discord.roles.staffRoleId].filter(Boolean);
  if (!roleIds.length) return true;
  return interaction.member?.roles?.cache?.some((role) => roleIds.includes(role.id));
}

function buildPendingEmbed(profession, userId) {
  return new EmbedBuilder()
    .setColor(profession.color || 0x00aeff)
    .setTitle('🎫 เปิด Ticket สำเร็จ')
    .setDescription([
      `ภารกิจ : ${profession.missionTitle}`,
      `สาย : ${profession.name}`,
      `ผู้เล่น : <@${userId}>`,
      '',
      'สถานะ : `pending_approval`',
      'กรุณารอแอดมินอนุมัติภารกิจก่อนเริ่มรับ Clue',
    ].join('\n'));
}

function buildPendingComponents() {
  return [new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(CONFIG.ui.huntApprove).setLabel('อนุมัติภารกิจ').setStyle(ButtonStyle.Success).setEmoji('✅'),
    new ButtonBuilder().setCustomId(CONFIG.ui.huntReject).setLabel('ปฏิเสธ').setStyle(ButtonStyle.Danger).setEmoji('❌'),
    new ButtonBuilder().setCustomId(CONFIG.ui.huntCloseTicket).setLabel('ปิด Ticket').setStyle(ButtonStyle.Secondary).setEmoji('🔒'),
  )];
}

function buildActiveEmbed(profession, userId, currentClue) {
  return new EmbedBuilder()
    .setColor(profession.color || 0x00aeff)
    .setTitle('Treasure Hunt Started')
    .setDescription([
      `ภารกิจ : ${profession.missionTitle}`,
      `สาย : ${profession.displayName}`,
      `ผู้เล่น : <@${userId}>`,
      '',
      'สถานะ : `active`',
      `Clue ปัจจุบัน : ${currentClue}`,
      'ผู้เล่นกดได้เฉพาะดู Clue ปัจจุบัน',
      'Clue ถัดไปให้แอดมิน/สตาฟปลดล็อกเท่านั้น',
    ].join('\n'));
}

function buildActiveComponents() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(CONFIG.ui.huntShowClue).setLabel('ดู Clue ปัจจุบัน').setStyle(ButtonStyle.Primary).setEmoji('📜'),
      new ButtonBuilder().setCustomId(CONFIG.ui.huntAbandon).setLabel('ยกเลิกภารกิจ').setStyle(ButtonStyle.Danger).setEmoji('❌'),
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(CONFIG.ui.huntUnlockNextClue).setLabel('ปลดล็อก Clue ถัดไป').setStyle(ButtonStyle.Success).setEmoji('➡️'),
      new ButtonBuilder().setCustomId(CONFIG.ui.huntComplete).setLabel('สำเร็จภารกิจ').setStyle(ButtonStyle.Success).setEmoji('🏁'),
      new ButtonBuilder().setCustomId(CONFIG.ui.huntCloseTicket).setLabel('ปิด Ticket').setStyle(ButtonStyle.Secondary).setEmoji('🔒'),
    ),
  ];
}

function buildCompletionEmbed(profession, run, staffUserId) {
  const marks = [1, 2, 3, 4, 5].map((no) => `${no === 5 ? 'Final Mission' : `Clue ${no}`} ${run.current_clue >= no ? '✅' : '🔒'}`);
  return new EmbedBuilder()
    .setColor(profession.color || 0x2ecc71)
    .setTitle('🏁 TREASURE HUNT COMPLETED')
    .setDescription([
      '━━━━━━━━━━━━━━━━━━━━',
      `ผู้เล่น : <@${run.user_id}>`,
      `สาย : ${profession.name}`,
      `ภารกิจ : ${profession.missionTitle}`,
      `ระดับ : ${profession.levelText}`,
      `ความยาก : ${profession.difficultyStars}`,
      '',
      '🔎 ความคืบหน้า:',
      ...marks,
      '',
      '🎖 รางวัลที่ได้รับ:',
      `Role : ${profession.rewardText}`,
      '',
      '👮 ยืนยันโดย:',
      `<@${staffUserId}>`,
      '',
      `🕒 เวลาเสร็จสิ้น: ${new Date().toLocaleString('th-TH')}`,
      '━━━━━━━━━━━━━━━━━━━━',
    ].join('\n'));
}

async function deleteTicketChannel(channel, reason) {
  await channel.delete(reason).catch(() => null);
}

async function openProfessionTicket(interaction, professionKey) {
  const profession = await getProfessionByKeyFromDb(professionKey);
  if (!profession || !profession.enabled) {
    await safeReply(interaction, 'ไม่พบสายอาชีพนี้ หรือสายนี้ยังไม่เปิดใช้งาน');
    return;
  }

  if (profession.panelChannelId && interaction.channelId !== profession.panelChannelId) {
    await safeReply(interaction, `กรุณาใช้ปุ่มนี้ในห้อง panel ของสายนี้ <#${profession.panelChannelId}>`);
    return;
  }

  const existing = await findLatestRunByUserAndProfession(interaction.user.id, professionKey);
  if (existing && [CONFIG.questStatus.PENDING_APPROVAL, CONFIG.questStatus.ACTIVE, CONFIG.questStatus.COMPLETED].includes(existing.status)) {
    const message = existing.status === CONFIG.questStatus.COMPLETED
      ? `คุณทำสายนี้สำเร็จแล้ว จึงเริ่มซ้ำไม่ได้ (${profession.displayName})`
      : `คุณมีเควสสายนี้อยู่แล้วในสถานะ ${existing.status}`;
    await safeReply(interaction, message);
    return;
  }

  const channelName = buildTicketChannelName(profession.ticketChannelPrefix, interaction.user.username);
  const permissionOverwrites = [
    { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: interaction.user.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
    },
  ];

  for (const roleId of [CONFIG.discord.roles.staffRoleId, CONFIG.discord.roles.adminRoleId].filter(Boolean)) {
    permissionOverwrites.push({
      id: roleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.ManageChannels,
      ],
    });
  }

  const channel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: CONFIG.discord.channels.ticketCategoryId || null,
    permissionOverwrites,
  });

  const run = await createPendingRun({
    userId: interaction.user.id,
    professionKey,
    ticketChannelId: channel.id,
  });

  await logQuestAction({
    questRunId: run.quest_run_id,
    userId: interaction.user.id,
    professionKey,
    actionType: 'open_ticket',
    actionByUserId: interaction.user.id,
    message: 'Player opened ticket',
  });

  await channel.send({
    content: `<@${interaction.user.id}>`,
    embeds: [buildPendingEmbed(profession, interaction.user.id)],
    components: buildPendingComponents(),
  });

  await safeReply(interaction, `เปิด Ticket ให้แล้ว: ${channel}`);
}

async function approveProfessionTicket(interaction) {
  if (!memberIsStaff(interaction)) return safeReply(interaction, 'ปุ่มนี้สำหรับแอดมินหรือสตาฟเท่านั้น');
  const run = await findRunByTicketChannelId(interaction.channelId);
  if (!run) return safeReply(interaction, 'ไม่พบข้อมูล quest ของ ticket นี้');
  const profession = await getProfessionByKeyFromDb(run.profession_key);
  const updated = await approveRun(run.quest_run_id, interaction.user.id);
  await logQuestAction({ questRunId: run.quest_run_id, userId: run.user_id, professionKey: run.profession_key, actionType: 'approve', actionByUserId: interaction.user.id, clueNo: 1, message: 'Quest approved' });

  await interaction.message.edit({
    embeds: [buildActiveEmbed(profession, run.user_id, updated.current_clue)],
    components: buildActiveComponents(),
  });
  await safeReply(interaction, 'อนุมัติภารกิจแล้ว และเปิด Clue 1 เรียบร้อย');
}

async function rejectProfessionTicket(interaction) {
  if (!memberIsStaff(interaction)) return safeReply(interaction, 'ปุ่มนี้สำหรับแอดมินหรือสตาฟเท่านั้น');
  const run = await findRunByTicketChannelId(interaction.channelId);
  if (!run) return safeReply(interaction, 'ไม่พบข้อมูล quest ของ ticket นี้');
  await rejectRun(run.quest_run_id, interaction.user.id);
  await logQuestAction({ questRunId: run.quest_run_id, userId: run.user_id, professionKey: run.profession_key, actionType: 'reject', actionByUserId: interaction.user.id, message: 'Quest rejected' });
  await interaction.channel.send('❌ แอดมินปฏิเสธภารกิจนี้แล้ว');
  await deleteTicketChannel(interaction.channel, 'Quest rejected');
}

async function showCurrentClue(interaction) {
  const run = await findRunByTicketChannelId(interaction.channelId);
  if (!run) return safeReply(interaction, 'ไม่พบข้อมูล quest ของ ticket นี้');
  if (run.user_id !== interaction.user.id && !memberIsStaff(interaction)) {
    return safeReply(interaction, 'ปุ่มนี้ใช้ได้เฉพาะเจ้าของเควสหรือสตาฟ');
  }
  if (run.status !== CONFIG.questStatus.ACTIVE) {
    return safeReply(interaction, `เควสนี้ยังไม่อยู่ในสถานะ active (ปัจจุบัน: ${run.status})`);
  }

  const profession = await getProfessionByKeyFromDb(run.profession_key);
  const clue = await getClueByProfessionAndNo(run.profession_key, run.current_clue);
  if (!clue) return safeReply(interaction, 'ไม่พบข้อมูล clue ปัจจุบัน');

  const embed = new EmbedBuilder()
    .setColor(profession.color || 0x00aeff)
    .setTitle(`${profession.emoji} ${clue.clue_title}`)
    .setDescription(clue.clue_text)
    .addFields(
      { name: 'ภารกิจ', value: profession.missionTitle, inline: false },
      { name: 'ลำดับปัจจุบัน', value: clue.is_final ? 'Final Mission' : `Clue ${clue.clue_no}`, inline: true },
      { name: 'Hint', value: clue.hint_text || '-', inline: false },
    );

  await interaction.reply({ embeds: [embed], ephemeral: true });
  await logQuestAction({ questRunId: run.quest_run_id, userId: run.user_id, professionKey: run.profession_key, actionType: 'show_clue', actionByUserId: interaction.user.id, clueNo: run.current_clue, message: 'Viewed current clue' });
}

async function unlockNextClue(interaction) {
  if (!memberIsStaff(interaction)) return safeReply(interaction, 'ปุ่มนี้สำหรับแอดมินหรือสตาฟเท่านั้น');
  const run = await findRunByTicketChannelId(interaction.channelId);
  if (!run) return safeReply(interaction, 'ไม่พบข้อมูล quest ของ ticket นี้');
  if (run.status !== CONFIG.questStatus.ACTIVE) return safeReply(interaction, `เควสนี้ยังไม่ active (ปัจจุบัน: ${run.status})`);
  if (run.current_clue >= 5) return safeReply(interaction, 'ตอนนี้อยู่ Final Mission แล้ว ไม่สามารถปลดล็อกถัดไปได้');

  const updated = await advanceClue(run.quest_run_id);
  await logQuestAction({ questRunId: run.quest_run_id, userId: run.user_id, professionKey: run.profession_key, actionType: 'unlock_next_clue', actionByUserId: interaction.user.id, clueNo: updated.current_clue, message: 'Unlocked next clue' });
  await interaction.channel.send(`➡️ แอดมินได้ปลดล็อก ${updated.current_clue === 5 ? 'Final Mission' : `Clue ${updated.current_clue}`} แล้ว\n<@${run.user_id}> สามารถกด **ดู Clue ปัจจุบัน** ได้เลย`);
  await safeReply(interaction, 'ปลดล็อก clue ถัดไปเรียบร้อย');
}

async function abandonCurrentHunt(interaction) {
  const run = await findRunByTicketChannelId(interaction.channelId);
  if (!run) return safeReply(interaction, 'ไม่พบข้อมูล quest ของ ticket นี้');
  if (run.user_id !== interaction.user.id && !memberIsStaff(interaction)) {
    return safeReply(interaction, 'ปุ่มนี้ใช้ได้เฉพาะเจ้าของเควสหรือสตาฟ');
  }
  await abandonRun(run.quest_run_id);
  await logQuestAction({ questRunId: run.quest_run_id, userId: run.user_id, professionKey: run.profession_key, actionType: 'abandon', actionByUserId: interaction.user.id, clueNo: run.current_clue, message: 'Quest abandoned' });
  await interaction.channel.send('❌ ภารกิจนี้ถูกยกเลิกแล้ว และสามารถเริ่มใหม่ได้ในภายหลัง');
  await deleteTicketChannel(interaction.channel, 'Quest abandoned');
}

async function completeCurrentHunt(interaction) {
  if (!memberIsStaff(interaction)) return safeReply(interaction, 'ปุ่มนี้สำหรับแอดมินหรือสตาฟเท่านั้น');
  const run = await findRunByTicketChannelId(interaction.channelId);
  if (!run) return safeReply(interaction, 'ไม่พบข้อมูล quest ของ ticket นี้');
  const profession = await getProfessionByKeyFromDb(run.profession_key);
  const updated = await completeRun(run.quest_run_id, interaction.user.id);

  const member = await interaction.guild.members.fetch(run.user_id).catch(() => null);
  if (member && profession.roleId) {
    await member.roles.add(profession.roleId).catch(() => null);
  }

  await logQuestAction({ questRunId: run.quest_run_id, userId: run.user_id, professionKey: run.profession_key, actionType: 'complete', actionByUserId: interaction.user.id, clueNo: updated.current_clue, message: 'Quest completed' });

  const summaryEmbed = buildCompletionEmbed(profession, updated, interaction.user.id);
  const submissionChannel = profession.submissionChannelId
    ? (interaction.guild.channels.cache.get(profession.submissionChannelId) || await interaction.guild.channels.fetch(profession.submissionChannelId).catch(() => null))
    : null;

  if (submissionChannel && submissionChannel.isTextBased()) {
    await submissionChannel.send({ embeds: [summaryEmbed] }).catch(() => null);
  }

  await interaction.channel.send({ embeds: [summaryEmbed] }).catch(() => null);
  await deleteTicketChannel(interaction.channel, 'Quest completed');
}

async function closeTicket(interaction) {
  if (!memberIsStaff(interaction)) return safeReply(interaction, 'ปุ่มนี้สำหรับแอดมินหรือสตาฟเท่านั้น');
  await safeReply(interaction, 'กำลังปิด ticket...');
  await deleteTicketChannel(interaction.channel, `Closed by ${interaction.user.tag}`);
}

module.exports = {
  openProfessionTicket,
  approveProfessionTicket,
  rejectProfessionTicket,
  showCurrentClue,
  unlockNextClue,
  abandonCurrentHunt,
  completeCurrentHunt,
  closeTicket,
};
