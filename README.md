# CS100 Power Up! – Personal Learning Portfolio (กลุ่ม G21)

เว็บแอปสำหรับสร้าง Portfolio การเรียนรู้ของตัวเอง เพิ่มผลงาน (Portfolio Item) ได้หลายรายการ และรับผลงานจากกิจกรรม Challenge ของเพื่อนกลุ่มอื่นด้วยการวาง JSON (Import) รวมถึงดาวน์โหลด Portfolio ของตัวเองเป็นไฟล์ JSON (Export)

ข้อมูลทั้งหมดถูกเก็บเป็นไฟล์ JSON บน **Server (PHP + Apache บน AWS EC2)** ทุกเครื่องที่เปิดเว็บเดียวกันจึงเห็นข้อมูลชุดเดียวกัน และข้อมูลยังอยู่หลัง Restart Server

| | |
|---|---|
| **เว็บไซต์ (Public URL)** | http://35.169.43.135/ |
| **GitHub Repository** | https://github.com/TanaponPhewmore/TEAMPROJECT_G21 |

> เปิดด้วย `http://` เท่านั้น (ไม่ใช่ `https://`) เพราะ Server ยังไม่ได้ตั้งค่า HTTPS

---

## ฟีเจอร์

- **Create Portfolio** – สร้างได้หลาย Portfolio โดยข้อมูลแต่ละอันไม่ปนกัน
- **Add Portfolio Item** – เพิ่มผลงานได้หลายรายการต่อ Portfolio (Title, Type, Date, Role, Description, Skills, Reflection 4 ช่อง, Evidence URL)
- **Import Portfolio Item** – วาง JSON ของผลงานที่ได้จากบูธ Challenge ของเพื่อน แล้วบันทึกเข้า Portfolio ที่เลือก (Import ซ้ำไม่ได้)
- **Export JSON** – ดาวน์โหลด Portfolio เป็นไฟล์ `my-portfolio.json`
- **Validation 2 ชั้น** – ตรวจที่เบราว์เซอร์ และตรวจซ้ำที่ Server ก่อนบันทึกทุกครั้ง

---

## วิธีติดตั้งบน AWS EC2 (Ubuntu)

**1. สร้าง EC2 (Ubuntu) และตั้งค่า Security Group** เปิดเฉพาะ Port ที่จำเป็น

| Port | ใช้ทำอะไร | อนุญาตจาก |
|---|---|---|
| 80 (HTTP) | ให้ผู้ใช้เปิดเว็บ | ทุกที่ |
| 22 (SSH) | เข้าไปจัดการเครื่อง | **IP ของเราเท่านั้น** |

ไฟล์ `.pem` (key) เก็บไว้นอกโฟลเดอร์โปรเจกต์ และห้ามนำขึ้น GitHub

**2. เชื่อมต่อและติดตั้ง Apache, PHP, Git**

```bash
ssh -i labsuser.pem ubuntu@<Public IP>

sudo apt update
sudo apt install -y apache2 php libapache2-mod-php git rsync
sudo systemctl enable --now apache2
```

**3. นำโค้ดไปไว้ที่โฟลเดอร์เว็บ**

```bash
git clone https://github.com/TanaponPhewmore/TEAMPROJECT_G21.git
sudo rsync -a --exclude .git ~/TEAMPROJECT_G21/ /var/www/html/
```

(ใช้ `--exclude .git` เพื่อไม่ให้ประวัติ Git ถูกเปิดผ่าน URL)

**4. สร้างโฟลเดอร์เก็บข้อมูล (ต้องอยู่นอกโฟลเดอร์เว็บ)**

```bash
sudo mkdir -p /var/www/data
sudo chown www-data:www-data /var/www/data
sudo chmod 750 /var/www/data
```

โค้ดใน `api/storage.php` เก็บข้อมูลที่ `/var/www/data/portfolios.json` ซึ่งอยู่นอก `/var/www/html` จึงเปิดดาวน์โหลดผ่าน URL ตรง ๆ ไม่ได้ และมีไฟล์ล็อก `portfolios.lock` กันการบันทึกพร้อมกัน

**5. เปิดเว็บ**

**อัปเดตโค้ดภายหลัง**

```bash
cd ~/TEAMPROJECT_G21 && git pull
sudo rsync -a --exclude .git ~/TEAMPROJECT_G21/ /var/www/html/
```

