import { AgentService } from '../services/agent.service';
import { CreateAgentRequest, UpdateAgentRequest } from '../types';

describe('AgentService', () => {
  let agentService: AgentService;

  beforeEach(() => {
    agentService = new AgentService();
  });

  describe('createAgent', () => {
    it('should create a new agent with valid data', () => {
      const agentData: CreateAgentRequest = {
        name: 'Test Agent',
        type: 'ai',
        capabilities: ['code-analysis', 'debugging']
      };

      const agent = agentService.createAgent(agentData);

      expect(agent).toBeDefined();
      expect(agent.name).toBe(agentData.name);
      expect(agent.type).toBe(agentData.type);
      expect(agent.capabilities).toEqual(agentData.capabilities);
      expect(agent.status).toBe('active');
      expect(agent.id).toBeDefined();
      expect(agent.createdAt).toBeInstanceOf(Date);
      expect(agent.updatedAt).toBeInstanceOf(Date);
    });

    it('should create agent with metadata', () => {
      const agentData: CreateAgentRequest = {
        name: 'Test Agent',
        type: 'bot',
        capabilities: ['monitoring'],
        metadata: { version: '1.0.0', language: 'javascript' }
      };

      const agent = agentService.createAgent(agentData);

      expect(agent.metadata).toEqual(agentData.metadata);
    });
  });

  describe('getAgent', () => {
    it('should return agent by id', () => {
      const agentData: CreateAgentRequest = {
        name: 'Test Agent',
        type: 'ai',
        capabilities: ['testing']
      };

      const createdAgent = agentService.createAgent(agentData);
      const foundAgent = agentService.getAgent(createdAgent.id);

      expect(foundAgent).toBeDefined();
      expect(foundAgent?.id).toBe(createdAgent.id);
    });

    it('should return undefined for non-existent agent', () => {
      const agent = agentService.getAgent('non-existent-id');
      expect(agent).toBeUndefined();
    });
  });

  describe('getAllAgents', () => {
    it('should return all agents', () => {
      const agentData1: CreateAgentRequest = {
        name: 'Agent 1',
        type: 'ai',
        capabilities: ['capability1']
      };

      const agentData2: CreateAgentRequest = {
        name: 'Agent 2',
        type: 'human',
        capabilities: ['capability2']
      };

      agentService.createAgent(agentData1);
      agentService.createAgent(agentData2);

      const agents = agentService.getAllAgents();

      expect(agents).toHaveLength(2);
      expect(agents[0].name).toBe('Agent 1');
      expect(agents[1].name).toBe('Agent 2');
    });

    it('should return empty array when no agents exist', () => {
      const agents = agentService.getAllAgents();
      expect(agents).toHaveLength(0);
    });
  });

  describe('updateAgent', () => {
    it('should update agent with valid data', () => {
      const agentData: CreateAgentRequest = {
        name: 'Test Agent',
        type: 'ai',
        capabilities: ['testing']
      };

      const createdAgent = agentService.createAgent(agentData);
      const updateData: UpdateAgentRequest = {
        name: 'Updated Agent',
        status: 'busy'
      };

      const updatedAgent = agentService.updateAgent(createdAgent.id, updateData);

      expect(updatedAgent).toBeDefined();
      expect(updatedAgent?.name).toBe(updateData.name);
      expect(updatedAgent?.status).toBe(updateData.status);
      expect(updatedAgent?.updatedAt.getTime()).toBeGreaterThanOrEqual(createdAgent.updatedAt.getTime());
    });

    it('should return null for non-existent agent', () => {
      const updateData: UpdateAgentRequest = {
        name: 'Updated Agent'
      };

      const result = agentService.updateAgent('non-existent-id', updateData);
      expect(result).toBeNull();
    });
  });

  describe('deleteAgent', () => {
    it('should delete existing agent', () => {
      const agentData: CreateAgentRequest = {
        name: 'Test Agent',
        type: 'ai',
        capabilities: ['testing']
      };

      const createdAgent = agentService.createAgent(agentData);
      const deleted = agentService.deleteAgent(createdAgent.id);

      expect(deleted).toBe(true);
      expect(agentService.getAgent(createdAgent.id)).toBeUndefined();
    });

    it('should return false for non-existent agent', () => {
      const deleted = agentService.deleteAgent('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('getAgentsByCapability', () => {
    it('should return agents with specific capability', () => {
      const agentData1: CreateAgentRequest = {
        name: 'Agent 1',
        type: 'ai',
        capabilities: ['coding', 'testing']
      };

      const agentData2: CreateAgentRequest = {
        name: 'Agent 2',
        type: 'human',
        capabilities: ['testing', 'review']
      };

      const agentData3: CreateAgentRequest = {
        name: 'Agent 3',
        type: 'bot',
        capabilities: ['monitoring']
      };

      agentService.createAgent(agentData1);
      agentService.createAgent(agentData2);
      agentService.createAgent(agentData3);

      const codingAgents = agentService.getAgentsByCapability('coding');
      const testingAgents = agentService.getAgentsByCapability('testing');
      const monitoringAgents = agentService.getAgentsByCapability('monitoring');

      expect(codingAgents).toHaveLength(1);
      expect(testingAgents).toHaveLength(2);
      expect(monitoringAgents).toHaveLength(1);
    });
  });

  describe('getAgentsByStatus', () => {
    it('should return agents with specific status', () => {
      const agentData1: CreateAgentRequest = {
        name: 'Agent 1',
        type: 'ai',
        capabilities: ['coding']
      };

      const agentData2: CreateAgentRequest = {
        name: 'Agent 2',
        type: 'human',
        capabilities: ['testing']
      };

      const agent1 = agentService.createAgent(agentData1);
      const agent2 = agentService.createAgent(agentData2);

      agentService.updateAgent(agent1.id, { status: 'busy' });

      const activeAgents = agentService.getAgentsByStatus('active');
      const busyAgents = agentService.getAgentsByStatus('busy');

      expect(activeAgents).toHaveLength(1);
      expect(busyAgents).toHaveLength(1);
    });
  });
});