#!/bin/bash

# Grand Hotel Production Deployment Script
# This script automates the deployment process for both frontend and backend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="grand-hotel"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
BACKUP_DIR="backups"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

check_requirements() {
    log "Checking deployment requirements..."
    
    # Check if required commands exist
    command -v node >/dev/null 2>&1 || error "Node.js is required but not installed"
    command -v npm >/dev/null 2>&1 || error "npm is required but not installed"
    command -v pm2 >/dev/null 2>&1 || error "PM2 is required but not installed"
    command -v mongod >/dev/null 2>&1 || warn "MongoDB is not locally available (using remote DB?)"
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        error "Node.js version 16 or higher is required (current: $(node --version))"
    fi
    
    success "All requirements met"
}

backup_database() {
    log "Creating database backup..."
    
    if [ -f "$BACKEND_DIR/scripts/backup-db.js" ]; then
        cd $BACKEND_DIR
        node scripts/backup-db.js
        cd ..
        success "Database backup completed"
    else
        warn "Backup script not found, skipping database backup"
    fi
}

build_frontend() {
    log "Building frontend..."
    
    cd $FRONTEND_DIR
    
    # Install dependencies
    log "Installing frontend dependencies..."
    npm ci --only=production
    
    # Build for production
    log "Building frontend for production..."
    npm run build:prod
    
    # Verify build
    if [ ! -d "dist" ]; then
        error "Frontend build failed - dist directory not found"
    fi
    
    cd ..
    success "Frontend build completed"
}

deploy_backend() {
    log "Deploying backend..."
    
    cd $BACKEND_DIR
    
    # Install dependencies
    log "Installing backend dependencies..."
    npm ci --only=production
    
    # Run database health check
    log "Checking database connection..."
    if [ -f "scripts/health-check.js" ]; then
        node scripts/health-check.js --quick || error "Database health check failed"
    fi
    
    # Stop existing PM2 processes
    log "Stopping existing backend processes..."
    pm2 stop $PROJECT_NAME-api 2>/dev/null || true
    
    # Start backend with PM2
    log "Starting backend with PM2..."
    npm run prod:start
    
    # Wait for startup
    sleep 5
    
    # Verify backend is running
    if pm2 list | grep -q "$PROJECT_NAME-api.*online"; then
        success "Backend deployed and running"
    else
        error "Backend deployment failed"
    fi
    
    cd ..
}

deploy_frontend() {
    log "Deploying frontend..."
    
    # This depends on your hosting setup
    # For static hosting (Vercel, Netlify, etc.)
    if [ "$FRONTEND_DEPLOY" = "vercel" ]; then
        cd $FRONTEND_DIR
        npm run deploy:vercel
        cd ..
        success "Frontend deployed to Vercel"
    elif [ "$FRONTEND_DEPLOY" = "netlify" ]; then
        cd $FRONTEND_DIR
        npm run deploy:netlify
        cd ..
        success "Frontend deployed to Netlify"
    else
        warn "Frontend deployment method not specified"
        warn "Built files are available in $FRONTEND_DIR/dist"
    fi
}

run_health_checks() {
    log "Running post-deployment health checks..."
    
    sleep 10  # Wait for services to stabilize
    
    cd $BACKEND_DIR
    
    # Run comprehensive health check
    if [ -f "scripts/health-check.js" ]; then
        node scripts/health-check.js
        success "All health checks passed"
    else
        warn "Health check script not found"
    fi
    
    cd ..
}

cleanup() {
    log "Running cleanup tasks..."
    
    cd $BACKEND_DIR
    
    # Clean up logs
    if [ -f "scripts/cleanup-logs.js" ]; then
        node scripts/cleanup-logs.js
    fi
    
    # Remove old backups (keep last 5)
    if [ -d "$BACKUP_DIR" ]; then
        find $BACKUP_DIR -name "*.json" -type f | sort -r | tail -n +6 | xargs rm -f 2>/dev/null || true
    fi
    
    cd ..
    success "Cleanup completed"
}

show_status() {
    log "Deployment Status:"
    echo ""
    
    # Show PM2 status
    pm2 list
    echo ""
    
    # Show disk usage
    echo "Disk Usage:"
    df -h . | tail -1
    echo ""
    
    # Show memory usage
    echo "Memory Usage:"
    free -h | head -2
    echo ""
    
    success "Deployment completed successfully!"
    echo ""
    echo "🎉 Your Grand Hotel application is now running in production!"
    echo ""
    echo "📊 Useful commands:"
    echo "  - View logs: pm2 logs $PROJECT_NAME-api"
    echo "  - Monitor: pm2 monit"
    echo "  - Restart: pm2 restart $PROJECT_NAME-api"
    echo "  - Health check: cd $BACKEND_DIR && node scripts/health-check.js"
}

# Main deployment process
main() {
    log "Starting Grand Hotel production deployment..."
    echo ""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --frontend-deploy)
                FRONTEND_DEPLOY="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [options]"
                echo ""
                echo "Options:"
                echo "  --skip-backup           Skip database backup"
                echo "  --frontend-deploy TYPE  Deploy frontend (vercel|netlify)"
                echo "  --help                  Show this help"
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done
    
    # Run deployment steps
    check_requirements
    
    if [ "$SKIP_BACKUP" != "true" ]; then
        backup_database
    fi
    
    build_frontend
    deploy_backend
    
    if [ -n "$FRONTEND_DEPLOY" ]; then
        deploy_frontend
    fi
    
    run_health_checks
    cleanup
    show_status
}

# Run main function with all arguments
main "$@"
