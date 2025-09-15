# Multi-Agent Collaboration Platform - Frontend

A React TypeScript frontend dashboard for monitoring agents, managing tasks, and providing user interface for the multi-agent collaboration platform MVP.

## Features

### 🎯 Core Functionality
- **Authentication System**: Login/logout with JWT token management
- **Dashboard Overview**: Real-time statistics and monitoring
- **Agent Management**: View, search, and monitor AI agents
- **Task Management**: Create, assign, and track tasks
- **Real-time Updates**: WebSocket integration for live data
- **Responsive Design**: Works on desktop and mobile devices

### 🛠 Technical Stack
- **Framework**: React 19 with TypeScript
- **State Management**: React Context API
- **Routing**: React Router
- **Styling**: Styled Components
- **Real-time**: Socket.io Client
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Testing**: React Testing Library + Vitest

### 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard overview components
│   ├── agents/         # Agent management components
│   ├── tasks/          # Task management components
│   └── common/         # Shared components (Layout, ProtectedRoute)
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   ├── agents/         # Agent pages
│   └── tasks/          # Task pages
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── SocketContext.tsx # WebSocket state
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   └── api.ts          # API client configuration
└── test/               # Test setup and utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ccpm/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🎮 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

### Backend Integration
The frontend is configured to work with the backend API at `http://localhost:3001`. Make sure the backend server is running before starting the frontend.

## 📱 Pages and Features

### Authentication
- **Login Page**: User authentication with username/password
- **Protected Routes**: All authenticated pages require valid JWT token
- **Auto-logout**: Handles token expiration and invalid tokens

### Dashboard
- **Overview**: Statistics for agents and tasks
- **Active Agents**: List of currently active agents
- **Recent Tasks**: Latest tasks with status indicators
- **Real-time Updates**: Live updates via WebSocket

### Agent Management
- **Agent List**: View all agents with status and capabilities
- **Search & Filter**: Find agents by name, type, or capabilities
- **Status Indicators**: Visual representation of agent states
- **Real-time Status**: Live updates when agent status changes

### Task Management
- **Task List**: View all tasks with filtering options
- **Status Filtering**: Filter by task status (pending, in_progress, completed, failed)
- **Priority Filtering**: Filter by priority level (low, medium, high, critical)
- **Task Assignment**: Assign tasks to available agents
- **Real-time Updates**: Live updates when tasks change

## 🎨 Design System

### Color Palette
- **Primary**: #667eea (Indigo)
- **Secondary**: #764ba2 (Purple)
- **Success**: #28a745 (Green)
- **Warning**: #ffc107 (Yellow)
- **Error**: #dc3545 (Red)
- **Background**: #f8f9fa (Light Gray)

### Responsive Design
- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Bottom navigation and stacked layouts

## 🧪 Testing

### Running Tests
```bash
npm run test          # Run all tests
npm run test:coverage # Run tests with coverage report
```

### Test Structure
- **Component Tests**: Unit tests for React components
- **Integration Tests**: Tests for context providers and API calls
- **Setup**: Global test configuration with mocks for localStorage, WebSocket, etc.

## 🔌 API Integration

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Agents
- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get agent by ID
- `POST /api/agents` - Create new agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/assign` - Assign task to agent

## 🌐 Real-time Features

### WebSocket Events
- `agent-updated` - Agent status changes
- `task-updated` - Task status changes
- `agent-created` - New agent added
- `task-created` - New task created
- `agent-deleted` - Agent removed
- `task-deleted` - Task removed

### Room Management
- `join-agent-room` - Join agent-specific room
- `join-task-room` - Join task-specific room
- `leave-agent-room` - Leave agent room
- `leave-task-room` - Leave task room

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Environment Setup for Production
1. Set environment variables for production API URLs
2. Build the application
3. Deploy the `dist/` folder to your web server

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Write tests for new features
3. Use TypeScript for type safety
4. Follow React best practices
5. Ensure responsive design for all components

## 📄 License

This project is licensed under the MIT License.