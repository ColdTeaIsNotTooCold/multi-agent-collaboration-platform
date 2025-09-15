import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types';
import { prisma } from '../utils/database';

export class TaskModel {
  async create(data: CreateTaskRequest, createdBy: string): Promise<Task> {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
        createdBy,
        metadata: data.metadata || {}
      }
    });

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase() as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed',
      priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high',
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      metadata: task.metadata
    };
  }

  async findById(id: string): Promise<Task | undefined> {
    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) return undefined;

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase() as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed',
      priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high',
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      metadata: task.metadata
    };
  }

  async findAll(): Promise<Task[]> {
    const tasks = await prisma.task.findMany();

    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase() as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed',
      priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high',
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      metadata: task.metadata
    }));
  }

  async update(id: string, data: UpdateTaskRequest): Promise<Task | null> {
    const updateData: any = { ...data };

    if (data.status) {
      updateData.status = data.status.toUpperCase() as 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
      if (data.status === 'completed') {
        updateData.completedAt = new Date();
      }
    }

    if (data.priority) {
      updateData.priority = data.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH';
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData
    });

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase() as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed',
      priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high',
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      metadata: task.metadata
    };
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.task.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }

  async findByStatus(status: Task['status']): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: {
        status: status.toUpperCase() as 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
      }
    });

    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase() as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed',
      priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high',
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      metadata: task.metadata
    }));
  }

  async findByAssignee(agentId: string): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: { assignedTo: agentId }
    });

    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase() as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed',
      priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high',
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      metadata: task.metadata
    }));
  }

  async findByCreator(creatorId: string): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: { createdBy: creatorId }
    });

    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase() as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed',
      priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high',
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      metadata: task.metadata
    }));
  }

  async findByPriority(priority: Task['priority']): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: {
        priority: priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH'
      }
    });

    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase() as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed',
      priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high',
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      metadata: task.metadata
    }));
  }

  async assignTask(taskId: string, agentId: string): Promise<Task | null> {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        assignedTo: agentId,
        status: 'ASSIGNED'
      }
    });

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase() as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed',
      priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high',
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      metadata: task.metadata
    };
  }
}