**หมายเหตุ:** Restart แบบ Reboot (`sudo reboot`) ไม่ทำให้ที่อยู่เว็บเปลี่ยน แต่ถ้า **Stop แล้ว Start** Instance ที่อยู่ (Public IP/DNS) จะเปลี่ยน เว้นแต่ใช้ Elastic IP

---

## วิธีรันบนเครื่องตัวเอง (Local)

ต้องมี **PHP 8 ขึ้นไป** และ Git

```bash
git clone https://github.com/TanaponPhewmore/TEAMPROJECT_G21.git
cd TEAMPROJECT_G21
php -S localhost:8000
```

แล้วเปิด http://localhost:8000

- **ห้ามเปิด `index.html` ด้วยการดับเบิลคลิก หรือใช้ Live Server** เพราะ API เป็นไฟล์ PHP ต้องเปิดผ่าน PHP Server
- ข้อมูลบนเครื่องจะถูกเก็บที่ `local-data/portfolios.json` (อยู่ใน `.gitignore` จึงไม่ขึ้น GitHub)
- ต้องต่ออินเทอร์เน็ต เพราะหน้าเว็บโหลด Bootstrap จาก CDN
- บน EC2 **ไม่ใช้** `php -S` เพราะจะเก็บข้อมูลไว้ในโฟลเดอร์ที่เปิดผ่าน URL ได้ ให้ใช้ Apache ตามขั้นตอนด้านบน

---

## วิธีใช้งาน

1. **สร้าง Portfolio** – ในกล่อง *Create a portfolio* กรอก Display name (จำเป็น) และช่อง What I enjoy / What I've tried / What I'm curious about แล้วกด **Create portfolio**
2. **เพิ่มผลงาน** – ในกล่อง *Add portfolio item* เลือก Portfolio จากช่อง *Select portfolio* แล้วกรอกทุกช่อง
   - Skills คั่นแต่ละทักษะด้วยเครื่องหมายจุลภาค เช่น `HTML, CSS`
   - Date ใช้รูปแบบ `YYYY-MM-DD`
   - Evidence URL ต้องขึ้นต้นด้วย `http://` หรือ `https://`
   - แล้วกด **Add portfolio item**
3. **ดูผลงาน** – ผลงานแสดงในส่วน *My Portfolios* แยกตาม Portfolio โดย Skills เป็นรายการ และ Evidence เป็นลิงก์ที่กดได้
4. **Refresh หรือเปิดเบราว์เซอร์อื่น** – ข้อมูลเดิมต้องกลับมาครบ เพราะอ่านจาก Server

---

## Challenge ของกลุ่มเรา: Spot the Scam

**แนวคิด:** เราจำลองบทสนทนาแชท (เหมือนข้อความที่เจอในแอปแชทจริง) แล้วให้เพื่อนเล่นเป็นควิซว่า **ข้อความหรือคนที่คุยด้วยเป็นมิจฉาชีพ / สแปม หรือไม่ใช่** เพื่อฝึกสังเกตสัญญาณของการหลอกลวงออนไลน์

- **ประเภท:** Digital Literacy
- **ทักษะ:** Critical Thinking, Problem Solving, Digital Literacy
- **ใช้เวลา:** ประมาณ 5–10 นาที
- **คำถามสะท้อนความคิด (Evidence prompt):** "เรียนรู้อะไรเกี่ยวกับการสังเกตข้อความหลอกลวง?"
- **Evidence ที่ใช้:** `<ใส่ลิงก์หลักฐานของ Challenge เช่น หน้าผลควิซ>`

### วิธีทำ Challenge (ที่บูธ)

**ฝ่ายเจ้าของบูธ (Host)**
1. ให้เพื่อน (Tester) อ่านข้อความแชทจำลอง แล้วตอบว่าแต่ละข้อความเป็นมิจฉาชีพหรือสแปมหรือไม่
2. เมื่อเพื่อนทำเสร็จ ให้ถามว่าเพื่อนสังเกตอะไร / เรียนรู้อะไร / เจอความยากตรงไหน
3. ส่งข้อความ JSON ให้เพื่อน

