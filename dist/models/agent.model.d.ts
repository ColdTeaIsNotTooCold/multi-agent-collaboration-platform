import { Agent, CreateAgentRequest, UpdateAgentRequest } from '../types';
export declare class AgentModel {
    private agents;
    create(data: CreateAgentRequest): Agent;
    findById(id: string): Agent | undefined;
    findAll(): Agent[];
    update(id: string, data: UpdateAgentRequest): Agent | null;
    delete(id: string): boolean;
    findByCapability(capability: string): Agent[];
    findByStatus(status: 'active' | 'inactive' | 'busy'): Agent[];
}
//# sourceMappingURL=agent.model.d.ts.map