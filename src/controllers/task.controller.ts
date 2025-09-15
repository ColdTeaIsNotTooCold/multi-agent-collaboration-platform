import { Request, Response } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
  };
}
import { TaskService } from '../services/task.service';
import { CreateTaskRequest, UpdateTaskRequest, AssignTaskRequest } from '../types';
import { logger } from '../utils/logger';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data: CreateTaskRequest = req.body;
      const createdBy = req.user?.id;

      if (!createdBy) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const task = this.taskService.createTask(data, createdBy);

      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully'
      });
    } catch (error) {
      logger.error('Error creating task:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create task'
      });
    }
  };

  getTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const task = this.taskService.getTask(id);

      if (!task) {
        res.status(404).json({
          success: false,
          error: 'Task not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      logger.error('Error getting task:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get task'
      });
    }
  };

  getAllTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tasks = this.taskService.getAllTasks();

      res.status(200).json({
        success: true,
        data: tasks,
        count: tasks.length
      });
    } catch (error) {
      logger.error('Error getting tasks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get tasks'
      });
    }
  };

  updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateTaskRequest = req.body;
      const task = this.taskService.updateTask(id, data);

      if (!task) {
        res.status(404).json({
          success: false,
          error: 'Task not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: task,
        message: 'Task updated successfully'
      });
    } catch (error) {
      logger.error('Error updating task:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update task'
      });
    }
  };

  deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = this.taskService.deleteTask(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Task not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting task:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete task'
      });
    }
  };

  assignTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { agentId }: AssignTaskRequest = req.body;
      const task = this.taskService.assignTask(id, agentId);

      if (!task) {
        res.status(404).json({
          success: false,
          error: 'Task not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: task,
        message: 'Task assigned successfully'
      });
    } catch (error) {
      logger.error('Error assigning task:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign task'
      });
    }
  };

  getTasksByStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status } = req.params;
      const tasks = this.taskService.getTasksByStatus(status as any);

      res.status(200).json({
        success: true,
        data: tasks,
        count: tasks.length
      });
    } catch (error) {
      logger.error('Error getting tasks by status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get tasks by status'
      });
    }
  };

  getTasksByAssignee = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { agentId } = req.params;
      const tasks = this.taskService.getTasksByAssignee(agentId);

      res.status(200).json({
        success: true,
        data: tasks,
        count: tasks.length
      });
    } catch (error) {
      logger.error('Error getting tasks by assignee:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get tasks by assignee'
      });
    }
  };

  getTasksByPriority = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { priority } = req.params;
      const tasks = this.taskService.getTasksByPriority(priority as any);

      res.status(200).json({
        success: true,
        data: tasks,
        count: tasks.length
      });
    } catch (error) {
      logger.error('Error getting tasks by priority:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get tasks by priority'
      });
    }
  };
}