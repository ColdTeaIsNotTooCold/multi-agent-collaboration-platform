export interface Agent {
    id: string;
    name: string;
    type: 'ai' | 'human' | 'bot';
    capabilities: string[];
    status: 'active' | 'inactive' | 'busy';
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateAgentRequest {
    name: string;
    type: 'ai' | 'human' | 'bot';
    capabilities: string[];
    metadata?: Record<string, any>;
}
export interface UpdateAgentRequest {
    name?: string;
    capabilities?: string[];
    status?: 'active' | 'inactive' | 'busy';
    metadata?: Record<string, any>;
}
//# sourceMappingURL=agent.d.ts.map