const { query } = require('../db/pool');
const { getProfessionByKey: getProfessionFromConfig, getEnabledProfessions: getEnabledFromConfig } = require('../config');

function mergeProfession(row) {
  if (!row) return null;
  const config = getProfessionFromConfig(row.profession_key || row.key) || {};

  return {
    key: row.profession_key || row.key,
    professionKey: row.profession_key || row.key,
    name: row.name || config.name || row.profession_key,
    displayName: row.display_name || config.displayName || row.name || row.profession_key,
    emoji: row.emoji || config.emoji || '🎯',
    ticketChannelPrefix: row.ticket_channel_prefix || config.ticketChannelPrefix || `ticket-${row.profession_key || row.key}`,
    roleId: row.role_id || config.roleId || '',
    enabled: typeof row.enabled === 'boolean' ? row.enabled : (config.enabled ?? true),
    panelChannelId: row.panel_channel_id || null,
    panelMessageId: row.panel_message_id || null,
    color: config.color || 0x00aeff,
    allowSolo: true,
    minTeamSize: 1,
    maxTeamSize: 1,
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
        panel_message_id = $2
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
