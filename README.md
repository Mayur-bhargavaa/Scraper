# Stitchbyte — Google Maps Lead Generation System

<p align="center">
  <strong>Extract, qualify, and convert local business leads at scale.</strong>
</p>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Docker** (for MongoDB + Redis)
- **npm** 9+

### 1. Clone & Install

```bash
# Install all dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Start Infrastructure

```bash
docker-compose up -d
```

This launches MongoDB (port 27017) and Redis (port 6379).

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Install Playwright Browsers

```bash
cd server && npx playwright install chromium && cd ..
```

### 5. Run Development

```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

---

## 🏗 Architecture

```
Client (React + TailwindCSS v4)
    ↕ REST API + WebSocket
Server (Express + Socket.io)
    ↕ BullMQ Jobs
Engine (Playwright + Email Crawler)
    ↕ MongoDB (Data) + Redis (Queues)
```

### Processing Pipeline

```
Search Job Created
  → Scrape Worker (Google Maps / Places API)
    → Deduplication
      → Enrich Worker (Email Crawling)
        → Score Worker (Lead Scoring)
          → Job Complete ✅
```

---

## 📂 Project Structure

```
├── server/                  # Backend + Engine
│   ├── src/                 # Express API
│   │   ├── config/          # DB, Redis, env
│   │   ├── middleware/      # Auth, rate limiting
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   └── socket/          # WebSocket handlers
│   └── engine/              # Scraping Engine
│       ├── scrapers/        # Google Maps, Places API, Email
│       ├── workers/         # BullMQ workers
│       ├── queues/          # Queue definitions
│       └── utils/           # Anti-blocking, proxy, scoring
├── client/                  # Frontend
│   └── src/
│       ├── api/             # Axios client
│       ├── context/         # Auth context
│       ├── hooks/           # WebSocket, jobs hooks
│       ├── components/      # Reusable components
│       └── pages/           # Route pages
├── docker-compose.yml       # MongoDB + Redis
└── .env.example             # Environment template
```

---

## ⚙️ Features

| Feature | Status |
|---|---|
| Google Maps Scraping (Playwright) | ✅ |
| Google Places API (Fallback) | ✅ |
| Email Enrichment | ✅ |
| Anti-Blocking (Stealth, Delays) | ✅ |
| Proxy Rotation | ✅ |
| CAPTCHA Solving (2Captcha) | ✅ |
| Duplicate Filtering | ✅ |
| Lead Scoring & Tags | ✅ |
| Export (CSV, Excel, JSON) | ✅ |
| Real-time Progress (WebSocket) | ✅ |
| Scheduling (Daily/Weekly) | ✅ |
| Multi-user Auth (JWT) | ✅ |
| Dashboard & Analytics | ✅ |
| Rate Limiting | ✅ |

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get profile |
| POST | `/api/jobs` | Create scraping job |
| GET | `/api/jobs` | List jobs |
| GET | `/api/jobs/:id` | Job details |
| GET | `/api/leads` | List leads (filtered, sorted, paginated) |
| GET | `/api/leads/stats` | Lead statistics |
| DELETE | `/api/leads/:id` | Delete lead |
| GET | `/api/export` | Export leads |
| POST | `/api/schedules` | Create schedule |
| GET | `/api/schedules` | List schedules |
| PUT | `/api/schedules/:id` | Update schedule |
| DELETE | `/api/schedules/:id` | Delete schedule |
| POST | `/api/schedules/:id/run` | Run schedule now |

---

## 🧠 Lead Scoring

| Signal | Score | Tag |
|---|---|---|
| Rating < 3.5 | +30 | High Potential |
| Rating 3.5-4.0 | +20 | High Potential |
| No website | +25 | High Potential |
| Has email | +15 | — |
| Reviews < 10 | +15 | Cold |
| Rating ≥ 4.5 + Reviews ≥ 100 | — | Premium |

---

## 📦 Deployment (Oracle Cloud VM)

```bash
# Install PM2
npm install -g pm2

# Build frontend
npm run build --workspace=client

# Start with PM2
pm2 start server/src/index.js --name stitchbyte

# Nginx config → proxy to port 5000
# SSL → certbot --nginx
```

---

## 📄 License

MIT © Stitchbyte
# Scraper
