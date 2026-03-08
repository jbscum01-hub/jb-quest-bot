const { query } = require('../db/pool');
const { CONFIG } = require('../config');

async function findLatestRunByUserAndProfession(userId, professionKey) {
  const sql = `
    select *
    from quest_runs
    where user_id = $1
      and profession_key = $2
    order by created_at desc, quest_run_id desc
    limit 1
  `;
  const result = await query(sql, [userId, professionKey]);
  return result.rows[0] || null;
}

async function findRunByTicketChannelId(ticketChannelId) {
  const sql = `
    select *
    from quest_runs
    where ticket_channel_id = $1
    order by created_at desc, quest_run_id desc
    limit 1
  `;
  const result = await query(sql, [ticketChannelId]);
  return result.rows[0] || null;
}

async function createPendingRun({ userId, professionKey, ticketChannelId }) {
  const sql = `
    insert into quest_runs (
      user_id,
      profession_key,
      ticket_channel_id,
      status,
      current_clue,
      created_at,
      updated_at
    )
    values ($1, $2, $3, $4, 1, now(), now())
    returning *
  `;
  const result = await query(sql, [userId, professionKey, ticketChannelId, CONFIG.questStatus.PENDING_APPROVAL]);
  return result.rows[0];
}

async function approveRun(questRunId, adminUserId) {
  const sql = `
    update quest_runs
    set status = $2,
        started_at = now(),
        approved_at = now(),
        approved_by_admin_id = $3,
        updated_at = now()
    where quest_run_id = $1
    returning *
  `;
  const result = await query(sql, [questRunId, CONFIG.questStatus.ACTIVE, adminUserId]);
  return result.rows[0] || null;
}

async function rejectRun(questRunId, adminUserId) {
  const sql = `
    update quest_runs
    set status = $2,
        rejected_at = now(),
        rejected_by_admin_id = $3,
        updated_at = now()
    where quest_run_id = $1
    returning *
  `;
  const result = await query(sql, [questRunId, CONFIG.questStatus.REJECTED, adminUserId]);
  return result.rows[0] || null;
}

async function advanceClue(questRunId) {
  const sql = `
    update quest_runs
    set current_clue = current_clue + 1,
        updated_at = now()
    where quest_run_id = $1
      and status = $2
    returning *
  `;
  const result = await query(sql, [questRunId, CONFIG.questStatus.ACTIVE]);
  return result.rows[0] || null;
}

async function abandonRun(questRunId) {
  const sql = `
    update quest_runs
    set status = $2,
        abandoned_at = now(),
        updated_at = now()
    where quest_run_id = $1
    returning *
  `;
  const result = await query(sql, [questRunId, CONFIG.questStatus.ABANDONED]);
  return result.rows[0] || null;
}

async function completeRun(questRunId, adminUserId) {
  const sql = `
    update quest_runs
    set status = $2,
        completed_at = now(),
        completed_by_admin_id = $3,
        updated_at = now()
    where quest_run_id = $1
    returning *
  `;
  const result = await query(sql, [questRunId, CONFIG.questStatus.COMPLETED, adminUserId]);
  return result.rows[0] || null;
}

async function logQuestAction({ questRunId, userId, professionKey, actionType, actionByUserId, clueNo, message, metadata }) {
  const sql = `
    insert into quest_logs (
      quest_run_id,
      user_id,
      profession_key,
      action_type,
      action_by_user_id,
      clue_no,
      message,
      metadata,
      created_at
    )
    values ($1,$2,$3,$4,$5,$6,$7,$8,now())
    returning *
  `;
  const result = await query(sql, [
    questRunId || null,
    userId,
    professionKey,
    actionType,
    actionByUserId || null,
    clueNo || null,
    message || null,
    metadata ? JSON.stringify(metadata) : null,
  ]);
  return result.rows[0] || null;
}

module.exports = {
  findLatestRunByUserAndProfession,
  findRunByTicketChannelId,
  createPendingRun,
  approveRun,
  rejectRun,
  advanceClue,
  abandonRun,
  completeRun,
  logQuestAction,
};
