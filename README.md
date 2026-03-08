# Treasure Hunt Bot (Neon + Solo + Admin Approval)

ระบบล่าสุด:
- 1 ห้อง = 1 panel = 1 สาย
- ผู้เล่นกด `เปิด Ticket`
- ticket เริ่มที่ `pending_approval`
- แอดมิน/สตาฟกด `อนุมัติภารกิจ` แล้วค่อยเริ่ม quest จริง
- ผู้เล่นกดได้แค่ `ดู Clue ปัจจุบัน` และ `ยกเลิกภารกิจ`
- แอดมิน/สตาฟกด `ปลดล็อก Clue ถัดไป`, `สำเร็จภารกิจ`, `ปิด Ticket`
- เมื่อ complete แล้วบอทจะพยายามให้ role และส่งสรุปไปห้อง `submission_channel_id` ของสายนั้น ก่อนลบ ticket

ต้องใช้ schema ใน Neon ที่มีตาราง:
- professions
- clues
- quest_runs
- quest_logs

และใน `professions` ควรมี:
- panel_channel_id
- panel_message_id
- submission_channel_id
- mission_title
- level_text
- difficulty_stars
- reward_text
