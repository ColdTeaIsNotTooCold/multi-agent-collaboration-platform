import { TaskModel } from '../models/task.model';
import { Task, CreateTaskRequest, UpdateTaskRequest, AssignTaskRequest } from '../types';
import { logger } from '../utils/logger';

export class TaskService {
  private taskModel: TaskModel;

  constructor() {
    this.taskModel = new TaskModel();
  }

  async createTask(data: CreateTaskRequest, createdBy: string): Promise<Task> {
    logger.info('Creating new task', { title: data.title, priority: data.priority, createdBy });
    return this.taskModel.create(data, createdBy);
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.taskModel.findById(id);
  }

  async getAllTasks(): Promise<Task[]> {
    return this.taskModel.findAll();
  }

  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task | null> {
    logger.info('Updating task', { id, data });
    return this.taskModel.update(id, data);
  }

  async deleteTask(id: string): Promise<boolean> {
    logger.info('Deleting task', { id });
    return this.taskModel.delete(id);
  }

  async assignTask(taskId: string, agentId: string): Promise<Task | null> {
    logger.info('Assigning task', { taskId, agentId });
    return this.taskModel.assignTask(taskId, agentId);
  }

  async getTasksByStatus(status: Task['status']): Promise<Task[]> {
    return this.taskModel.findByStatus(status);
  }

  async getTasksByAssignee(agentId: string): Promise<Task[]> {
    return this.taskModel.findByAssignee(agentId);
  }

  async getTasksByCreator(creatorId: string): Promise<Task[]> {
    return this.taskModel.findByCreator(creatorId);
  }

  async getTasksByPriority(priority: Task['priority']): Promise<Task[]> {
    return this.taskModel.findByPriority(priority);
  }
}