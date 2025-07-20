# StockWise Development Makefile
# Use this to set up and manage your development environment

.PHONY: help setup dev-up dev-down dev-restart clean logs migrate test lint format install test-unit test-integration test-all

# Default target
help:
	@echo "StockWise Development Commands:"
	@echo ""
	@echo "Setup & Environment:"
	@echo "  setup          - Initial setup (copy .env, install deps)"
	@echo "  dev-up         - Start development environment (DB + Redis only)"
	@echo "  dev-down       - Stop development environment"
	@echo "  dev-restart    - Restart development environment"
	@echo ""
	@echo "Backend (Local):"
	@echo "  run            - Start FastAPI server locally"
	@echo "  migrate        - Run database migrations"
	@echo "  migrate-create - Create new migration"
	@echo "  celery         - Start Celery worker locally"
	@echo "  celery-beat    - Start Celery beat scheduler locally"
	@echo ""
	@echo "Testing:"
	@echo "  test-unit      - Run unit tests only"
	@echo "  test-integration - Run integration tests (requires services)"
	@echo "  test-all       - Run all tests"
	@echo "  test-cov       - Run tests with coverage report"
	@echo "  test-runner    - Run the comprehensive test suite"
	@echo ""
	@echo "Development:"
	@echo "  logs           - Show logs from Docker services"
	@echo "  logs-db        - Show database logs only"
	@echo "  logs-redis     - Show Redis logs only"
	@echo "  db-shell       - Open database shell"
	@echo "  redis-cli      - Open Redis CLI"
	@echo ""
	@echo "Code Quality:"
	@echo "  test           - Run tests"
	@echo "  lint           - Run linting"
	@echo "  format         - Format code"
	@echo "  install        - Install Python dependencies"
	@echo "  setup          - Initial setup (copy .env, install deps)"
	@echo "  dev-up         - Start development environment (DB + Redis only)"
	@echo "  dev-down       - Stop development environment"
	@echo "  dev-restart    - Restart development environment"
	@echo ""
	@echo "Backend (Local):"
	@echo "  run            - Start FastAPI server locally"
	@echo "  migrate        - Run database migrations"
	@echo "  migrate-create - Create new migration"
	@echo "  celery         - Start Celery worker locally"
	@echo "  celery-beat    - Start Celery beat scheduler locally"
	@echo ""
	@echo "Development:"
	@echo "  logs           - Show logs from Docker services"
	@echo "  logs-db        - Show database logs only"
	@echo "  logs-redis     - Show Redis logs only"
	@echo "  db-shell       - Open database shell"
	@echo "  redis-cli      - Open Redis CLI"
	@echo ""
	@echo "Code Quality:"
	@echo "  test           - Run tests"
	@echo "  lint           - Run linting"
	@echo "  format         - Format code"
	@echo "  install        - Install Python dependencies"

# Initial setup
setup:
	@echo "🚀 Setting up StockWise development environment..."
	@if [ ! -f .env ]; then \
		echo "📝 Creating .env file from template..."; \
		cp .env.example .env; \
		echo "✅ Please update .env with your configuration"; \
	else \
		echo "✅ .env file already exists"; \
	fi
	@echo "📦 Installing Python dependencies..."
	@pip install -r requirements.txt
	@echo "🎉 Setup complete! Run 'make dev-up' to start development environment"

# Start development environment (DB + Redis only)
dev-up:
	@echo "🚀 Starting StockWise development environment..."
	@if [ ! -f .env ]; then \
		echo "❌ .env file not found. Run 'make setup' first."; \
		exit 1; \
	fi
	@echo "🐳 Starting database and Redis..."
	@docker-compose up -d postgres redis
	@echo "⏳ Waiting for database to be ready..."
	@sleep 10
	@echo "✅ Development infrastructure is ready!"
	@echo "🗄️  Database: localhost:5432"
	@echo "📊 Redis: localhost:6379"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Run 'make migrate' to set up database tables"
	@echo "  2. Run 'make run' to start the FastAPI server"
	@echo "🐳 Starting database and Redis..."
	@docker-compose up -d postgres redis
	@echo "⏳ Waiting for database to be ready..."
	@sleep 10
	@echo ""
	@echo "✅ Development services are ready!"
	@echo "�️  Database: localhost:5432"
	@echo "📊 Redis: localhost:6379"
	@echo ""
	@echo "Now run the backend locally:"
	@echo "  make migrate  # Run migrations"
	@echo "  make run      # Start FastAPI server"
	@echo "  make celery   # Start Celery worker (optional)"