**ฝ่ายเพื่อน (Tester)**
1. เปิดเว็บของกลุ่มตัวเอง ไปที่กล่อง **Import portfolio item**
2. เลือก Portfolio ที่ต้องการ แล้ววาง JSON ที่ได้รับ
3. แก้ Reflection ตามที่ได้ไปเล่นมา
4. กด **Import** ผลงานจะถูกบันทึกบน Server และแสดงใน Portfolio
5. Refresh เพื่อตรวจว่าข้อมูลยังอยู่

---

## Import / Export Portfolio Item

### รูปแบบ Portfolio Item JSON

ไม่ต้องใส่ `id` เพราะ Server สร้างให้เอง

```json
{
  "title": "Spot the Scam",
  "type": "Digital Literacy",
  "date": "2026-11-24",
  "role": "Participant",
  "description": "Completed a phishing awareness challenge.",
  "skills": ["Critical Thinking", "Problem Solving", "Digital Literacy"],
  "reflection": {
    "whatIDid": "Looked at 5 example messages and marked which were scams.",
    "whatILearned": "I learned how to identify online scams.",
    "challenge": "Some scam messages looked very real.",
    "nextStep": "Check the sender address before clicking any link."
  },
  "evidence": ["https://example.com/spot-the-scam-result"]
}
```

### กติกาของ Import

| ข้อมูล | ต้องเป็น |
|---|---|
| `title`, `type`, `role`, `description` | ข้อความ ห้ามว่าง |
| `date` | `YYYY-MM-DD` และเป็นวันที่จริง |
| `skills` | list อย่างน้อย 1 รายการ |
| `reflection` | **object** ที่มี 4 ช่อง: `whatIDid`, `whatILearned`, `challenge`, `nextStep` (ห้ามเป็นข้อความเฉย ๆ) |
| `evidence` | list ของลิงก์ที่ขึ้นต้นด้วย `http://` หรือ `https://` (ชื่อไฟล์เช่น `result.png` ใช้ไม่ได้) |

- **ข้อมูลผิดรูปแบบ** → เว็บแจ้งข้อความเตือนที่เข้าใจง่าย และ **ไม่บันทึก**
- **Import ซ้ำไม่ได้** → ถ้าข้อมูลเหมือนกันทุกช่องกับผลงานที่มีอยู่แล้วใน Portfolio เดียวกัน เว็บจะแจ้งว่า "This item is already in this portfolio." (Server ตรวจซ้ำอีกชั้น แม้เปิดจากเบราว์เซอร์หลายตัว) ถ้าแก้ข้อมูลช่องใดช่องหนึ่งจะนับเป็นผลงานใหม่

### Export

กดปุ่ม **Export JSON** ในการ์ดของ Portfolio จะได้ไฟล์ **`my-portfolio.json`** ที่มีข้อมูล Portfolio นั้นพร้อมผลงานทั้งหมด (รวมผลงานที่ Import จากเพื่อน) ในรูปแบบเดียวกับ `sample-portfolio-1.json`

---

## วิธีทดสอบระบบ (Functional Tests)

| การทดสอบ | วิธีทำ | ผลที่ต้องเห็น |
|---|---|---|
| **Cross-device & Persistence** | สร้าง Portfolio และเพิ่มผลงานใน Browser A → เปิดเว็บเดียวกันใน Browser B หรือเครื่องอื่น → Reboot EC2 (`sudo reboot`) แล้วเปิดใหม่ | Browser B เห็นข้อมูลเดียวกัน และข้อมูลยังอยู่หลัง Reboot |
| **Server Validation & File Access** | เว้นช่องว่างหรือใส่ Evidence ที่ไม่ใช่ลิงก์ แล้วลองเปิด `/api/storage.php`, `/.git/config` และ `/data/portfolios.json` | มีข้อความเตือนและไม่บันทึก, Server ปฏิเสธข้อมูลผิด (400), ที่เหลือขึ้น 404 — ดาวน์โหลดไฟล์ JSON ของ Server ผ่าน URL ไม่ได้ |
| **Cross-group Exchange** | รับ JSON จากบูธกลุ่มอื่น → วางใน Import → กด Import → ลอง Import ข้อมูลเดิมซ้ำ | ผลงานจากเพื่อนปรากฏใน Portfolio และยังอยู่หลัง Refresh, ซ้ำแล้วถูกปฏิเสธ |
| **Complete Challenge** | ทำ Challenge ของเพื่อน → Import เป็น Portfolio Item → Refresh → กด Export JSON | ผลงานถูกบันทึกบน Server เปิดดูย้อนหลังได้ และอยู่ในไฟล์ `my-portfolio.json` |
| **Feedback & Ownership** | ดูหัวข้อ Feedback & Ownership ด้านล่าง | มี GitHub Issue, Commit และหลักฐานการทดสอบของการแก้ไข |

