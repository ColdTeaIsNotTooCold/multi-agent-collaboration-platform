import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth';
import { createTaskValidation, validateRequest } from '../middleware/validation';

const router = Router();
const taskController = new TaskController();

// Task CRUD operations
router.post(
  '/',
  authenticate,
  createTaskValidation,
  validateRequest,
  taskController.createTask
);

router.get(
  '/',
  authenticate,
  taskController.getAllTasks
);

router.get(
  '/:id',
  authenticate,
  taskController.getTask
);

router.put(
  '/:id',
  authenticate,
  taskController.updateTask
);

router.delete(
  '/:id',
  authenticate,
  taskController.deleteTask
);

// Task assignment
router.put(
  '/:id/assign',
  authenticate,
  authorize(['admin']),
  taskController.assignTask
);

// Task filtering
router.get(
  '/status/:status',
  authenticate,
  taskController.getTasksByStatus
);

router.get(
  '/assignee/:agentId',
  authenticate,
  taskController.getTasksByAssignee
);

router.get(
  '/priority/:priority',
  authenticate,
  taskController.getTasksByPriority
);

export default router;