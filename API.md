# Multi-Agent Collaboration Platform - API Documentation

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

All API endpoints (except auth endpoints) require authentication using JWT tokens.

### Authentication Flow

1. **Login** - Obtain JWT token
2. **Include token** in Authorization header
3. **Refresh token** before expiration

### Request Format

```bash
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

## Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

#### Register
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "name": "John Doe"
}
```

#### Verify Token
```http
GET /api/auth/verify
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

### Agents

#### Get All Agents
```http
GET /api/agents
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "agent-id",
      "name": "Code Reviewer",
      "type": "code_review",
      "status": "active",
      "capabilities": ["code_analysis", "suggestion"],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Agent
```http
POST /api/agents
```

**Request Body:**
```json
{
  "name": "Security Auditor",
  "type": "security_audit",
  "capabilities": ["vulnerability_scan", "compliance_check"],
  "config": {
    "scanDepth": "deep",
    "reportFormat": "detailed"
  }
}
```

#### Update Agent
```http
PUT /api/agents/:id
```

#### Delete Agent
```http
DELETE /api/agents/:id
```

#### Execute Agent
```http
POST /api/agents/:id/execute
```

**Request Body:**
```json
{
  "input": "Code to analyze",
  "context": {
    "repository": "repo-name",
    "branch": "main"
  }
}
```

### Tasks

#### Get All Tasks
```http
GET /api/tasks
```

**Query Parameters:**
- `status`: `pending`, `in_progress`, `completed`, `failed`
- `agentId`: Filter by agent
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task-id",
      "title": "Review PR #123",
      "description": "Code review for feature branch",
      "status": "in_progress",
      "priority": "high",
      "agentId": "agent-id",
      "input": "PR content",
      "result": "Review comments",
      "createdAt": "2024-01-01T00:00:00Z",
      "completedAt": "2024-01-01T00:30:00Z"
    }
  ]
}
```

#### Create Task
```http
POST /api/tasks
```

**Request Body:**
```json
{
  "title": "Security Audit",
  "description": "Perform security audit on authentication module",
  "priority": "high",
  "agentId": "agent-id",
  "input": "Code to audit",
  "context": {
    "module": "auth",
    "criticality": "high"
  }
}
```

#### Update Task
```http
PUT /api/tasks/:id
```

#### Delete Task
```http
DELETE /api/tasks/:id
```

#### Get Task Status
```http
GET /api/tasks/:id/status
```

### AI Integration

#### Chat Completion
```http
POST /api/ai/chat
```

**Request Body:**
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a code review assistant."
    },
    {
      "role": "user",
      "content": "Review this JavaScript function for potential issues."
    }
  ],
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "chatcmpl-123",
    "message": {
      "role": "assistant",
      "content": "I found several issues in your code..."
    },
    "usage": {
      "promptTokens": 150,
      "completionTokens": 300,
      "totalTokens": 450
    }
  }
}
```

#### Code Analysis
```http
POST /api/ai/analyze
```

**Request Body:**
```json
{
  "code": "function add(a, b) { return a + b; }",
  "language": "javascript",
  "analysisType": "security"
}
```

#### Generate Documentation
```http
POST /api/ai/generate-docs
```

**Request Body:**
```json
{
  "code": "class Calculator { ... }",
  "language": "typescript",
  "format": "markdown"
}
```

### Health Check

#### System Health
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0",
    "database": {
      "status": "connected",
      "responseTime": 12
    },
    "memory": {
      "used": 256,
      "total": 1024,
      "percentage": 25
    },
    "uptime": 86400
  }
}
```

## WebSocket Events

### Connection

```javascript
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Agent Events
- `agent-status-changed`: Agent status update
- `agent-execution-started`: Agent execution started
- `agent-execution-completed`: Agent execution completed
- `agent-execution-failed`: Agent execution failed

#### Task Events
- `task-created`: New task created
- `task-updated`: Task status updated
- `task-completed`: Task completed
- `task-failed`: Task failed

#### System Events
- `system-status`: System status update
- `error`: Error notification

### Event Payloads

#### Agent Status Changed
```json
{
  "type": "agent-status-changed",
  "data": {
    "agentId": "agent-id",
    "status": "active",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

#### Task Completed
```json
{
  "type": "task-completed",
  "data": {
    "taskId": "task-id",
    "result": "Task completion result",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

### Error Codes

- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `AGENT_ERROR`: Agent execution failed
- `TASK_ERROR`: Task processing failed
- `DATABASE_ERROR`: Database operation failed
- `EXTERNAL_SERVICE_ERROR`: External service error

## Rate Limiting

### Default Limits

- **General API**: 100 requests per minute
- **Authentication endpoints**: 5 requests per minute
- **AI endpoints**: 10 requests per minute

### Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Data Models

### Agent

```typescript
interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  capabilities: string[];
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Task

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  agentId: string;
  input: string;
  result?: string;
  context?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

### User

```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}
```

## Examples

### Basic Usage

```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

const { token } = await loginResponse.json();

// Create agent
const agentResponse = await fetch('/api/agents', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Code Reviewer',
    type: 'code_review',
    capabilities: ['code_analysis']
  })
});

// Create task
const taskResponse = await fetch('/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Review PR #123',
    priority: 'high',
    agentId: 'agent-id',
    input: 'PR content'
  })
});
```

### WebSocket Integration

```javascript
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Join agent room
socket.emit('join-agent-room', 'agent-id');

// Join task room
socket.emit('join-task-room', 'task-id');

// Listen for events
socket.on('agent-execution-completed', (data) => {
  console.log('Agent execution completed:', data);
});

socket.on('task-completed', (data) => {
  console.log('Task completed:', data);
});
```

## Testing

### Using curl

```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Get agents (with token)
curl -X GET http://localhost:3000/api/agents \
  -H "Authorization: Bearer your-token"

# Create task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"title":"Test Task","agentId":"agent-id","input":"test input"}'
```

### Using Postman

1. Import the API collection
2. Set environment variables
3. Use the authentication flow to get tokens
4. Test endpoints with proper authorization

## SDKs

### JavaScript SDK

```javascript
import { CCPMApi } from '@ccpm/sdk';

const api = new CCPMApi({
  baseUrl: 'http://localhost:3000/api',
  token: 'your-jwt-token'
});

// Create agent
const agent = await api.agents.create({
  name: 'Code Reviewer',
  type: 'code_review',
  capabilities: ['code_analysis']
});

// Create task
const task = await api.tasks.create({
  title: 'Review PR #123',
  agentId: agent.id,
  input: 'PR content'
});
```

### Python SDK

```python
from ccpm import CCPMApi

api = CCPMApi(
    base_url='http://localhost:3000/api',
    token='your-jwt-token'
)

# Create agent
agent = api.agents.create(
    name='Code Reviewer',
    type='code_review',
    capabilities=['code_analysis']
)

# Create task
task = api.tasks.create(
    title='Review PR #123',
    agent_id=agent.id,
    input='PR content'
)
```

## Support

For API-related issues:

1. Check the API documentation
2. Review error messages
3. Test with curl or Postman
4. Check server logs
5. Create an issue in the repository