# Gymkhana Inventory

BERM equipment inventory API and web UI for managing assets, borrowing, and alerts.

## Stack

- **Backend:** Node.js, Express, PostgreSQL, PASETO auth
- **Frontend:** React + Vite (in `frontend/`)

## Setup

```bash
cp .env.example .env
# set DATABASE_URL and PASETO_V3_LOCAL_KEY_BASE64

npm install
npm run db:migrate
```

Generate a PASETO key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Run

Terminal 1 — API (port 3000):

```bash
npm run dev
```

Terminal 2 — UI (port 5173, proxies `/api` to the backend):

```bash
npm run dev:frontend
```

Open http://localhost:5173

## Frontend pages

| Page | Purpose |
|------|---------|
| Login / Register | Auth |
| Dashboard | Counts, overdue loans, open alerts |
| Assets | Search, create, delete equipment |
| Borrowing | Request / issue / return / renew / cancel |
| Alerts | Acknowledge, resolve, dismiss, generate |
| Catalog | Categories, locations, org units |
