import { Agent, CreateAgentRequest, UpdateAgentRequest } from '../types';
import { prisma } from '../utils/database';

export class AgentModel {
  async create(data: CreateAgentRequest): Promise<Agent> {
    const agent = await prisma.agent.create({
      data: {
        name: data.name,
        type: data.type.toUpperCase() as 'AI' | 'HUMAN' | 'BOT',
        capabilities: data.capabilities,
        status: 'ACTIVE',
        metadata: data.metadata || {}
      }
    });

    return {
      id: agent.id,
      name: agent.name,
      type: agent.type.toLowerCase() as 'ai' | 'human' | 'bot',
      capabilities: agent.capabilities,
      status: agent.status.toLowerCase() as 'active' | 'inactive' | 'busy',
      metadata: agent.metadata,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt
    };
  }

  async findById(id: string): Promise<Agent | undefined> {
    const agent = await prisma.agent.findUnique({
      where: { id }
    });

    if (!agent) return undefined;

    return {
      id: agent.id,
      name: agent.name,
      type: agent.type.toLowerCase() as 'ai' | 'human' | 'bot',
      capabilities: agent.capabilities,
      status: agent.status.toLowerCase() as 'active' | 'inactive' | 'busy',
      metadata: agent.metadata,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt
    };
  }

  async findAll(): Promise<Agent[]> {
    const agents = await prisma.agent.findMany();

    return agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      type: agent.type.toLowerCase() as 'ai' | 'human' | 'bot',
      capabilities: agent.capabilities,
      status: agent.status.toLowerCase() as 'active' | 'inactive' | 'busy',
      metadata: agent.metadata,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt
    }));
  }

  async update(id: string, data: UpdateAgentRequest): Promise<Agent | null> {
    const updateData: any = { ...data };

    if (data.status) {
      updateData.status = data.status.toUpperCase() as 'ACTIVE' | 'INACTIVE' | 'BUSY';
    }

    const agent = await prisma.agent.update({
      where: { id },
      data: updateData
    });

    return {
      id: agent.id,
      name: agent.name,
      type: agent.type.toLowerCase() as 'ai' | 'human' | 'bot',
      capabilities: agent.capabilities,
      status: agent.status.toLowerCase() as 'active' | 'inactive' | 'busy',
      metadata: agent.metadata,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt
    };
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.agent.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }

  async findByCapability(capability: string): Promise<Agent[]> {
    const agents = await prisma.agent.findMany({
      where: {
        capabilities: {
          has: capability
        },
        status: 'ACTIVE'
      }
    });

    return agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      type: agent.type.toLowerCase() as 'ai' | 'human' | 'bot',
      capabilities: agent.capabilities,
      status: agent.status.toLowerCase() as 'active' | 'inactive' | 'busy',
      metadata: agent.metadata,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt
    }));
  }

  async findByStatus(status: 'active' | 'inactive' | 'busy'): Promise<Agent[]> {
    const agents = await prisma.agent.findMany({
      where: {
        status: status.toUpperCase() as 'ACTIVE' | 'INACTIVE' | 'BUSY'
      }
    });

    return agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      type: agent.type.toLowerCase() as 'ai' | 'human' | 'bot',
      capabilities: agent.capabilities,
      status: agent.status.toLowerCase() as 'active' | 'inactive' | 'busy',
      metadata: agent.metadata,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt
    }));
  }
}