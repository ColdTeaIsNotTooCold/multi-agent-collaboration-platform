# Database Setup and Management

This document provides instructions for setting up and managing the PostgreSQL database for the Multi-Agent Collaboration Platform.

## Prerequisites

- PostgreSQL 14 or higher
- Node.js 16 or higher
- npm or yarn

## Database Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/ccpm"

# JWT
JWT_SECRET="your-secret-key-change-in-production"

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"
```

### Database URL Format

The `DATABASE_URL` should follow this format:
```
postgresql://[username]:[password]@[host]:[port]/[database]
```

Example:
```
postgresql://postgres:mypassword@localhost:5432/ccpm
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Database

```bash
# Create database (replace with your PostgreSQL credentials)
createdb ccpm

# Or using psql
psql -c "CREATE DATABASE ccpm;"
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Push Schema to Database

```bash
npm run db:push
```

### 5. Seed Database (Optional)

```bash
npm run db:seed
```

This will create:
- Default admin user (username: `admin`, password: `admin123`)
- Test users
- Sample agents
- Sample tasks
- Sample messages

## Database Schema

### Core Tables

- **users**: User authentication and authorization
- **agents**: Agent registration and capabilities
- **tasks**: Task management and assignment
- **messages**: Agent-to-agent communication
- **sessions**: User session management

### Relationships

- Users can create multiple tasks
- Tasks can be assigned to agents
- Agents can handle multiple tasks
- Messages can be linked to tasks

## Development Workflow

### Making Schema Changes

1. Update `prisma/schema.prisma`
2. Generate client: `npm run db:generate`
3. Push changes: `npm run db:push`

### Creating Migrations

```bash
# Create a new migration
npm run db:migrate

# Reset database (deletes all data)
npm run db:reset
```

### Database Studio

```bash
# Open Prisma Studio for database management
npm run db:studio
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Database

Tests will attempt to use the same database as development. Ensure your database is running before running tests.

## Health Checks

The application provides several health check endpoints:

- `GET /api/health` - Basic health check with database status
- `GET /api/health/detailed` - Detailed health information
- `GET /api/health/database` - Database-specific health check

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if PostgreSQL is running
   - Verify DATABASE_URL in `.env`
   - Check database credentials

2. **Migration Failed**
   - Ensure database exists
   - Check database permissions
   - Verify schema syntax

3. **Prisma Client Generation Failed**
   - Ensure DATABASE_URL is set
   - Check schema syntax
   - Run `npm install`

### Resetting Database

```bash
# Drop and recreate database
npm run db:reset

# Manual reset
dropdb ccpm
createdb ccpm
npm run db:push
npm run db:seed
```

## Performance Considerations

- Database connection pooling is handled by Prisma
- Indexes are automatically created for foreign keys and unique constraints
- Consider adding additional indexes based on query patterns
- Use Prisma Studio to analyze query performance

## Security

- Never commit `.env` files to version control
- Use strong passwords in production
- Regularly update dependencies
- Enable SSL in production DATABASE_URL
- Use environment-specific configurations