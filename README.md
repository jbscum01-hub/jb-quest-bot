# Treasure Hunt Bot

Discord bot โครงเริ่มต้นสำหรับระบบ Treasure Hunt ใน SCUM

## จุดเด่นของเวอร์ชันนี้
- รวม config/variables ไว้ศูนย์กลางที่ `src/config/index.js`
- ใช้ `.env` เฉพาะ secret และ Discord IDs
- มี Slash Commands พื้นฐาน
- มีระบบสร้าง ticket เริ่มเควส
- มี in-memory store สำหรับ run state
- พร้อมต่อยอด clue system, abandon flow, admin flow

## โครงสร้าง

```txt
src/
  commands/
  config/
    index.js
  events/
  handlers/
  services/
  stores/
  utils/
  deploy-commands.js
  index.js
```

## วิธีใช้งาน

1. คัดลอก `.env.example` เป็น `.env`
2. ใส่ค่าให้ครบ
3. ติดตั้งแพ็กเกจ
4. deploy slash commands
5. start bot

```bash
npm install
npm run deploy
npm start
```

## Variables อยู่ที่ไหน

- Secret / ID จริง: `.env`
- Config ทั้งระบบ: `src/config/index.js`

## Commands ปัจจุบัน
- `/ping`
- `/professions`
- `/start-hunt`

## หมายเหตุ
ตอนนี้ store เป็นแบบ in-memory ถ้าบอท restart ข้อมูล run จะหาย
