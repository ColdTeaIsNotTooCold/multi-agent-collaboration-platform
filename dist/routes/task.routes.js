"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
const taskController = new task_controller_1.TaskController();
// Task CRUD operations
router.post('/', auth_1.authenticate, validation_1.createTaskValidation, validation_1.validateRequest, taskController.createTask);
router.get('/', auth_1.authenticate, taskController.getAllTasks);
router.get('/:id', auth_1.authenticate, taskController.getTask);
router.put('/:id', auth_1.authenticate, taskController.updateTask);
router.delete('/:id', auth_1.authenticate, taskController.deleteTask);
// Task assignment
router.put('/:id/assign', auth_1.authenticate, (0, auth_1.authorize)(['admin']), taskController.assignTask);
// Task filtering
router.get('/status/:status', auth_1.authenticate, taskController.getTasksByStatus);
router.get('/assignee/:agentId', auth_1.authenticate, taskController.getTasksByAssignee);
router.get('/priority/:priority', auth_1.authenticate, taskController.getTasksByPriority);
exports.default = router;
//# sourceMappingURL=task.routes.js.map