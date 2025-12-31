#!/bin/bash
# Docker startup script for Infinity-Matrix with Hostinger Integration
# Usage: ./start_docker.sh [production|development|clean]

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker found: $(docker --version)"
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker Compose found: $(docker-compose --version)"
    
    # Check if Docker daemon is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker Desktop."
        exit 1
    fi
    print_success "Docker daemon is running"
}

check_environment() {
    print_header "Checking Environment Configuration"
    
    if [ ! -f ".env" ]; then
        print_warning ".env file not found"
        echo "Creating .env from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success ".env created. Please edit it with your Hostinger API key."
        else
            print_error ".env.example not found"
            exit 1
        fi
    else
        print_success ".env file exists"
    fi
    
    if [ ! -d "credentials" ]; then
        mkdir -p credentials
        print_warning "credentials directory created. Add hostinger_creds.json if needed."
    fi
}

check_ports() {
    print_header "Checking Port Availability"
    
    local ports=(3000 3001 8000 11434)
    for port in "${ports[@]}"; do
        if lsof -Pi ":$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Port $port is already in use"
        else
            print_success "Port $port is available"
        fi
    done
}

start_production() {
    print_header "Starting Production Environment"
    
    print_warning "Building images (this may take 2-3 minutes on first run)..."
    docker-compose build
    
    print_header "Starting Services"
    docker-compose up -d
    
    print_header "Waiting for Services to Start"
    sleep 10
    
    # Check if services are running
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose exec -T frontend curl -s http://localhost:3000 > /dev/null 2>&1; then
            print_success "Frontend is ready"
            break
        fi
        attempt=$((attempt + 1))
        echo "Waiting for frontend to be ready... ($attempt/$max_attempts)"
        sleep 2
    done
    
    print_header "System Status"
    docker-compose ps
    
    print_header "Access Your System"
    echo ""
    echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
    echo -e "${GREEN}Hostinger Dashboard: http://localhost:3000/hostinger${NC}"
    echo -e "${GREEN}API Health: http://localhost:3001/health${NC}"
    echo -e "${GREEN}API Gateway: http://localhost:8000${NC}"
    echo -e "${GREEN}Ollama: http://localhost:11434${NC}"
    echo ""
    
    print_success "Production environment started successfully!"
    echo ""
    echo "View logs with: docker-compose logs -f"
    echo "Stop with: docker-compose stop"
}

start_development() {
    print_header "Starting Development Environment"
    
    print_warning "Building images (this may take 2-3 minutes on first run)..."
    docker-compose build
    
    print_header "Starting Services with Hot-Reload"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
    
    # Note: Development mode keeps containers running in foreground
    print_success "Development environment is running with hot-reload enabled"
    echo ""
    echo "To stop: Press Ctrl+C"
    echo "File changes will trigger automatic reload"
}

stop_all() {
    print_header "Stopping All Services"
    
    docker-compose stop
    
    print_success "All services stopped"
    echo ""
    echo "Start again with: ./start_docker.sh production"
}

clean_all() {
    print_header "WARNING: Complete Cleanup"
    echo "This will remove:"
    echo "  - All containers"
    echo "  - All stopped containers"
    echo "  - Docker networks (but NOT images or data volumes)"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down
        print_success "Cleanup complete"
        echo ""
        echo "To restore: ./start_docker.sh production"
    else
        print_warning "Cleanup cancelled"
    fi
}

restart_services() {
    print_header "Restarting Services"
    
    docker-compose restart
    
    sleep 5
    
    print_header "System Status"
    docker-compose ps
    
    print_success "Services restarted"
}

view_logs() {
    print_header "Viewing Logs (Ctrl+C to stop)"
    docker-compose logs -f
}

verify_installation() {
    print_header "Verifying Installation"
    
    echo "Testing connectivity..."
    
    # Test frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is responding"
    else
        print_error "Frontend not responding"
    fi
    
    # Test API
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        print_success "API is responding"
    else
        print_error "API not responding"
    fi
    
    # Test gateway
    if curl -s http://localhost:8000 > /dev/null 2>&1; then
        print_success "Gateway is responding"
    else
        print_error "Gateway not responding"
    fi
    
    print_header "Status Check Complete"
    docker-compose ps
}

show_help() {
    echo ""
    echo "Infinity-Matrix Docker Startup Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  production    Start production environment (background)"
    echo "  development   Start development environment with hot-reload"
    echo "  restart       Restart running services"
    echo "  stop          Stop all services"
    echo "  clean         Stop and remove all containers"
    echo "  logs          View live logs"
    echo "  verify        Verify services are running"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 production   # Start in production mode"
    echo "  $0 development  # Start with hot-reload"
    echo "  $0 logs         # View logs"
    echo ""
}

# Main script
check_prerequisites

case "${1:-help}" in
    production)
        check_environment
        check_ports
        start_production
        ;;
    development)
        check_environment
        check_ports
        start_development
        ;;
    restart)
        restart_services
        ;;
    stop)
        stop_all
        ;;
    clean)
        clean_all
        ;;
    logs)
        view_logs
        ;;
    verify)
        verify_installation
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
