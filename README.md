# CS100 Power Up! – Personal Learning Portfolio (กลุ่ม G21)

เว็บแอปสำหรับสร้าง Portfolio การเรียนรู้ของตัวเอง และเพิ่มผลงานหรือกิจกรรมได้หลายรายการ
ข้อมูลทั้งหมดถูกเก็บไว้ในเบราว์เซอร์ (localStorage) ยังไม่ใช้เซิร์ฟเวอร์

## How to open the website(วิธีเปิดเว็บไซต์)

```bash
git clone https://github.com/TanaponPhewmore/TEAMPROJECT_G21.git
cd TEAMPROJECT_G21
```

จากนั้นเปิดไฟล์ `index.html` ด้วยเบราว์เซอร์ (หรือใช้ Live Server ใน VS Code ก็ได้)

**Essentials (สิ่งที่ต้องมี)**

- ต่ออินเทอร์เน็ตไว้ เพราะเว็บโหลด Bootstrap จาก CDN
- ใช้เบราว์เซอร์เวอร์ชันใหม่ เพราะ Bootstrap 6 (alpha) รองรับ
  Chrome / Edge 130 ขึ้นไป, Firefox 132 ขึ้นไป, Safari 18 ขึ้นไป

## How to use (วิธีใช้งาน)

1. **สร้าง Portfolio** – ในกล่อง *Create a portfolio* กรอก Display name
   (จำเป็น) และช่อง What I enjoy / What I've tried / What I'm curious about
   แล้วกด **Create portfolio**
2. **เพิ่มผลงาน** – ในกล่อง *Add portfolio item* เลือก Portfolio ที่ต้องการจากช่อง
   *Select portfolio* แล้วกรอก Title, Type, Date, Role, Description, Skills
   (คั่นแต่ละทักษะด้วยเครื่องหมายจุลภาค), Reflection ทั้ง 4 ช่อง และ Evidence URL
   จากนั้นกด **Add portfolio item**
3. **ดูผลงาน** – ผลงานจะแสดงในส่วน *My Portfolios* ด้านล่างทันที
4. **ลองกรอกผิด** – เว้นช่องที่จำเป็นว่าง หรือใส่ Evidence URL ที่ไม่ถูกต้อง
   เว็บต้องแจ้งเตือนและไม่บันทึกข้อมูล
5. **ลองหลาย Portfolio** – สร้างอย่างน้อย 2 Portfolio และใส่ผลงาน Portfolio ละ 2 รายการ
   ข้อมูลของแต่ละ Portfolio ต้องไม่ปนกัน
6. **ลอง Refresh** – กด F5 หรือปิดแล้วเปิดเบราว์เซอร์เดิมอีกครั้ง
   ข้อมูลเดิมต้องกลับมาครบ
7. **ลองบนมือถือ** – เปิดหน้าเว็บบนมือถือ หรือกด F12 แล้วกดไอคอนมือถือ
   (Toggle device toolbar) เพื่อดูหน้าจอเล็ก

## ข้อจำกัดของข้อมูล

ข้อมูลถูกเก็บใน localStorage ของเบราว์เซอร์ จึงแยกกันตามเบราว์เซอร์และเครื่อง
การเปิดเว็บด้วยอีกเบราว์เซอร์หรืออีกเครื่องจะไม่เห็นข้อมูลเดียวกัน

## Repo Structure (โครงสร้างไฟล์)

```
TEAMPROJECT_G21/
├── index.html                 หน้าเว็บหลัก (ฟอร์ม และที่แสดงผลงาน)
├── app.js                     โค้ด JavaScript (อ่านฟอร์ม, ตรวจข้อมูล, บันทึก/โหลด localStorage)
├── css/
│   └── style.css              สไตล์ของเว็บ
├── sample-portfolio-1.json    ตัวอย่างข้อมูล Portfolio 1
├── sample-portfolio-2.json    ตัวอย่างข้อมูล Portfolio 2
└── README.md                  
```

## Tools ที่ใช้

- HTML, CSS, Bootstrap 6 alpha (ผ่าน CDN)
- JavaScript
- localStorage
