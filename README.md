# 🏪 OurFood — Merchant Web Application

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

> Restaurant management dashboard for the **OurFood** food delivery ecosystem. Enables restaurant owners to manage menus, process orders live, track delivery drivers, and view sales analytics in real-time.

---

## 👥 Contributors & Credits

- **Merchant App Duo**:
  -[GiovanniKhaidzan](https://github.com/giovannikhaidzan)
  -[OverHeight](https://github.com/overheight)

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite 6
- **Language**: TypeScript (~v5.8)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React (`lucide-react`)
- **Backend & Realtime**: Supabase Client (`@supabase/supabase-js`)
- **Routing**: React Router v7
- **Analytics & Graphs**: Recharts (`recharts`)
- **Animations**: Framer Motion (`motion`)

---

## ⚡ Key Features

1. **Merchant Authentication & Store Switching**: Select active merchant store from database dynamically.
2. **Realtime Order Workflow**: Subscribes live to Supabase Postgres changes on `orders` table (`WAITING_MERCHANT` → `PREPARING` → `READY_FOR_PICKUP`).
3. **Menu & Stock Management**: Add, edit, delete menu items, set pricing, upload images, toggle availability (`tersedia` / `habis`), and manage inventory stock levels with low-stock warnings.
4. **Store Status Switcher**: Toggle store status live between `BUKA` (Open), `TUTUP` (Closed), and `TIDAK_MENERIMA` (Not accepting orders), persisted live in database.
5. **Revenue Analytics**: Daily, weekly, and monthly revenue performance graphs powered by real order transaction records.
6. **Live Driver Tracking**: Embedded map displaying delivery destinations and driver coordinates updated via Supabase Realtime.
7. **Customer Reviews**: View customer ratings (1-5 stars) and comments loaded from `review_merchant` table.
8. **Printable Receipts**: Generate printable order receipts (`window.print()`).

---

## 🗄️ Database Integration

Uses shared Supabase PostgreSQL backend:
- **Status Enums**: `order_status` (`WAITING_MERCHANT`, `PREPARING`, `READY_FOR_PICKUP`, `ON_THE_WAY`, `DELIVERED`, `CANCELLED_BY_MERCHANT`), `status_toko_types` (`BUKA`, `TUTUP`, `TIDAK_MENERIMA`).
- **Tables**: `merchant`, `menu`, `kategori`, `orders`, `order_item`, `transaction`, `driver`, `user_address`, `review_merchant`.

---

## ⚙️ Environment Variables

Create `.env` in `OurFood-Merchant`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📁 Directory Structure

```
OurFood-Merchant/
├── src/
│   ├── components/      # ActiveOrders, MenuManagement, RevenueChart, etc.
│   ├── hooks/           # useOrders, useMenu, useMerchant
│   ├── lib/             # Supabase client & DB types
│   ├── pages/           # LoginPage, MerchantApp, CustomerApp
│   ├── services/        # Supabase API services
│   ├── types.ts         # TypeScript UI interfaces
│   └── main.tsx         # App entrypoint
└── package.json
```
