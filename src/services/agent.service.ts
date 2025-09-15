import { AgentModel } from '../models/agent.model';
import { Agent, CreateAgentRequest, UpdateAgentRequest } from '../types';
import { logger } from '../utils/logger';

export class AgentService {
  private agentModel: AgentModel;

  constructor() {
    this.agentModel = new AgentModel();
  }

  createAgent(data: CreateAgentRequest): Agent {
    logger.info('Creating new agent', { name: data.name, type: data.type });
    return this.agentModel.create(data);
  }

  getAgent(id: string): Agent | undefined {
    return this.agentModel.findById(id);
  }

  getAllAgents(): Agent[] {
    return this.agentModel.findAll();
  }

  updateAgent(id: string, data: UpdateAgentRequest): Agent | null {
    logger.info('Updating agent', { id, data });
    return this.agentModel.update(id, data);
  }

  deleteAgent(id: string): boolean {
    logger.info('Deleting agent', { id });
    return this.agentModel.delete(id);
  }

  getAgentsByCapability(capability: string): Agent[] {
    return this.agentModel.findByCapability(capability);
  }

  getAgentsByStatus(status: 'active' | 'inactive' | 'busy'): Agent[] {
    return this.agentModel.findByStatus(status);
  }
}