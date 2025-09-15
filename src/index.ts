import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { logger } from './utils/logger';
import { authenticate } from './middleware/auth';

// Import routes
import agentRoutes from './routes/agent.routes';
import taskRoutes from './routes/task.routes';
import authRoutes from './routes/auth.routes';
import healthRoutes from './routes/health.routes';

// Import controllers
import { AuthController } from './controllers/auth.controller';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.cors.origin,
    credentials: config.cors.credentials
  }
});

// Middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', authenticate, agentRoutes);
app.use('/api/tasks', authenticate, taskRoutes);
app.use('/api/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Multi-Agent Collaboration Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      agents: '/api/agents',
      tasks: '/api/tasks',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Socket.io setup
io.on('connection', (socket) => {
  logger.info('Client connected', { socketId: socket.id });

  socket.on('join-agent-room', (agentId: string) => {
    socket.join(`agent-${agentId}`);
    logger.info('Agent joined room', { agentId, socketId: socket.id });
  });

  socket.on('join-task-room', (taskId: string) => {
    socket.join(`task-${taskId}`);
    logger.info('Task room joined', { taskId, socketId: socket.id });
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
});

// Export socket.io instance for use in controllers
export { io };

// Initialize default admin user
const authController = new AuthController();
authController.initializeDefaultAdmin();

// Start server
server.listen(config.port, () => {
  logger.info(`Server started on port ${config.port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;