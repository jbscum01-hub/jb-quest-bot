# Treasure Hunt Bot (Neon + Solo Only)

Discord bot สำหรับระบบ Treasure Hunt แบบเล่นเดี่ยว ใช้ Neon PostgreSQL + Railway

## คำสั่งหลัก
- `/setup-admin-panel` สร้างห้องควบคุมปุ่มสำหรับแอดมิน
- `/professions` ดูสายที่เปิดใช้งาน
- `/start-hunt` บอกวิธีเริ่มระบบ
- `/ping` เช็กบอท

## Flow ใหม่
1. ตั้ง `panel_channel_id` ให้แต่ละ profession ใน DB
2. ไปห้องแอดมินที่กำหนดใน `ADMIN_CONTROL_CHANNEL_ID`
3. รัน `/setup-admin-panel`
4. กดปุ่ม `สร้างทุก Panel`
5. ผู้เล่นไปที่ห้อง panel ของแต่ละสาย แล้วกด `เริ่มเควส`

## Variables
ดูที่ `.env.example`

## SQL
- `001_init_neon.sql`
- `002_seed_professions.sql`
- `003_allow_restart_after_abandoned.sql`
- `004_add_panel_fields.sql`
