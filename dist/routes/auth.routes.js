"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Authentication routes
router.post('/login', validation_1.loginValidation, validation_1.validateRequest, authController.login);
router.get('/profile', authController.getProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map