"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const user_model_1 = require("../models/user.model");
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
class AuthService {
    constructor() {
        this.userModel = new user_model_1.UserModel();
    }
    async login(data) {
        logger_1.logger.info('User login attempt', { username: data.username });
        const user = await this.userModel.validateLogin(data.username, data.password);
        if (!user) {
            logger_1.logger.warn('Login failed', { username: data.username });
            throw new Error('Invalid credentials');
        }
        const token = (0, jwt_1.generateToken)(user);
        logger_1.logger.info('User logged in successfully', { username: data.username, userId: user.id });
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        };
    }
    async initializeDefaultAdmin() {
        await this.userModel.createDefaultAdmin();
        logger_1.logger.info('Default admin user initialized');
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map