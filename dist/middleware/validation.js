"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = exports.createTaskValidation = exports.createAgentValidation = exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};
exports.validateRequest = validateRequest;
exports.createAgentValidation = [
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('type')
        .isIn(['ai', 'human', 'bot'])
        .withMessage('Type must be one of: ai, human, bot'),
    (0, express_validator_1.body)('capabilities')
        .isArray()
        .withMessage('Capabilities must be an array')
        .custom((value) => {
        if (!Array.isArray(value) || value.length === 0) {
            throw new Error('At least one capability is required');
        }
        return true;
    })
];
exports.createTaskValidation = [
    (0, express_validator_1.body)('title')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Title must be between 2 and 100 characters'),
    (0, express_validator_1.body)('description')
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be one of: low, medium, high')
];
exports.loginValidation = [
    (0, express_validator_1.body)('username')
        .notEmpty()
        .withMessage('Username is required'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
];
//# sourceMappingURL=validation.js.map