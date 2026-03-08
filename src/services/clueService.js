const { query } = require('../db/pool');

async function getClueByProfessionAndNo(professionKey, clueNo) {
  const sql = `
    select
      profession_key,
      clue_no,
      coalesce(clue_title, title, 'Clue ' || clue_no::text) as clue_title,
      clue_text,
      hint_text,
      mission_type,
      is_final,
      enabled
    from clues
    where profession_key = $1
      and clue_no = $2
      and coalesce(enabled, true) = true
    limit 1
  `;

  const result = await query(sql, [professionKey, clueNo]);
  return result.rows[0] || null;
}

module.exports = { getClueByProfessionAndNo };
