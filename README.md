# ApexPulse — Dynamic Portfolio Dashboard

A full-stack portfolio tracking dashboard that pulls live stock data (prices, P/E ratios, earnings) and displays it in a clean, real-time updating table grouped by sector.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS v4 |
| Backend   | Node.js, Express, TypeScript                    |
| Data      | Yahoo Finance (CMP), Google Finance (P/E, Earnings) |
| UI Libs   | @tanstack/react-table, Recharts, Lucide Icons   |
| HTTP      | Axios (backend scraping), native fetch client   |

---

## Project Structure

```
ApexPulse/
├── frontend/          # Next.js application
└── backend/           # Express REST API
```

---

## Getting Started

### Prerequisites

- Node.js v20+
- npm v10+

---

### 1. Clone and navigate

```bash
git clone https://github.com/Anandtech09/ApexPulse.git
cd ApexPulse
```

---

### 2. Backend Setup

```bash
cd backend

# Copy environment file and fill in values
cp .env.example .env

# Install dependencies
npm install

# Start development server (auto-restarts on file changes)
npm run dev
```

Backend runs at → `http://localhost:5000`

#### Backend npm scripts

| Command             | What it does                              |
|---------------------|-------------------------------------------|
| `npm run dev`       | Start with nodemon + tsx (hot reload)     |
| `npm run build`     | Compile TypeScript to `dist/`             |
| `npm run start`     | Run compiled output from `dist/`          |
| `npm run type-check`| Check types without emitting files        |

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (already done if you ran create-next-app)
npm install

# Start development server
npm run dev
```

Frontend runs at → `http://localhost:3000`

#### Frontend npm scripts

| Command          | What it does                             |
|------------------|------------------------------------------|
| `npm run dev`    | Start Next.js dev server with HMR        |
| `npm run build`  | Build production bundle                  |
| `npm run start`  | Serve the production build               |
| `npm run lint`   | Run ESLint checks                        |

---

## Environment Variables

- Create a `.env` file inside `backend/` based on `.env.example`
- Create a `.env.local` inside `frontend/` based on `.env.example`

## Features

- **Live Portfolio Table** — Displays 29 stock holdings with purchase price, quantity, investment, CMP, present value, and gain/loss
- **Dynamic Highlights** — Visually flash row cells green/red on CMP changes during polling
- **Twin Polling Cycles** — Auto-refresh prices every 15 seconds, and fundamental ratios every hour
- **Sector Grouping & Summary** — Group holdings by sector with sector summaries (Total Cost, Present Value, Total Return)
- **Fuzzy Search & Filters** — Real-time filter controls by stock name/exchange, exchange code, or technical advisory stage
- **Brand Favicon Logos** — Google S2 API brand icon rendering next to stock particulars
- **Google & Yahoo Finance Fallbacks** — Scrapes Google Finance for P/E & EPS, with automatic Yahoo Finance API querying if scraping is rate-limited
- **Responsive Layout** — Tailored glassmorphism Obsidian theme with mobile optimization to prevent viewport overflows
- **Error Boundaries** — Catches backend exceptions and displays cached data with delayed-status warnings

---

## API Endpoints

| Method | Endpoint                   | Description                        |
|--------|----------------------------|------------------------------------|
| GET    | `/api/health`              | Server health check                |
| GET    | `/api/portfolio`           | Get all portfolio holdings         |
| GET    | `/api/stocks/prices`       | Fetch live CMP from Yahoo Finance  |
| GET    | `/api/stocks/fundamentals` | Fetch P/E and earnings from Google |

---

## Testing, Linters & Quality Checks

We use a comprehensive suite of automated tests and static analysis tools to verify data safety and codebase health:

### 1. Automated Testing (Backend)
The backend uses **Jest** with `ts-jest` for compile-safe execution. It features **46 automated unit and integration tests**:
```bash
cd backend
npm run test
```
or
```bash
cd backend
npx jest src/__tests__/unit/config.test.ts
```
- **Unit tests**: Validates config parsing, cache TTL behaviors, Yahoo Finance quote map mappings, and Google scraper HTML parsing.
- **Integration tests**: Performs router queries via `supertest` to confirm status codes, content types, health indicators, and global error catch states.

### 2. Static Type Checks (Backend & Frontend)
Ensure TypeScript type safety without compile steps:
```bash
# Backend
cd backend && npm run type-check

# Frontend
cd frontend && npx tsc --noEmit
```

### 3. Code Linter (Frontend)
Ensure Next.js and React structural compliance:
```bash
cd frontend
npm run lint
```

---

## Technical Challenges & Architectural Choices

### 1. External Scrapers & Rate Limiting
Yahoo Finance and Google Finance do not offer free official APIs. Scraping them directly can lead to IP blocks and rate limits.
- **Throttling Scraper Concurrency**: To fetch P/E ratios and Earnings for 29 stocks concurrently, we throttle requests to batches of 5 at a time (configured via `GOOGLE_FINANCE_CONCURRENCY` env variable) rather than hitting Google with all 29 requests at once.
- **Backend Caching**: We wrap Yahoo Finance calls in a 60-second in-memory cache, and Google scraper-scrapes in a 1-hour in-memory cache. This prevents the frontend's 15s price polling and 1h page updates from hammering third-party servers.

### 2. High-Performance Dashboard Updates
- **Render Optimsations**: The custom `usePortfolio` hook memoizes calculations via `useMemo` so that sector grouping is only calculated when the positions, prices, or fundamentals change, rather than on every tick.
- **CSS Pulse Highlights**: Custom keyframes (`animate-flash-green` / `animate-flash-red`) flash the cell background in real-time when the stock price changes, without triggering slow cascading paint renders on the surrounding rows.
