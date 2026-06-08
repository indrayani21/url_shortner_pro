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

## Cloud Architecture

This application is designed for AWS deployment with:

- **Container Registry**: Docker images pushed to ECR
- **Orchestration**: ECS Fargate with auto-scaling (2-10 instances)
- **Load Balancing**: Application Load Balancer for traffic distribution  
- **Database**: MongoDB Atlas (AWS eu-north-1)
- **Cache**: Redis Cloud (AWS eu-north-1)
- **Monitoring**: CloudWatch logs and metrics
- **CI/CD**: GitHub Actions → ECR → ECS

### Deployment Commands (Ready to use):
\`\`\`bash
aws ecr get-login-password | docker login
aws ecs create-service --cluster url-shortener --task-definition url-shortener
\`\`\`
