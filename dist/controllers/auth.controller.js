"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const logger_1 = require("../utils/logger");
class AuthController {
    constructor() {
        this.login = async (req, res) => {
            try {
                const data = req.body;
                const result = await this.authService.login(data);
                res.status(200).json({
                    success: true,
                    data: result,
                    message: 'Login successful'
                });
            }
            catch (error) {
                logger_1.logger.error('Login error:', error);
                res.status(401).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Login failed'
                });
            }
        };
        this.getProfile = async (req, res) => {
            try {
                const user = req.user;
                if (!user) {
                    res.status(401).json({
                        success: false,
                        error: 'User not authenticated'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: user
                });
            }
            catch (error) {
                logger_1.logger.error('Error getting profile:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get profile'
                });
            }
        };
        this.initializeDefaultAdmin = async () => {
            try {
                await this.authService.initializeDefaultAdmin();
            }
            catch (error) {
                logger_1.logger.error('Error initializing default admin:', error);
            }
        };
        this.authService = new auth_service_1.AuthService();
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map