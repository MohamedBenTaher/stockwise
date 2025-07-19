#!/bin/bash

# Docker management script for StockWise
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Help function
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start          Start all services"
    echo "  stop           Stop all services"
    echo "  restart        Restart all services"
    echo "  build          Build/rebuild all images"
    echo "  logs           Show logs from all services"
    echo "  logs <service> Show logs from specific service"
    echo "  shell          Open shell in backend container"
    echo "  migrate        Run database migrations"
    echo "  clean          Remove containers, networks, and volumes"
    echo "  status         Show status of all services"
    echo "  help           Show this help message"
}

# Check if docker-compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Error: docker-compose is not installed${NC}"
        exit 1
    fi
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        echo -e "${YELLOW}Warning: .env file not found. Creating from .env.example...${NC}"
        cp .env.example .env
        echo -e "${GREEN}Please update the .env file with your actual configuration${NC}"
    fi
}

case "${1:-help}" in
    start)
        echo -e "${GREEN}Starting StockWise services...${NC}"
        check_docker_compose
        check_env_file
        docker-compose up -d
        echo -e "${GREEN}Services started successfully!${NC}"
        echo "Backend API: http://localhost:8000"
        echo "Database: localhost:5432"
        echo "Redis: localhost:6379"
        ;;
    
    stop)
        echo -e "${YELLOW}Stopping StockWise services...${NC}"
        check_docker_compose
        docker-compose down
        echo -e "${GREEN}Services stopped successfully!${NC}"
        ;;
    
    restart)
        echo -e "${YELLOW}Restarting StockWise services...${NC}"
        check_docker_compose
        docker-compose down
        docker-compose up -d
        echo -e "${GREEN}Services restarted successfully!${NC}"
        ;;
    
    build)
        echo -e "${YELLOW}Building StockWise images...${NC}"
        check_docker_compose
        docker-compose build --no-cache
        echo -e "${GREEN}Images built successfully!${NC}"
        ;;
    
    logs)
        check_docker_compose
        if [ -n "$2" ]; then
            docker-compose logs -f "$2"
        else
            docker-compose logs -f
        fi
        ;;
    
    shell)
        echo -e "${GREEN}Opening shell in backend container...${NC}"
        check_docker_compose
        docker-compose exec backend /bin/bash
        ;;
    
    migrate)
        echo -e "${GREEN}Running database migrations...${NC}"
        check_docker_compose
        docker-compose exec backend alembic upgrade head
        echo -e "${GREEN}Migrations completed successfully!${NC}"
        ;;
    
    clean)
        echo -e "${RED}Cleaning up Docker resources...${NC}"
        read -p "This will remove all containers, networks, and volumes. Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            check_docker_compose
            docker-compose down -v --remove-orphans
            docker-compose rm -f
            echo -e "${GREEN}Cleanup completed!${NC}"
        else
            echo "Cleanup cancelled."
        fi
        ;;
    
    status)
        echo -e "${GREEN}StockWise services status:${NC}"
        check_docker_compose
        docker-compose ps
        ;;
    
    help|*)
        show_help
        ;;
esac
    fi
    
    print_success "Services started successfully!"
    print_info "Run 'docker-compose logs -f' to view logs"
}

# Stop services
stop_services() {
    print_info "Stopping StockWise services..."
    
    if [ "$1" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml down
    else
        docker-compose down
    fi
    
    print_success "Services stopped successfully!"
}

# Restart services
restart_services() {
    print_info "Restarting StockWise services..."
    stop_services "$1"
    start_services "$1"
}

# Show logs
show_logs() {
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# Run database migrations
run_migrations() {
    print_info "Running database migrations..."
    docker-compose exec backend alembic upgrade head
    print_success "Migrations completed!"
}

# Create new migration
create_migration() {
    if [ -z "$1" ]; then
        print_error "Please provide a migration message"
        echo "Usage: ./docker-manage.sh migrate-create \"migration message\""
        exit 1
    fi
    
    print_info "Creating new migration: $1"
    docker-compose exec backend alembic revision --autogenerate -m "$1"
    print_success "Migration created!"
}

# Reset database
reset_database() {
    print_warning "This will destroy all data in the database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Resetting database..."
        docker-compose down -v
        docker-compose up -d postgres redis
        sleep 10
        docker-compose exec backend alembic upgrade head
        print_success "Database reset completed!"
    else
        print_info "Database reset cancelled."
    fi
}

# Build images
build_images() {
    print_info "Building Docker images..."
    docker-compose build --no-cache
    print_success "Images built successfully!"
}

# Clean up
cleanup() {
    print_info "Cleaning up Docker resources..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed!"
}

# Show status
show_status() {
    print_info "StockWise Services Status:"
    docker-compose ps
}

# Help message
show_help() {
    echo "StockWise Docker Management Script"
    echo ""
    echo "Usage: ./docker-manage.sh [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start [dev]          Start services (dev: DB and Redis only)"
    echo "  stop [dev]           Stop services"
    echo "  restart [dev]        Restart services"
    echo "  logs [service]       Show logs (optionally for specific service)"
    echo "  migrate              Run database migrations"
    echo "  migrate-create MSG   Create new migration"
    echo "  reset-db             Reset database (WARNING: destroys data)"
    echo "  build                Build Docker images"
    echo "  status               Show service status"
    echo "  cleanup              Clean up Docker resources"
    echo "  help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./docker-manage.sh start dev     # Start only DB and Redis"
    echo "  ./docker-manage.sh start          # Start full stack"
    echo "  ./docker-manage.sh logs backend   # Show backend logs"
    echo "  ./docker-manage.sh migrate-create \"Add user table\""
}

# Main script logic
case "$1" in
    start)
        start_services "$2"
        ;;
    stop)
        stop_services "$2"
        ;;
    restart)
        restart_services "$2"
        ;;
    logs)
        show_logs "$2"
        ;;
    migrate)
        run_migrations
        ;;
    migrate-create)
        create_migration "$2"
        ;;
    reset-db)
        reset_database
        ;;
    build)
        build_images
        ;;
    status)
        show_status
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
