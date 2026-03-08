const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const { CONFIG, getProfessionByKey } = require('../config');
const { buildTicketChannelName } = require('../utils/channelName');
const { questRunStore } = require('../stores/questRunStore');
const { safeReply } = require('../utils/safeReply');
const { validateTeamSize } = require('./teamService');

async function handleStartHuntModal(interaction) {
  const professionKey = interaction.fields.getTextInputValue('profession_key').trim().toLowerCase();
  const teamName = interaction.fields.getTextInputValue('team_name').trim();

  const profession = getProfessionByKey(professionKey);
  if (!profession || !profession.enabled) {
    await safeReply(interaction, 'ไม่พบสายอาชีพนี้ หรือสายนี้ยังไม่เปิดใช้งาน');
    return;
  }

  const teamCheck = validateTeamSize(1, profession);
  if (!teamCheck.ok) {
    await safeReply(interaction, teamCheck.message);
    return;
  }

  const existing = questRunStore.findActiveByUserAndProfession(interaction.user.id, professionKey);
  if (existing) {
    await safeReply(interaction, `คุณมีเควสสาย ${profession.displayName} ที่กำลังดำเนินการอยู่แล้ว`);
    return;
  }

  const channelName = buildTicketChannelName(profession.ticketChannelPrefix, teamName);

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

  const run = questRunStore.create({
    channelId: channel.id,
    guildId: interaction.guild.id,
    professionKey,
    professionDisplayName: profession.displayName,
    teamName,
    leaderUserId: interaction.user.id,
    memberUserIds: [interaction.user.id],
    status: CONFIG.questStatus.ACTIVE,
    abandonedCountsAsCancel: CONFIG.settings.abandonedCountsAsCancel,
  });

  const embed = new EmbedBuilder()
    .setTitle('Treasure Hunt Started')
    .setDescription([
      `สาย: ${profession.displayName}`,
      `ทีม: **${teamName}**`,
      `หัวหน้าทีม: <@${interaction.user.id}>`,
      '',
      `สถานะ: \`${CONFIG.questStatus.ACTIVE}\``,
      `เงื่อนไข: ทีม ${profession.minTeamSize}-${profession.maxTeamSize} คน`,
      'หมายเหตุ: Abandoned ถือว่ายกเลิกเควส',
    ].join('\n'));

  await channel.send({ embeds: [embed] });

  if (CONFIG.discord.channels.logChannelId) {
    const logChannel = interaction.guild.channels.cache.get(CONFIG.discord.channels.logChannelId);
    if (logChannel && logChannel.isTextBased()) {
      await logChannel.send({
        content: [
          '📘 มีการเปิด Treasure Hunt ใหม่',
          `สาย: ${profession.displayName}`,
          `ทีม: ${teamName}`,
          `ผู้เปิด: <@${interaction.user.id}>`,
          `ห้อง: <#${channel.id}>`,
        ].join('\n'),
      }).catch(() => null);
    }
  }

  await safeReply(interaction, `สร้างห้องแล้ว: ${channel}`);
  return run;
}

module.exports = {
  handleStartHuntModal,
};
