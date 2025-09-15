import { Agent, CreateAgentRequest, UpdateAgentRequest } from '../types';
export declare class AgentService {
    private agentModel;
    constructor();
    createAgent(data: CreateAgentRequest): Agent;
    getAgent(id: string): Agent | undefined;
    getAllAgents(): Agent[];
    updateAgent(id: string, data: UpdateAgentRequest): Agent | null;
    deleteAgent(id: string): boolean;
    getAgentsByCapability(capability: string): Agent[];
    getAgentsByStatus(status: 'active' | 'inactive' | 'busy'): Agent[];
}
//# sourceMappingURL=agent.service.d.ts.map