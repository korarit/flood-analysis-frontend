# 🌊 Flood Analysis Frontend (Water Situation Platform)

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TanStack Router](https://img.shields.io/badge/TanStack_Router-1.170-FF4154?style=flat&logo=react-table&logoColor=white)](https://tanstack.com/router)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=flat&logo=leaflet&logoColor=white)](https://leafletjs.com/)

**Flood Analysis Frontend** คือ Web Platform สำหรับติดตาม, วิเคราะห์ และรายงานสถานการณ์น้ำและอุทกภัยแบบรวมศูนย์ ออกแบบมาเพื่อรองรับหลายลุ่มน้ำ (Multi-Basin) ในแพลตฟอร์มเดียว พร้อมแผนที่โต้ตอบแบบเรียลไทม์ การวิเคราะห์แนวโน้มระดับน้ำและปริมาณน้ำฝนย้อนหลัง ตลอดจนการสรุปสถานการณ์ต้นน้ำ-ท้ายน้ำ

---

## ✨ คุณสมบัติเด่น (Key Features)

### 🏞️ 1. ระบบรองรับหลายลุ่มน้ำ (Multi-Basin Architecture)
- หน้า Landing Page รวมภาพรวมทุกลุ่มน้ำ (เช่น ลุ่มน้ำยม, ลุ่มน้ำปิง, ลุ่มน้ำวัง, ลุ่มน้ำน่าน, ลุ่มน้ำเจ้าพระยา ฯลฯ)
- สลับดูลุ่มน้ำต่างๆ ได้อย่างราบรื่นผ่าน Dynamic Routing (`/basin/$basinSlug`)
- ดีไซน์ระบบ UI และ Components กลางที่สามารถขยายไปทุกลุ่มน้ำได้ทันทีโดยไม่ต้องเขียนโค้ดใหม่

### 📊 2. ภาพรวมสถานการณ์น้ำ (Basin Overview & Situation Summary)
- **Situation Summary Cards**: สรุปจำนวนสถานีวิกฤต, ระดับน้ำเฉลี่ย, และปริมาณฝนสะสม
- **Top Rainfall & Water Level**: จัดอันดับสถานีที่มีปริมาณน้ำฝนสูงสุดและระดับน้ำเสี่ยงล้นตลิ่ง
- **River Chain View**: แสดงลำดับการไหลของน้ำในลุ่มน้ำ (Upstream ➔ Midstream ➔ Downstream) ช่วยให้คาดการณ์มวลน้ำล่วงหน้าได้
- **Recent Events Feed**: อัปเดตเหตุการณ์สำคัญและการเตือนภัยน้ำหลากล่าสุด

### 🗺️ 3. แผนที่สถานีโทรมาตรแบบโต้ตอบ (Interactive Map)
- แผนที่แสดงตำแหน่งสถานีวัดระดับน้ำและวัดน้ำฝนด้วย **Leaflet**
- กรองสถานีตามประเภท (ระดับน้ำ / น้ำฝน) และระดับการเตือนภัย (ปกติ, เฝ้าระวัง, เตือนภัย, วิกฤต)
- Popups และ Modal แสดงข้อมูลโทรมาตรล่าสุดแบบละเอียด

### 📡 4. ระบบข้อมูลสถานีและกราฟย้อนหลัง (Station Details & Analytics)
- กราฟ Time-Series แสดงข้อมูลย้อนหลังสูงสุด 7 วัน ด้วย **Recharts**
- มาตรวัดระดับน้ำ (Telemetry Gauge) เทียบกับระดับตลิ่งและระดับวิกฤต
- แสดงความสัมพันธ์ของสถานีข้างเคียง (สถานีต้นน้ำ-ท้ายน้ำ)
- แจ้งเตือนเมื่อข้อมูลขาดหายหรือไม่อัปเดต (Data Gap Alerts & Freshness Badges)

### 📍 5. ระบบสถานีใกล้ฉัน (Nearby / Reference Station)
- กำหนดสถานีอ้างอิงส่วนตัวเพื่อติดตามสถานการณ์ในพื้นที่ของตนเองได้อย่างรวดเร็ว
- เก็บข้อมูลผ่าน **Local Storage** ของเบราว์เซอร์ เพื่อความเป็นส่วนตัว (ไม่จัดเก็บพิกัดผู้ใช้บนเซิร์ฟเวอร์)

### 📋 6. รายงานสรุปสถานการณ์ (Daily Bulletin & Reports)
- สรุปสถานการณ์น้ำประจำวัน (Daily Bulletin)
- วิเคราะห์แนวโน้มและเตรียมพร้อมรับมืออุทกภัย

### 🌓 7. ประสบการณ์ใช้งานที่ลื่นไหล (Modern UX/UI)
- รองรับโหมดมืด / โหมดสว่าง (**Dark & Light Theme**)
- รองรับ 2 ภาษา (**ไทย / English**)
- Responsive เต็มรูปแบบ รองรับทั้ง Desktop, Tablet และ Mobile (มี Mobile Bottom Navigation)

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| หมวดหมู่ | เทคโนโลยี |
| :--- | :--- |
| **Core Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 8](https://vitejs.dev/) |
| **Routing** | [TanStack React Router](https://tanstack.com/router) (File-based routing pattern) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) + [PostCSS](https://postcss.org/) + `clsx` / `tailwind-merge` |
| **Map Engine** | [Leaflet](https://leafletjs.com/) |
| **Data Visualization** | [Recharts](https://recharts.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
flood-analysis-frontend/
├── public/                     # Static assets
├── src/
│   ├── components/             # Reusable UI Components
│   │   ├── basin/              # Basin overview components (RiverChain, TopLists, Summary)
│   │   ├── common/             # Base UI (StatusBadge, LoadingSkeleton, MetricCard, etc.)
│   │   ├── layout/             # Layouts, AppHeader, MobileBottomNav, SearchModal
│   │   ├── map/                # Leaflet map, Filter control, Legend, Station modal
│   │   ├── report/             # Daily bulletin & Report generators
│   │   └── station/            # Station detail cards, Gauges, Historical charts
│   ├── hooks/                  # Custom React hooks (useTheme, useLanguage, useStationData)
│   ├── routes/                 # TanStack Router Route Components
│   │   ├── __root.tsx          # Root route layout
│   │   ├── index.tsx           # Basin Selection (Home page)
│   │   └── basin/              # Dynamic Basin Subroutes
│   │       ├── $basinSlug.index.tsx               # Basin Overview
│   │       ├── $basinSlug.map.tsx                 # Basin Interactive Map
│   │       ├── $basinSlug.station.index.tsx       # Station Directory
│   │       ├── $basinSlug.station.$stationId.tsx  # Station Deep-Dive
│   │       ├── $basinSlug.nearby.tsx              # Nearby Station Manager
│   │       ├── $basinSlug.event.tsx               # Event & Flood Alerts
│   │       ├── $basinSlug.report.tsx              # Basin Situation Bulletin
│   │       └── $basinSlug.settings.tsx            # Preferences & Config
│   ├── services/               # Data fetching, Mock data, & Local storage services
│   │   └── data/               # Station telemetry & topology datasets
│   ├── types/                  # TypeScript Interfaces & Types
│   ├── index.css               # Tailwind & Global design tokens
│   ├── main.tsx                # Application Entry Point
│   └── router.tsx              # TanStack Router instance & route tree definition
├── index.html                  # HTML template
├── package.json                # Project dependencies and npm scripts
├── tailwind.config.js          # Tailwind theme configuration
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite build configuration
```

---

## 🚀 เริ่มต้นใช้งาน (Getting Started)

### ความต้องการของระบบ (Prerequisites)
- [Node.js](https://nodejs.org/) version 18.0 หรือใหม่กว่า
- [npm](https://www.npmjs.com/) หรือ [bun](https://bun.sh/) / [pnpm](https://pnpm.io/)

### 1. ติดตั้ง Dependencies

```bash
# Clone the repository
git clone https://github.com/korarit/flood-analysis-frontend.git
cd flood-analysis-frontend

# Install dependencies
npm install
```

### 2. รันใน Development Mode

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:5173](http://localhost:5173) เพื่อเริ่มใช้งาน

### 3. Build สำหรับ Production

```bash
npm run build
```

ไฟล์พร้อม Deploy จะถูกสร้างไว้ในโฟลเดอร์ `dist/`

### 4. Preview Production Build

```bash
npm run preview
```

---

## 🌐 โครงสร้างเส้นทาง URL (Routing Structure)

| Path | รายละเอียด |
| :--- | :--- |
| `/` | หน้าหลัก: เลือกลุ่มน้ำ และดูสรุปสถานการณ์รวมทั่วประเทศ |
| `/basin/:basinSlug` | หน้าภาพรวมสถานการณ์ของลุ่มน้ำที่เลือก (เช่น `/basin/yom`) |
| `/basin/:basinSlug/map` | แผนที่สถานการณ์น้ำแบบโต้ตอบ |
| `/basin/:basinSlug/station` | รายการสถานีโทรมาตรและการค้นหา |
| `/basin/:basinSlug/station/:stationId` | ข้อมูลเชิงลึกของสถานี (กราฟย้อนหลัง, ต้นน้ำ-ท้ายน้ำ) |
| `/basin/:basinSlug/nearby` | จัดการและติดตามสถานีใกล้ฉัน |
| `/basin/:basinSlug/event` | เหตุการณ์น้ำหลากและการเตือนภัย |
| `/basin/:basinSlug/report` | รายงานสรุปสถานการณ์ประจำวัน (Daily Bulletin) |
| `/basin/:basinSlug/settings` | การตั้งค่าระบบ (ภาษา, ธีม, การแจ้งเตือน) |

---

## 📄 ใบอนุญาต (License)

โปรเจกต์นี้เผยแพร่ภายใต้ [MIT License](LICENSE)
