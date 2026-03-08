# Treasure Hunt Bot (Neon + Solo Mode)

Discord bot สำหรับระบบ Treasure Hunt ใน SCUM โดยเวอร์ชันนี้ปรับเป็น **เล่นเดี่ยวเท่านั้น** และเก็บข้อมูลใน **Neon PostgreSQL**

## สิ่งที่เปลี่ยนแล้ว
- เอาระบบทีมออก
- 1 ผู้เล่น = 1 ticket ต่อ 1 สาย
- ถ้า `completed` หรือ `abandoned` แล้ว เริ่มสายเดิมซ้ำไม่ได้
- บันทึก quest run และ quest log ลง Neon
- มี SQL script สำหรับสร้างตารางและ seed professions

## โครงสร้างฐานข้อมูล
ใช้ไฟล์ในโฟลเดอร์ `sql/`
- `001_init_neon.sql`
- `002_seed_professions.sql`

## ตารางหลัก
- `professions`
- `clues`
- `quest_runs`
- `quest_logs`

## การตั้งค่า `.env`
คัดลอก `.env.example` เป็น `.env`

```env
DISCORD_TOKEN=
CLIENT_ID=
GUILD_ID=
DATABASE_URL=
TICKET_CATEGORY_ID=
LOG_CHANNEL_ID=
ADMIN_ROLE_ID=
STAFF_ROLE_ID=
```

## ขั้นตอนใช้งานกับ Neon
1. สร้างโปรเจกต์ใน Neon
2. คัดลอก connection string มาใส่ `DATABASE_URL`
3. เปิด SQL Editor ใน Neon Console
4. รัน `sql/001_init_neon.sql`
5. รัน `sql/002_seed_professions.sql`
6. ถ้าจะใช้ clue จริง ให้ insert ลงตาราง `clues`

## รันโปรเจกต์
```bash
npm install
npm run deploy
npm start
```

## คำสั่งบอท
- `/ping`
- `/professions`
- `/start-hunt`

## หมายเหตุ
- ใน `src/config/index.js` ยังมี `roleId` placeholder ให้เปลี่ยนเป็น ID จริงเอง
- ถ้าจะเอา clue จริงต่อ ให้เชื่อมจากตาราง `clues` ได้เลย
