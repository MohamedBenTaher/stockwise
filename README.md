# StockWise - AI-Powered Portfolio Dashboard

A modern full-stack application for portfolio management with AI-powered insights.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **shadcn/ui** for UI components
- **TanStack React Query** for API state management
- **React Hook Form** with Zod validation
- **Axios** for HTTP client with JWT authentication via HTTP-only cookies

### Backend
- **FastAPI** with Python
- **SQLAlchemy** for ORM
- **Alembic** for database migrations
- **JWT authentication** via HTTP-only cookies
- **PostgreSQL** database
- **Redis** for caching and background tasks
- **Celery** for background job processing
- **AI integration** for portfolio insights

### Infrastructure
- **Docker** with Docker Compose for containerization
- **PostgreSQL 15** database
- **Redis 7** for caching and message broker

## Quick Start

### Option 1: Using Makefile (Recommended for Development)

1. **Initial setup**:
```bash
git clone <your-repo>
cd stockwise
make setup  # Creates .env and installs dependencies
# Edit .env with your configuration
```

2. **Start development environment**:
```bash
make dev-up  # Starts DB, Redis, and Backend services
```

3. **Useful development commands**:
```bash
make logs           # View all logs
make logs-backend   # View backend logs only
make shell          # Open shell in backend container
make migrate        # Run database migrations
make test           # Run tests
make dev-down       # Stop all services
make clean          # Clean up everything
```

### Option 2: Using Docker Compose directly

1. **Clone and setup**:
```bash
git clone <your-repo>
cd stockwise
cp .env.example .env
# Edit .env with your configuration
```

2. **Start all services**:
```bash
./docker-manage.sh start
```

3. **Useful commands**:
```bash
./docker-manage.sh logs          # View all logs
./docker-manage.sh logs backend  # View backend logs only
./docker-manage.sh shell         # Open shell in backend container
./docker-manage.sh migrate       # Run database migrations
./docker-manage.sh stop          # Stop all services
./docker-manage.sh clean         # Clean up everything
```

### Access Points
- Backend API: http://localhost:8000
- Database: localhost:5432
- Redis: localhost:6379

## Features

- 🔐 **Secure Authentication** - JWT tokens via HTTP-only cookies
- 📊 **Portfolio Management** - Add, edit, and delete holdings
- 🤖 **AI-Powered Insights** - Get intelligent analysis of your portfolio
- 📈 **Risk Analysis** - Comprehensive risk metrics and visualization
- 🎨 **Modern UI** - Beautiful, responsive design with dark/light themes
- ⚡ **Real-time Updates** - Automatic data synchronization

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- pip or conda

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the project root
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`

## Authentication Flow

The application uses JWT authentication with HTTP-only cookies for enhanced security:

1. **Login**: User credentials are sent to `/auth/login`
2. **Token Storage**: JWT tokens are stored in secure, HTTP-only cookies
3. **Auto-refresh**: Access tokens are automatically refreshed when expired
4. **Logout**: Tokens are cleared from both client and server

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Holdings
- `GET /api/v1/holdings/` - Get all holdings
- `POST /api/v1/holdings/` - Create holding
- `PUT /api/v1/holdings/{id}` - Update holding
- `DELETE /api/v1/holdings/{id}` - Delete holding
- `GET /api/v1/holdings/portfolio` - Get portfolio summary

### Insights
- `POST /api/v1/insights/` - Generate AI insights
- `GET /api/v1/insights/latest` - Get latest insights

### Risk Analysis
- `GET /api/v1/risk/` - Get risk analysis
- `GET /api/v1/risk/metrics` - Get risk metrics
- `GET /api/v1/risk/heatmap` - Get risk heatmap

## Development

### Frontend Development
- Uses Vite for fast development and hot reloading
- TanStack React Query for efficient API state management
- TypeScript for type safety
- shadcn/ui for consistent, accessible components

### Backend Development
- FastAPI with automatic OpenAPI documentation
- SQLAlchemy for database operations
- Pydantic for data validation
- Structured logging and error handling

## Architecture

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   React App     │◄────────────────►│   FastAPI       │
│   (Frontend)    │   JWT Cookies    │   (Backend)     │
└─────────────────┘                  └─────────────────┘
         │                                     │
         │                                     │
         ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│  Local Storage  │                  │   PostgreSQL    │
│  (UI State)     │                  │   (Database)    │
└─────────────────┘                  └─────────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
