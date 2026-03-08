insert into professions (
  profession_key,
  name,
  display_name,
  emoji,
  ticket_channel_prefix,
  role_id,
  enabled,
  allow_solo,
  min_team_size,
  max_team_size
)
values
  ('medic', 'สายแพทย์', '🩺 lv5-ผู้กอบกู้ชีวิต', '🩺', 'ticket-medic', 'PUT_ROLE_ID_HERE', true, true, 1, 1),
  ('farmer', 'สายเกษตร', '🌾 lv5-ตำนานเกษตรกร', '🌾', 'ticket-farmer', 'PUT_ROLE_ID_HERE', true, true, 1, 1),
  ('soldier', 'สายสนามรบ', '🪖 lv5-ผู้บัญชาการสนามรบ', '🪖', 'ticket-soldier', 'PUT_ROLE_ID_HERE', true, true, 1, 1),
  ('fisher', 'สายตกปลา', '🎣 lv5-ตำนานนักตกปลา', '🎣', 'ticket-fisher', 'PUT_ROLE_ID_HERE', true, true, 1, 1),
  ('hunter', 'สายนักล่า', '🦌 lv5-ตำนานนักล่า', '🦌', 'ticket-hunter', 'PUT_ROLE_ID_HERE', true, true, 1, 1),
  ('explorer', 'สายนักสำรวจ', '🧭 lv5-ผู้พิชิตแผนที่', '🧭', 'ticket-explorer', 'PUT_ROLE_ID_HERE', true, true, 1, 1),
  ('chef', 'สายอาหาร', '👨‍🍳 lv5-ตำนานเชฟผู้รอดชีวิต', '👨‍🍳', 'ticket-chef', 'PUT_ROLE_ID_HERE', true, true, 1, 1),
  ('engineer', 'สายช่าง', '🔧 lv5-วิศวกรเอาตัวรอด', '🔧', 'ticket-engineer', 'PUT_ROLE_ID_HERE', true, true, 1, 1),
  ('scavenger', 'สายลูท', '🎒 lv5-ราชันนักค้นหา', '🎒', 'ticket-scavenger', 'PUT_ROLE_ID_HERE', true, true, 1, 1)
on conflict (profession_key) do update
set
  name = excluded.name,
  display_name = excluded.display_name,
  emoji = excluded.emoji,
  ticket_channel_prefix = excluded.ticket_channel_prefix,
  role_id = excluded.role_id,
  enabled = excluded.enabled,
  allow_solo = excluded.allow_solo,
  min_team_size = excluded.min_team_size,
  max_team_size = excluded.max_team_size,
  updated_at = now();
