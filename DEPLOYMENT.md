# Multi-Agent Collaboration Platform - Deployment Guide

This guide covers the deployment process for the Multi-Agent Collaboration Platform using Docker containers.

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- At least 4GB RAM available
- Port 3000, 3001, 5432 available
- (Optional) OpenAI API key for AI features

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ccpm
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development environment**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - API Health: http://localhost:3000/api/health

### Production Deployment

1. **Prepare production environment**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

2. **Deploy the application**
   ```bash
   ./deploy.sh deploy
   ```

3. **Verify deployment**
   ```bash
   ./deploy.sh health
   ./deploy.sh status
   ```

## Architecture Overview

The platform consists of the following components:

### Services

- **PostgreSQL Database**: Primary data storage
- **Backend API**: Node.js/Express server with WebSocket support
- **Frontend**: React.js single-page application
- **Nginx**: Reverse proxy and load balancer (production)
- **Prometheus**: Metrics collection (optional)
- **Grafana**: Metrics visualization (optional)

### Port Configuration

| Service | Local Dev | Production | Description |
|---------|------------|------------|-------------|
| Backend | 3000 | 3000 | API Server |
| Frontend | 3001 | 80 | Web Application |
| Database | 5432 | 5432 | PostgreSQL |
| Grafana | - | 3002 | Monitoring Dashboard |
| Prometheus | - | 9090 | Metrics |

## Environment Configuration

### Required Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://ccpm_user:ccpm_password@postgres:5432/ccpm"

# Security
JWT_SECRET="your-secure-secret-key"
BCRYPT_ROUNDS=12

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN="https://your-domain.com"

# AI Configuration
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-4"

# Logging
LOG_LEVEL="info"
LOG_FILE="/app/logs/app.log"
```

#### Frontend (.env)
```bash
VITE_API_URL="https://your-domain.com/api"
VITE_WS_URL="wss://your-domain.com"
```

### Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret
2. **Database Password**: Use a strong password
3. **API Keys**: Never commit API keys to version control
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Restrict to your domain only

## Deployment Options

### 1. Development Environment

For local development with hot-reload:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This mounts source code for live development.

### 2. Production Environment

For production deployment:

```bash
docker-compose up -d
```

This uses optimized builds and security configurations.

### 3. Monitoring Stack

For production monitoring:

```bash
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml --profile monitoring up -d
```

This includes Prometheus and Grafana for metrics.

## Deployment Scripts

### Available Commands

```bash
./deploy.sh deploy      # Full deployment
./deploy.sh stop        # Stop all services
./deploy.sh restart     # Restart services
./deploy.sh logs        # View logs
./deploy.sh status      # Show status
./deploy.sh health      # Health checks
```

### Custom Deployment

The deployment script can be customized for different environments:

```bash
# Custom environment file
ENV_FILE=.env.staging ./deploy.sh deploy

# Custom compose file
COMPOSE_FILE=docker-compose.staging.yml ./deploy.sh deploy
```

## Database Management

### Initial Setup

The database is automatically initialized on first run with:

1. Database creation
2. Schema migration
3. Default admin user creation

### Backups

Manual backup:
```bash
# Create backup
docker exec ccpm-postgres pg_dump -U ccpm_user ccpm > backup.sql

# Restore backup
docker exec -i ccpm-postgres psql -U ccpm_user ccpm < backup.sql
```

### migrations

Database migrations are handled automatically:

```bash
# Generate migration
npx prisma migrate dev --name migration_name

# Apply to production
npx prisma migrate deploy
```

## SSL/TLS Configuration

### Self-signed Certificate (Development)

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes
```

### Let's Encrypt (Production)

```bash
# Install certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
```

## Monitoring and Logging

### Application Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Metrics

Access monitoring dashboards:

- **Grafana**: http://localhost:3002 (admin/admin123)
- **Prometheus**: http://localhost:9090

### Health Checks

Built-in health endpoints:

- **Backend**: `GET /api/health`
- **Frontend**: `GET /`
- **Database**: PostgreSQL health check

## Scaling and Performance

### Horizontal Scaling

```bash
# Scale backend service
docker-compose up -d --scale backend=3

# Scale frontend service
docker-compose up -d --scale frontend=2
```

### Resource Limits

Update `docker-compose.yml` to add resource constraints:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   ```

2. **Database Connection Issues**
   ```bash
   # Check database logs
   docker-compose logs postgres

   # Test connection
   docker exec -it ccpm-postgres psql -U ccpm_user -d ccpm
   ```

3. **Memory Issues**
   ```bash
   # Check container memory usage
   docker stats
   ```

### Debug Mode

Enable debug logging:

```bash
# Add to environment
LOG_LEVEL=debug
```

### Reset Environment

```bash
# Stop and remove all containers
docker-compose down -v

# Remove all images
docker rmi $(docker images | grep ccpm | awk '{print $3}')

# Remove all volumes
docker volume rm $(docker volume ls | grep ccpm | awk '{print $2}')
```

## Security Best Practices

1. **Environment Variables**: Never commit sensitive data
2. **Network Security**: Use firewall rules
3. **Database Security**: Use strong passwords
4. **API Security**: Implement rate limiting
5. **File Permissions**: Set appropriate file permissions
6. **Regular Updates**: Keep dependencies updated

## Backup and Recovery

### Automated Backups

Create a backup script:

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/$DATE"

mkdir -p "$BACKUP_DIR"

# Database backup
docker exec ccpm-postgres pg_dump -U ccpm_user ccpm > "$BACKUP_DIR/database.sql"

# Configuration backup
cp .env "$BACKUP_DIR/"
cp docker-compose.yml "$BACKUP_DIR/"

# Compress backup
tar -czf "$BACKUP_DIR.tar.gz" -C backups "$DATE"
```

### Recovery Procedure

1. **Stop services**
   ```bash
   docker-compose down
   ```

2. **Restore database**
   ```bash
   docker exec -i ccpm-postgres psql -U ccpm_user ccpm < backup.sql
   ```

3. **Start services**
   ```bash
   docker-compose up -d
   ```

## Support

For deployment issues:

1. Check the logs: `docker-compose logs`
2. Run health checks: `./deploy.sh health`
3. Review this documentation
4. Create an issue in the repository

## Next Steps

- Set up CI/CD pipeline
- Configure automated backups
- Set up monitoring alerts
- Implement disaster recovery
- Performance optimization