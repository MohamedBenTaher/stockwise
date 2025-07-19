# StockWise

**Smarter insights for your investments.**

## 🎯 Mission
Build a developer-friendly, AI-powered portfolio dashboard that:
- Tracks stock & crypto holdings
- Analyzes portfolio risk & overexposure
- Generates actionable investment insights powered by LLMs
- Visualizes allocation & risk clearly
- Optimized for global, self-directed investors & developers

## 🔗 Key Features (MVP)
✅ User can manually enter their holdings (ticker, qty, buy price, date)
✅ Dashboard shows:
- Total portfolio value & P/L
- Allocation (pie & bar charts)
- Top/worst performers

✅ AI-powered insights:
- Detects overexposure to sectors/countries
- Suggests diversification opportunities
- Highlights unusual risks

✅ Risk lens:
- Heatmaps of sector & geography exposure
- Basic volatility/risk metrics

✅ Authentication (Google or magic link)

## 🪜 Tech Stack

### Backend
- Python 3.11+
- FastAPI
- PostgreSQL + pgvector
- SQLAlchemy + Alembic
- Celery (optional, for async jobs) + Redis
- OpenAI Python SDK (for insights)

### Frontend
- Next.js + TailwindCSS + shadcn/ui
- Deployed on Vercel

### DevOps
- Dockerized backend
- .env configs
- Deployment: Render / Fly.io / Heroku (for MVP)

## 🔗 Sample APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /holdings/ | Add/update user holdings |
| GET | /holdings/ | Fetch portfolio |
| POST | /insights/ | Run AI analysis |
| GET | /risk/ | Get risk breakdown |
| POST | /auth/ | Auth endpoint |

## 🧠 AI Prompt (for insights endpoint)
You are an investment advisor. Given this portfolio: [list of holdings with weights], generate:
- A risk summary
- 3 actionable suggestions to improve diversification or risk
- Highlight any unusual concentration

Keep it professional yet simple. Avoid jargon.

## 👨‍💻 Development Notes
- Use Alembic for DB migrations.
- Use SQLAlchemy ORM with async session if desired.
- Use environment variables for secrets & API keys.
- Use pgvector if implementing RAG in the future.
- Write modular & testable services in /services/.

## 📈 Stretch Goals (Post-MVP)
- Broker & wallet integrations via APIs (Plaid/Yodlee/Coinbase)
- Scenario simulation: "What if S&P drops 10%?"
- Alerts & notifications
- API for developers to programmatically access insights

## 📝 Contributors
Mohamed Ben Taher (owner & developer)

## 👋 Notes for Copilot
- Prefer async-friendly libraries where possible.
- Follow PEP8 & type hints.
- Keep API responses JSON, use Pydantic schemas for validation.
- Prioritize readability & maintainability.
