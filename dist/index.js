"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const auth_1 = require("./middleware/auth");
// Import routes
const agent_routes_1 = __importDefault(require("./routes/agent.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
// Import controllers
const auth_controller_1 = require("./controllers/auth.controller");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: config_1.config.cors.origin,
        credentials: config_1.config.cors.credentials
    }
});
exports.io = io;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)(config_1.config.cors));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)(config_1.config.rateLimit);
app.use('/api/', limiter);
// Request logging
app.use((req, res, next) => {
    logger_1.logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    next();
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/agents', auth_1.authenticate, agent_routes_1.default);
app.use('/api/tasks', auth_1.authenticate, task_routes_1.default);
app.use('/api/health', health_routes_1.default);
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
app.use((err, req, res, next) => {
    logger_1.logger.error('Unhandled error:', err);
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
    logger_1.logger.info('Client connected', { socketId: socket.id });
    socket.on('join-agent-room', (agentId) => {
        socket.join(`agent-${agentId}`);
        logger_1.logger.info('Agent joined room', { agentId, socketId: socket.id });
    });
    socket.on('join-task-room', (taskId) => {
        socket.join(`task-${taskId}`);
        logger_1.logger.info('Task room joined', { taskId, socketId: socket.id });
    });
    socket.on('disconnect', () => {
        logger_1.logger.info('Client disconnected', { socketId: socket.id });
    });
});
// Initialize default admin user
const authController = new auth_controller_1.AuthController();
authController.initializeDefaultAdmin();
// Start server
server.listen(config_1.config.port, () => {
    logger_1.logger.info(`Server started on port ${config_1.config.port}`);
    logger_1.logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map