# Stop development environment
dev-down:
	@echo "🛑 Stopping StockWise development environment..."
	@docker-compose down
	@echo "✅ Development environment stopped"

# Restart development environment
dev-restart:
	@echo "🔄 Restarting StockWise development environment..."
	@docker-compose down
	@make dev-up

# Clean up containers and volumes
clean:
	@echo "🧹 Cleaning up Docker resources..."
	@read -p "This will remove all containers, networks, and volumes. Continue? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		docker-compose down -v --remove-orphans; \
		docker system prune -f; \
		echo "✅ Cleanup completed"; \
	else \
		echo "❌ Cleanup cancelled"; \
	fi

# Show logs
logs:
	@echo "📋 Showing logs from Docker services..."
	@docker-compose logs -f

logs-db:
	@echo "📋 Showing database logs..."
	@docker-compose logs -f postgres

logs-redis:
	@echo "📋 Showing Redis logs..."
	@docker-compose logs -f redis

# Run database migrations
migrate:
	@echo "🔄 Running database migrations..."
	@alembic upgrade head
	@echo "✅ Migrations completed"

# Create new migration
migrate-create:
	@echo "📝 Creating new migration..."
	@read -p "Enter migration message: " message; \
	alembic revision --autogenerate -m "$$message"

# Run backend server locally
run:
	@echo "🚀 Starting FastAPI server locally..."
	@uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Run Celery worker locally
celery:
	@echo "🔄 Starting Celery worker locally..."
	@celery -A app.celery worker --loglevel=info

# Run Celery beat scheduler locally
celery-beat:
	@echo "⏰ Starting Celery beat scheduler locally..."
	@celery -A app.celery beat --loglevel=info

# Install Python dependencies
install:
	@echo "📦 Installing Python dependencies..."
	@pip install -r requirements.txt
	@echo "✅ Dependencies installed"

# Testing Commands
test-unit:
	@echo "🧪 Running unit tests..."
	@pytest tests/unit -v --tb=short -m unit

test-integration:
	@echo "🧪 Running integration tests (requires services)..."
	@pytest tests/integration -v --tb=short -m integration

test-all:
	@echo "🧪 Running all tests..."
	@pytest tests/ -v --tb=short

test-cov:
	@echo "🧪 Running tests with coverage..."
	@pytest tests/ --cov=app --cov-report=html --cov-report=term

test-runner:
	@echo "🧪 Running comprehensive test suite..."
	@python run_tests.py

# Clean up old test files
clean-old-tests:
	@echo "🧹 Cleaning up old test files..."
	@rm -f test_*.py
	@echo "✅ Old test files removed"

# Development shortcuts
db-shell:
	@echo "🗄️ Opening database shell..."
	@docker-compose exec postgres psql -U stockwise_user -d stockwise

redis-cli:
	@echo "📊 Opening Redis CLI..."
	@docker-compose exec redis redis-cli

# Status check
status:
	@echo "📊 Service status:"
	@docker-compose ps

# Quick development workflow
dev: setup dev-up
	@echo "🎉 Development environment ready!"

# Health check
health:
	@echo "🩺 Checking service health..."
	@curl -f http://localhost:8000/health || echo "❌ Backend not responding (make sure 'make run' is running)"
	@docker-compose exec postgres pg_isready -U stockwise_user -d stockwise || echo "❌ Database not ready"
	@docker-compose exec redis redis-cli ping || echo "❌ Redis not responding"