ทดสอบเพิ่ม: สร้าง 2 Portfolio × 2 ผลงาน แล้วตรวจว่าแต่ละ Portfolio แสดงเฉพาะผลงานของตัวเอง และดูบนมือถือ (บนคอมพิวเตอร์ กด F12 แล้วเลือกไอคอน Toggle device toolbar)

**ข้อมูลตัวอย่าง:** `sample-portfolio-1.json` และ `sample-portfolio-2.json` เป็นข้อมูลสมมติ ไม่มีข้อมูลส่วนตัว

---

## ความปลอดภัยและข้อมูล

- **ข้อมูลอยู่ที่ Server** – เก็บเป็นไฟล์ `portfolios.json` บน EC2 ที่ `/var/www/data` นอกโฟลเดอร์เว็บ
- **Server ตรวจข้อมูลซ้ำ** – ตรวจช่องจำเป็น ความยาว วันที่ และ Evidence ต้องเป็นลิงก์ `http(s)` ก่อนบันทึกทุกครั้ง
- **ไม่นำข้อมูลลับขึ้น GitHub** – `.gitignore` กันไฟล์ `*.pem`, `*.key`, `.env` ฯลฯ ไว้แล้ว ไม่มี Password, AWS Credentials หรือ Private Key ใน Repository
- **Security Group** – เปิดเฉพาะ Port 80 (ทุกที่) และ Port 22 (เฉพาะ IP ของเรา)
- **ไม่ใส่ข้อมูลส่วนตัวที่เสี่ยง** – ใช้ชื่อสมมติและข้อมูลทดลองเท่านั้น
- ข้อมูลทั้งหมดอ่านจาก Server (ไม่ใช้ `localStorage` เป็นแหล่งข้อมูลหลัก)

---

## API

| Method | Path | ทำอะไร |
|---|---|---|
| GET | `api/portfolios.php` | ดึง Portfolio ทั้งหมดพร้อมผลงาน |
| POST | `api/portfolios.php` | สร้าง Portfolio ใหม่ |
| POST | `api/items.php` | เพิ่มผลงานเข้า Portfolio ที่ระบุด้วย `portfolioId` (ใช้ทั้งฟอร์มเพิ่มผลงานและ Import) |

รหัสตอบกลับ: ข้อมูลผิด → 400 พร้อมรายการข้อผิดพลาด, Import ซ้ำ → 409, ไม่พบ Portfolio → 404, วิธีเรียกผิด → 405

---

## โครงสร้างไฟล์

```
TEAMPROJECT_G21/
├── index.html                 หน้าเว็บหลัก (ฟอร์ม, Import, รายการ Portfolio)
├── app.js                     JavaScript ฝั่งเบราว์เซอร์ (อ่านฟอร์ม, ตรวจข้อมูล, เรียก API, Import/Export, แสดงผล)
├── css/
│   └── style.css              สไตล์ของเว็บ
├── api/
│   ├── portfolios.php         GET/POST Portfolio
│   ├── items.php              POST Portfolio Item (รวมตรวจ Import ซ้ำ)
│   ├── validate.php           ตรวจข้อมูลฝั่ง Server
│   └── storage.php            อ่าน/เขียนไฟล์ JSON พร้อมล็อก
├── Spot_the_Scam.json         ตัวอย่าง Portfolio Item JSON สำหรับ Import
├── sample-portfolio-1.json    ตัวอย่างข้อมูล Portfolio 1
├── sample-portfolio-2.json    ตัวอย่างข้อมูล Portfolio 2
├── .gitignore                 กันไฟล์ลับและข้อมูลบนเครื่อง
└── README.md
```

## Tools ที่ใช้

HTML, CSS, Bootstrap (ผ่าน CDN), JavaScript, PHP, ไฟล์ JSON, Apache บน AWS EC2 (Ubuntu), Git/GitHub
