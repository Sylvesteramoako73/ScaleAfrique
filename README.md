# ScaleAfrique — Marketing Platform for African Startups & SMEs

ScaleAfrique is a full-stack AI-powered marketing platform purpose-built for African startups and SMEs. It combines intelligent campaign management, community building, analytics, and an AI advisor with deep knowledge of African markets.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│   React 18 + TypeScript + Vite + TailwindCSS + Zustand         │
│   React Query (server state) · Socket.io-client (real-time)    │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP / WebSocket
┌───────────────────────────▼─────────────────────────────────────┐
│                        API LAYER                                │
│   Node.js + Express + TypeScript                                │
│   JWT Auth · Passport (local + Google OAuth)                   │
│   Express-validator · Helmet · CORS · Rate Limiting            │
└───────┬───────────────┬────────────────┬────────────────────────┘
        │               │                │
┌───────▼──────┐ ┌──────▼──────┐ ┌───────▼────────┐
│  PostgreSQL  │ │    Redis     │ │  Bull Queues   │
│  (Prisma ORM)│ │  (Cache +   │ │  (Email +      │
│              │ │  Sessions)   │ │   Social jobs) │
└──────────────┘ └─────────────┘ └────────────────┘
        │
┌───────▼──────────────────────────────────────────┐
│              EXTERNAL SERVICES                   │
│  Anthropic Claude (AI) · Nodemailer (Email)      │
│  Twitter API · Facebook API · AWS S3             │
└──────────────────────────────────────────────────┘
```

---

## Features

- **AI Marketing Advisor** — Powered by Claude claude-sonnet-4-6, tuned for African markets (Ghana, Nigeria, Kenya, South Africa, Egypt)
- **Campaign Management** — Multi-channel campaigns: Email, Social, Ads, Multi-channel
- **Analytics Dashboard** — ROI tracking, audience insights, channel performance
- **Community Hub** — Posts, events, resources, member networking
- **Onboarding Wizard** — Personalized setup for African startup context
- **Real-time Notifications** — Via Socket.io
- **Job Queues** — Async email and social posting via Bull + Redis

---

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

---

## Quick Start (Docker)

```bash
# Clone repo
git clone https://github.com/your-org/scaleafrique-platform.git
cd scaleafrique-platform

# Copy env
cp .env.example .env
# Edit .env with your API keys

# Start all services
docker-compose up -d

# Run migrations & seed
docker exec scaleafrique-backend npm run db:migrate
docker exec scaleafrique-backend npm run db:seed

# App is live at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Adminer DB UI: http://localhost:8080
```

---

## Local Development

### Backend

```bash
cd backend
npm install
cp ../.env.example .env
# Edit .env

# Start PostgreSQL & Redis (Docker)
docker-compose up postgres redis -d

# Run migrations
npm run db:generate
npm run db:migrate
npm run db:seed

# Start dev server
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:3000
```

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NODE_ENV` | development / production | Yes |
| `PORT` | Backend server port (default 5000) | Yes |
| `FRONTEND_URL` | Frontend origin for CORS | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | Secret for signing JWTs | Yes |
| `JWT_EXPIRES_IN` | JWT expiry (e.g. 7d) | Yes |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Yes |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | Yes |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Optional |
| `SMTP_HOST` | SMTP server host | Optional |
| `SMTP_PORT` | SMTP server port | Optional |
| `SMTP_USER` | SMTP username | Optional |
| `SMTP_PASS` | SMTP password | Optional |
| `EMAIL_FROM` | Sender name/email | Optional |
| `TWITTER_API_KEY` | Twitter API key | Optional |
| `TWITTER_API_SECRET` | Twitter API secret | Optional |
| `FACEBOOK_APP_ID` | Facebook app ID | Optional |
| `FACEBOOK_APP_SECRET` | Facebook app secret | Optional |
| `AWS_ACCESS_KEY_ID` | AWS key for S3 uploads | Optional |
| `AWS_SECRET_ACCESS_KEY` | AWS secret | Optional |
| `AWS_REGION` | AWS region (default af-south-1) | Optional |
| `AWS_S3_BUCKET` | S3 bucket name | Optional |
| `ENCRYPTION_KEY` | 32-char AES encryption key | Yes |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | Yes |
| `RATE_LIMIT_MAX` | Max requests per window | Yes |

---

## API Overview

All endpoints are prefixed with `/api/v1`.

| Group | Endpoints |
|---|---|
| Auth | POST /auth/register, POST /auth/login, POST /auth/logout, POST /auth/refresh-token, POST /auth/forgot-password, POST /auth/reset-password |
| Users | GET /users/me, PUT /users/me, GET /users/:id |
| Campaigns | GET/POST /campaigns, GET/PUT/DELETE /campaigns/:id, POST /campaigns/:id/launch, POST /campaigns/:id/pause |
| Analytics | GET /analytics/dashboard, GET /analytics/campaigns/:id, GET /analytics/roi, GET /analytics/export |
| AI | POST /ai/advisor/chat, POST /ai/advisor/strategy, GET /ai/advisor/insights, POST /ai/content/generate |
| Community | GET/POST /community/posts, GET/POST /community/events, GET/POST /community/resources |
| Notifications | GET /notifications, PUT /notifications/:id/read |

---

## Deployment

### Production Docker

```bash
# Build images
docker-compose -f docker-compose.yml build

# Deploy
docker-compose up -d

# Run migrations
docker exec scaleafrique-backend npm run db:migrate
```

### Environment

- Set `NODE_ENV=production`
- Use strong `JWT_SECRET` and `ENCRYPTION_KEY`
- Configure proper SMTP for email delivery
- Set real Anthropic API key
- Configure AWS S3 for file uploads

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT © ScaleAfrique
