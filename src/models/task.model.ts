import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class TaskModel {
  private tasks: Map<string, Task> = new Map();

  create(data: CreateTaskRequest, createdBy: string): Task {
    const task: Task = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      status: 'pending',
      priority: data.priority,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: data.metadata || {}
    };

    this.tasks.set(task.id, task);
    return task;
  }

  findById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  findAll(): Task[] {
    return Array.from(this.tasks.values());
  }

  update(id: string, data: UpdateTaskRequest): Task | null {
    const task = this.tasks.get(id);
    if (!task) return null;

    const updatedTask = {
      ...task,
      ...data,
      updatedAt: new Date(),
      completedAt: data.status === 'completed' ? new Date() : task.completedAt
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }

  findByStatus(status: Task['status']): Task[] {
    return this.findAll().filter(task => task.status === status);
  }

  findByAssignee(agentId: string): Task[] {
    return this.findAll().filter(task => task.assignedTo === agentId);
  }

  findByCreator(creatorId: string): Task[] {
    return this.findAll().filter(task => task.createdBy === creatorId);
  }

  findByPriority(priority: Task['priority']): Task[] {
    return this.findAll().filter(task => task.priority === priority);
  }

  assignTask(taskId: string, agentId: string): Task | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    const updatedTask = {
      ...task,
      assignedTo: agentId,
      status: 'assigned' as const,
      updatedAt: new Date()
    };

    this.tasks.set(taskId, updatedTask);
    return updatedTask;
  }
}