# URL Shortener

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://url-shortner-pro-wutw.onrender.com)

Production-ready URL shortening service with Redis caching, rate limiting, and analytics.

## Features
- ⚡ Cache-first redirects (<50ms latency)
- 🔄 Rate limiting (100 req/15min)
- 📊 Click analytics
- 🐳 Dockerized
- ✅ 30+ tests, CI/CD

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- Redis (caching)
- Jest + GitHub Actions
- Render.com deployment

## API
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/shorten` | POST | Create short URL |
| `/:code` | GET | Redirect |
| `/health` | GET | Health check |

## Live Demo
https://url-shortner-pro-wutw.onrender.com

## Local Setup
```bash
git clone <repo>
npm install
docker-compose up -d
npm run dev
