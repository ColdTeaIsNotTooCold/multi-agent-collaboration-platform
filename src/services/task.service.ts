import { TaskModel } from '../models/task.model';
import { Task, CreateTaskRequest, UpdateTaskRequest, AssignTaskRequest } from '../types';
import { logger } from '../utils/logger';

export class TaskService {
  private taskModel: TaskModel;

  constructor() {
    this.taskModel = new TaskModel();
  }

  createTask(data: CreateTaskRequest, createdBy: string): Task {
    logger.info('Creating new task', { title: data.title, priority: data.priority, createdBy });
    return this.taskModel.create(data, createdBy);
  }

  getTask(id: string): Task | undefined {
    return this.taskModel.findById(id);
  }

  getAllTasks(): Task[] {
    return this.taskModel.findAll();
  }

  updateTask(id: string, data: UpdateTaskRequest): Task | null {
    logger.info('Updating task', { id, data });
    return this.taskModel.update(id, data);
  }

  deleteTask(id: string): boolean {
    logger.info('Deleting task', { id });
    return this.taskModel.delete(id);
  }

  assignTask(taskId: string, agentId: string): Task | null {
    logger.info('Assigning task', { taskId, agentId });
    return this.taskModel.assignTask(taskId, agentId);
  }

  getTasksByStatus(status: Task['status']): Task[] {
    return this.taskModel.findByStatus(status);
  }

  getTasksByAssignee(agentId: string): Task[] {
    return this.taskModel.findByAssignee(agentId);
  }

  getTasksByCreator(creatorId: string): Task[] {
    return this.taskModel.findByCreator(creatorId);
  }

  getTasksByPriority(priority: Task['priority']): Task[] {
    return this.taskModel.findByPriority(priority);
  }
}