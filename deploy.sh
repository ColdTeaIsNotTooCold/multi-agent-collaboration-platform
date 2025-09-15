#!/bin/bash

# Multi-Agent Collaboration Platform Deployment Script
# This script handles deployment to production servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ccpm"
BACKEND_PORT=3000
FRONTEND_PORT=3001
DB_PORT=5432

# Log functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    log_info "Docker is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    log_info "Docker Compose is installed"
}

# Create necessary directories
setup_directories() {
    log_info "Setting up necessary directories..."

    mkdir -p logs
    mkdir -p ssl
    mkdir -p backups

    log_info "Directories created successfully"
}

# Backup existing deployment
backup_deployment() {
    log_info "Creating backup of existing deployment..."

    if [ -d "backups" ]; then
        BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"

        # Backup environment files
        cp .env "$BACKUP_DIR/" 2>/dev/null || true
        cp docker-compose.yml "$BACKUP_DIR/" 2>/dev/null || true

        # Backup database (if postgres is running)
        if docker ps --format 'table {{.Names}}' | grep -q "ccpm-postgres"; then
            docker exec ccpm-postgres pg_dump -U ccpm_user ccpm > "$BACKUP_DIR/database.sql"
            log_info "Database backup created"
        fi

        log_info "Backup created at $BACKUP_DIR"
    fi
}

# Stop existing containers
stop_containers() {
    log_info "Stopping existing containers..."

    if [ -f "docker-compose.yml" ]; then
        docker-compose down --remove-orphans
    fi

    log_info "Containers stopped"
}

# Build and start services
start_services() {
    log_info "Building and starting services..."

    # Build images
    docker-compose build --no-cache

    # Start services
    docker-compose up -d

    log_info "Services started successfully"
}

# Health check
health_check() {
    log_info "Performing health checks..."

    # Wait for services to start
    sleep 30

    # Check backend health
    if curl -f http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
        log_info "Backend health check passed"
    else
        log_error "Backend health check failed"
        return 1
    fi

    # Check frontend health
    if curl -f http://localhost:$FRONTEND_PORT/ > /dev/null 2>&1; then
        log_info "Frontend health check passed"
    else
        log_error "Frontend health check failed"
        return 1
    fi

    # Check database health
    if docker exec ccpm-postgres pg_isready -U ccpm_user -d ccpm > /dev/null 2>&1; then
        log_info "Database health check passed"
    else
        log_error "Database health check failed"
        return 1
    fi

    log_info "All health checks passed"
}

# Show status
show_status() {
    log_info "Deployment status:"
    docker-compose ps
}

# Main deployment function
deploy() {
    log_info "Starting deployment of Multi-Agent Collaboration Platform..."

    check_docker
    check_docker_compose
    setup_directories
    backup_deployment
    stop_containers
    start_services
    health_check
    show_status

    log_info "Deployment completed successfully!"
    log_info "Frontend: http://localhost:$FRONTEND_PORT"
    log_info "Backend API: http://localhost:$BACKEND_PORT"
    log_info "API Documentation: http://localhost:$BACKEND_PORT/api/docs"
}

# Handle script arguments
case "$1" in
    "deploy")
        deploy
        ;;
    "stop")
        log_info "Stopping services..."
        docker-compose down
        ;;
    "restart")
        log_info "Restarting services..."
        docker-compose restart
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "status")
        docker-compose ps
        ;;
    "health")
        health_check
        ;;
    *)
        echo "Usage: $0 {deploy|stop|restart|logs|status|health}"
        echo ""
        echo "Commands:"
        echo "  deploy    - Deploy the application"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  logs      - View logs"
        echo "  status    - Show service status"
        echo "  health    - Run health checks"
        exit 1
        ;;
esac