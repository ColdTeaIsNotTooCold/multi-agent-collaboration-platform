# Contributing to Multi-Agent Collaboration Platform

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Development Workflow](#development-workflow)
- [Architecture Overview](#architecture-overview)

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Git
- (Optional) OpenAI API key for AI features

### First-time Setup

1. **Fork the repository**
   ```bash
   # Fork the repository on GitHub
   git clone https://github.com/your-username/ccpm.git
   cd ccpm
   ```

2. **Set up development environment**
   ```bash
   # Install dependencies
   npm install
   cd frontend
   npm install
   cd ..

   # Set up environment
   cp .env.example .env
   # Edit .env with your configuration

   # Start development environment
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Run database migrations**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Verify setup**
   ```bash
   npm test
   ```

## Development Setup

### Backend Development

```bash
# Start backend in development mode
npm run dev

# Run backend tests
npm test

# Run backend with coverage
npm run test:coverage

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:migrate    # Create migration
npm run db:studio     # Open Prisma Studio
```

### Frontend Development

```bash
cd frontend

# Start frontend in development mode
npm run dev

# Run frontend tests
npm run test

# Build for production
npm run build

# Lint code
npm run lint
```

### Using Docker for Development

```bash
# Development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Code Standards

### TypeScript Standards

1. **Type Safety**: Always use proper TypeScript types
2. **Interfaces**: Use interfaces for object shapes
3. **Strict Mode**: Enable TypeScript strict mode
4. **Import Order**: Organize imports properly

```typescript
// Good example
interface User {
  id: string;
  email: string;
  name?: string;
}

const getUserById = async (id: string): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({ where: { id } });
  } catch (error) {
    logger.error('Error fetching user:', error);
    return null;
  }
};
```

### JavaScript/React Standards

1. **Component Structure**: Use functional components with hooks
2. **State Management**: Use appropriate state management
3. **Error Handling**: Implement proper error boundaries
4. **Performance**: Use React optimization techniques

```typescript
// Good example
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, onUpdate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.users.getById(userId);
        setUser(userData);
      } catch (err) {
        setError('Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};
```

### API Standards

1. **RESTful Design**: Follow REST principles
2. **Consistent Responses**: Use consistent response format
3. **Error Handling**: Provide meaningful error messages
4. **Validation**: Validate all input data
5. **Security**: Implement proper authentication/authorization

```typescript
// Good example
const createAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, capabilities } = req.body;

    // Validate input
    if (!name || !type || !capabilities) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields'
        }
      });
      return;
    }

    // Create agent
    const agent = await prisma.agent.create({
      data: {
        name,
        type,
        capabilities,
        status: 'active'
      }
    });

    res.status(201).json({
      success: true,
      data: agent
    });
  } catch (error) {
    logger.error('Error creating agent:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create agent'
      }
    });
  }
};
```

### Database Standards

1. **Schema Design**: Use proper database design principles
2. **Naming Conventions**: Use consistent naming
3. **Relationships**: Define proper relationships
4. **Indexes**: Add appropriate indexes
5. **Migrations**: Use version-controlled migrations

```prisma
// Good example
model Agent {
  id          String   @id @default(cuid())
  name        String   @unique
  type        String
  status      AgentStatus @default(ACTIVE)
  capabilities String[]
  config      Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tasks       Task[]

  @@map("agents")
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(PENDING)
  priority    Priority   @default(MEDIUM)
  input       String
  result      String?
  context     Json?
  agentId     String
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  completedAt DateTime?

  agent       Agent      @relation(fields: [agentId], references: [id])

  @@map("tasks")
}
```

## Testing

### Backend Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- agent.test.ts
```

### Frontend Testing

```bash
cd frontend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

### Test Structure

```typescript
// Backend test example
describe('AgentController', () => {
  let app: Application;
  let authToken: string;

  beforeAll(async () => {
    app = createApp();
    // Setup test database
  });

  afterAll(async () => {
    // Cleanup test database
  });

  describe('POST /api/agents', () => {
    it('should create a new agent', async () => {
      const agentData = {
        name: 'Test Agent',
        type: 'test',
        capabilities: ['test']
      };

      const response = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(agentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(agentData.name);
    });

    it('should return validation error for missing fields', async () => {
      const response = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

```typescript
// Frontend test example
describe('UserProfile', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User'
  };

  it('renders user information', () => {
    render(<UserProfile userId="1" />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<UserProfile userId="1" />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    mockedApi.users.getById.mockRejectedValue(new Error('User not found'));

    render(<UserProfile userId="invalid-id" />);

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });
});
```

## Pull Request Process

### PR Guidelines

1. **Create Feature Branch**: Create a branch from `main`
2. **Write Code**: Follow code standards and write tests
3. **Test Locally**: Ensure all tests pass
4. **Update Documentation**: Update relevant documentation
5. **Submit PR**: Create a pull request with clear description

### Branch Naming

```
feature/add-user-authentication
bugfix/fix-database-connection
docs/update-api-documentation
hotfix/security-patch
```

### PR Description Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] All tests pass locally
- [ ] Added new tests for new functionality
- [ ] Tested manually in development environment

## Checklist
- [ ] Code follows project standards
- [ ] Self-review of code completed
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Ready for review

## Issues
Closes #123
Related to #456
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: At least one maintainer reviews the PR
3. **Feedback**: Address review comments
4. **Approval**: PR approved by maintainer
5. **Merge**: PR merged to main branch

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Environment**: OS, Node.js version, browser version
2. **Steps to Reproduce**: Clear steps to reproduce the issue
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Error Messages**: Any error messages or stack traces
6. **Additional Context**: Screenshots, logs, or other relevant information

```markdown
## Bug Report

### Environment
- OS: Ubuntu 20.04
- Node.js: v18.17.0
- Browser: Chrome 118

### Steps to Reproduce
1. Go to '/agents'
2. Click 'Create Agent'
3. Fill in form and submit
4. See error

### Expected Behavior
Agent should be created successfully

### Actual Behavior
Error message: "Internal server error"

### Error Messages
```
Error: Cannot read property 'name' of undefined
    at createAgent (agent.controller.ts:45:23)
```

### Additional Context
[Add screenshots or logs]
```

### Feature Requests

When requesting features, please include:

1. **Problem Statement**: What problem are you trying to solve?
2. **Proposed Solution**: How do you think this should be solved?
3. **Alternative Solutions**: Other approaches you've considered
4. **Use Cases**: How would this feature be used?

```markdown
## Feature Request

### Problem Statement
As a user, I want to be able to export task results to CSV format so I can analyze them in external tools.

### Proposed Solution
Add an export button on the task results page that generates a CSV file.

### Alternative Solutions
- Export to JSON format
- Export to PDF format
- Integrate with external analytics tools

### Use Cases
- Analyze task performance over time
- Create reports for stakeholders
- Archive task results
```

## Development Workflow

### 1. Planning

- Review issue requirements
- Break down into tasks
- Estimate effort
- Identify dependencies

### 2. Development

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Set up development environment
npm install
cd frontend && npm install && cd ..

# Start development services
docker-compose -f docker-compose.dev.yml up -d

# Make changes
# ... code changes ...

# Run tests
npm test
cd frontend && npm test && cd ..

# Build and test
npm run build
cd frontend && npm run build && cd ..
```

### 3. Code Review

```bash
# Commit changes
git add .
git commit -m "feat: add user authentication

- Add login/register endpoints
- Implement JWT authentication
- Add authentication middleware
- Update documentation

Closes #123"

# Push branch
git push origin feature/your-feature-name

# Create pull request
```

### 4. Testing

```bash
# Test in development environment
npm run dev

# Test production build
docker-compose up -d --build

# Run integration tests
npm run test:integration
```

### 5. Deployment

```bash
# After PR is merged and approved
git checkout main
git pull origin main

# Deploy to staging
./deploy.sh deploy

# Verify deployment
./deploy.sh health
```

## Architecture Overview

### Project Structure

```
ccpm/
├── src/
│   ├── controllers/     # API controllers
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── config/          # Configuration
│   └── types/           # TypeScript types
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API services
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
├── prisma/              # Database schema
├── tests/               # Test files
├── docs/                # Documentation
└── deployment/          # Deployment configuration
```

### Key Technologies

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend**: React, TypeScript, Styled Components, Vite
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Real-time**: Socket.io
- **Testing**: Jest, React Testing Library
- **Deployment**: Docker, Docker Compose
- **AI Integration**: OpenAI API

### Design Patterns

1. **Repository Pattern**: For database operations
2. **Service Layer**: For business logic
3. **Controller Pattern**: For API endpoints
4. **Component Pattern**: For UI components
5. **Middleware Pattern**: For cross-cutting concerns

## Getting Help

### Resources

- **Documentation**: Check `/docs` folder
- **API Documentation**: See `API.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Issues**: GitHub issues page
- **Discussions**: GitHub discussions

### Contact

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For general questions and discussions
- **Email**: For private matters

### Code of Conduct

Please be respectful and inclusive. Harassment, discrimination, or unacceptable behavior will not be tolerated.

## Thank You

Thank you for contributing to the Multi-Agent Collaboration Platform! Your help is greatly appreciated.