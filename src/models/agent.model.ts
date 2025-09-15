import { Agent, CreateAgentRequest, UpdateAgentRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AgentModel {
  private agents: Map<string, Agent> = new Map();

  create(data: CreateAgentRequest): Agent {
    const agent: Agent = {
      id: uuidv4(),
      name: data.name,
      type: data.type,
      capabilities: data.capabilities,
      status: 'active',
      metadata: data.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.agents.set(agent.id, agent);
    return agent;
  }

  findById(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  findAll(): Agent[] {
    return Array.from(this.agents.values());
  }

  update(id: string, data: UpdateAgentRequest): Agent | null {
    const agent = this.agents.get(id);
    if (!agent) return null;

    const updatedAgent = {
      ...agent,
      ...data,
      updatedAt: new Date()
    };

    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }

  delete(id: string): boolean {
    return this.agents.delete(id);
  }

  findByCapability(capability: string): Agent[] {
    return this.findAll().filter(agent =>
      agent.capabilities.includes(capability) && agent.status === 'active'
    );
  }

  findByStatus(status: 'active' | 'inactive' | 'busy'): Agent[] {
    return this.findAll().filter(agent => agent.status === status);
  }
}