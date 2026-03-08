const { query } = require('../db/pool');
const { CONFIG } = require('../config');

async function findActiveRunByUserAndProfession(userId, professionKey) {
  const sql = `
    select *
    from quest_runs
    where user_id = $1
      and profession_key = $2
      and status = $3
    order by created_at desc
    limit 1
  `;

  const result = await query(sql, [userId, professionKey, CONFIG.questStatus.ACTIVE]);
  return result.rows[0] || null;
}

async function findLatestRunByUserAndProfession(userId, professionKey) {
  const sql = `
    select *
    from quest_runs
    where user_id = $1
      and profession_key = $2
    order by created_at desc
    limit 1
  `;

  const result = await query(sql, [userId, professionKey]);
  return result.rows[0] || null;
}

async function createRun(data) {
  const sql = `
    insert into quest_runs (
      guild_id,
      channel_id,
      user_id,
      username,
      profession_key,
      profession_display_name,
      status,
      clue_step,
      abandoned_counts_as_cancel
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    returning *
  `;

  const params = [
    data.guildId,
    data.channelId,
    data.userId,
    data.username,
    data.professionKey,
    data.professionDisplayName,
    data.status,
    data.clueStep || 1,
    data.abandonedCountsAsCancel ?? true,
  ];

  const result = await query(sql, params);
  return result.rows[0];
}

async function logQuestAction(data) {
  const sql = `
    insert into quest_logs (
      quest_run_id,
      guild_id,
      channel_id,
      user_id,
      profession_key,
      action_type,
      note
    )
    values ($1, $2, $3, $4, $5, $6, $7)
    returning *
  `;

  const params = [
    data.questRunId,
    data.guildId,
    data.channelId,
    data.userId,
    data.professionKey,
    data.actionType,
    data.note || null,
  ];

  const result = await query(sql, params);
  return result.rows[0];
}

module.exports = {
  findActiveRunByUserAndProfession,
  findLatestRunByUserAndProfession,
  createRun,
  logQuestAction,
};
