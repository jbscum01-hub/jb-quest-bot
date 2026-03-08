const { query } = require('../db/pool');
const { getProfessionByKey: getProfessionFromConfig, getEnabledProfessions: getEnabledFromConfig } = require('../config');

function mergeProfession(row) {
  if (!row) return null;
  const key = row.profession_key || row.key;
  const config = getProfessionFromConfig(key) || {};

  return {
    key,
    professionKey: key,
    name: row.name || config.name || key,
    displayName: row.display_name || config.displayName || row.name || key,
    emoji: row.emoji || config.emoji || '🎯',
    ticketChannelPrefix: row.ticket_channel_prefix || config.ticketChannelPrefix || `ticket-${key}`,
    roleId: row.role_id || config.roleId || '',
    panelChannelId: row.panel_channel_id || null,
    panelMessageId: row.panel_message_id || null,
    submissionChannelId: row.submission_channel_id || null,
    missionTitle: row.mission_title || `สมบัติแห่ง${row.name || config.name || key}`,
    levelText: row.level_text || 'Lv.4 → Lv.5',
    difficultyStars: row.difficulty_stars || '⭐⭐⭐',
    rewardText: row.reward_text || (row.display_name || config.displayName || row.name || key),
    enabled: typeof row.enabled === 'boolean' ? row.enabled : (config.enabled ?? true),
    color: config.color || 0x00aeff,
  };
}

async function getEnabledProfessionsFromDb() {
  const sql = `
    select *
    from professions
    where enabled = true
    order by profession_key asc
  `;

  try {
    const result = await query(sql);
    return result.rows.map(mergeProfession);
  } catch (error) {
    console.warn('getEnabledProfessionsFromDb fallback to config:', error.message);
    return getEnabledFromConfig();
  }
}

async function getProfessionByKeyFromDb(professionKey) {
  const sql = `
    select *
    from professions
    where profession_key = $1
    limit 1
  `;

  try {
    const result = await query(sql, [professionKey]);
    return mergeProfession(result.rows[0] || null);
  } catch (error) {
    console.warn('getProfessionByKeyFromDb fallback to config:', error.message);
    return getProfessionFromConfig(professionKey);
  }
}

async function updatePanelMapping(professionKey, channelId, messageId) {
  const sql = `
    update professions
    set panel_channel_id = $1,
        panel_message_id = $2,
        updated_at = now()
    where profession_key = $3
    returning *
  `;

  const result = await query(sql, [channelId, messageId, professionKey]);
  return mergeProfession(result.rows[0] || null);
}

module.exports = {
  getEnabledProfessionsFromDb,
  getProfessionByKeyFromDb,
  updatePanelMapping,
};
