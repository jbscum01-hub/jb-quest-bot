const { query } = require('../db/pool');

async function getNextClue(professionKey, step = 1) {
  const sql = `
    select profession_key, clue_no as step, title, clue_text as content, zone_hint, is_final
    from clues
    where profession_key = $1
      and clue_no = $2
    limit 1
  `;

  const result = await query(sql, [professionKey, step]);
  return result.rows[0] || null;
}

module.exports = { getNextClue };
