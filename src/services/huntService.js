const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const { CONFIG, getProfessionByKey } = require('../config');
const { buildTicketChannelName } = require('../utils/channelName');
const { safeReply } = require('../utils/safeReply');
const {
  createRun,
  findLatestRunByUserAndProfession,
  logQuestAction,
} = require('./questRunService');

async function startSoloHunt(interaction, professionKey) {
  const profession = getProfessionByKey(professionKey);
  if (!profession || !profession.enabled) {
    await safeReply(interaction, 'ไม่พบสายอาชีพนี้ หรือสายนี้ยังไม่เปิดใช้งาน');
    return;
  }

  const existing = await findLatestRunByUserAndProfession(interaction.user.id, professionKey);
  if (existing) {
    if (existing.status === CONFIG.questStatus.ACTIVE) {
      await safeReply(interaction, `คุณมีเควสสายนี้ที่กำลังดำเนินการอยู่แล้ว (${profession.displayName})`);
      return;
    }

    if (existing.status === CONFIG.questStatus.COMPLETED) {
      await safeReply(interaction, `คุณทำสายนี้จบไปแล้ว จึงไม่สามารถเริ่มซ้ำได้ (${profession.displayName})`);
      return;
    }
  }

  const channelName = buildTicketChannelName(profession.ticketChannelPrefix, interaction.user.username);

  const permissionOverwrites = [
    {
      id: interaction.guild.roles.everyone,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: interaction.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
  ];

  if (CONFIG.discord.roles.staffRoleId) {
    permissionOverwrites.push({
      id: CONFIG.discord.roles.staffRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages,
      ],
    });
  }

  if (CONFIG.discord.roles.adminRoleId) {
    permissionOverwrites.push({
      id: CONFIG.discord.roles.adminRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageMessages,
      ],
    });
  }

  const channel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: CONFIG.discord.channels.ticketCategoryId || null,
    permissionOverwrites,
  });

  const run = await createRun({
    channelId: channel.id,
    guildId: interaction.guild.id,
    userId: interaction.user.id,
    username: interaction.user.username,
    professionKey,
    professionDisplayName: profession.displayName,
    status: CONFIG.questStatus.ACTIVE,
    clueStep: 1,
    abandonedCountsAsCancel: CONFIG.settings.abandonedCountsAsCancel,
  });

  await logQuestAction({
    questRunId: run.id,
    guildId: interaction.guild.id,
    channelId: channel.id,
    userId: interaction.user.id,
    professionKey,
    actionType: 'start_hunt',
    note: existing?.status === CONFIG.questStatus.ABANDONED
      ? 'Restarted solo hunt after abandoned run'
      : 'Started new solo hunt',
  });

  const embed = new EmbedBuilder()
    .setTitle('Treasure Hunt Started')
    .setDescription([
      `สาย: ${profession.displayName}`,
      `ผู้เล่น: <@${interaction.user.id}>`,
      '',
      `สถานะ: \`${CONFIG.questStatus.ACTIVE}\``,
      'โหมด: เล่นเดี่ยวเท่านั้น',
      'เงื่อนไข: 1 คนต่อ 1 ticket',
      'หมายเหตุ: abandoned เริ่มใหม่ได้ / completed เริ่มซ้ำไม่ได้',
    ].join('\n'));

  await channel.send({ embeds: [embed] });

  if (CONFIG.discord.channels.logChannelId) {
    const logChannel = interaction.guild.channels.cache.get(CONFIG.discord.channels.logChannelId);
    if (logChannel && logChannel.isTextBased()) {
      await logChannel.send({
        content: [
          '📘 มีการเปิด Treasure Hunt ใหม่',
          `สาย: ${profession.displayName}`,
          `ผู้เล่น: <@${interaction.user.id}>`,
          `ห้อง: <#${channel.id}>`,
          existing?.status === CONFIG.questStatus.ABANDONED
            ? 'ประเภท: restart after abandoned'
            : 'ประเภท: new run',
          'โหมด: solo only',
        ].join('\n'),
      }).catch(() => null);
    }
  }

  await safeReply(interaction, `สร้างห้องแล้ว: ${channel}`);
  return run;
}

module.exports = {
  startSoloHunt,
};
