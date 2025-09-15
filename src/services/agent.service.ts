import { AgentModel } from '../models/agent.model';
import { Agent, CreateAgentRequest, UpdateAgentRequest } from '../types';
import { logger } from '../utils/logger';

export class AgentService {
  private agentModel: AgentModel;

  constructor() {
    this.agentModel = new AgentModel();
  }

  async createAgent(data: CreateAgentRequest): Promise<Agent> {
    logger.info('Creating new agent', { name: data.name, type: data.type });
    return this.agentModel.create(data);
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    return this.agentModel.findById(id);
  }

  async getAllAgents(): Promise<Agent[]> {
    return this.agentModel.findAll();
  }

  async updateAgent(id: string, data: UpdateAgentRequest): Promise<Agent | null> {
    logger.info('Updating agent', { id, data });
    return this.agentModel.update(id, data);
  }

  async deleteAgent(id: string): Promise<boolean> {
    logger.info('Deleting agent', { id });
    return this.agentModel.delete(id);
  }

  async getAgentsByCapability(capability: string): Promise<Agent[]> {
    return this.agentModel.findByCapability(capability);
  }

  async getAgentsByStatus(status: 'active' | 'inactive' | 'busy'): Promise<Agent[]> {
    return this.agentModel.findByStatus(status);
  }
}