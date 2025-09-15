"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentModel = void 0;
const uuid_1 = require("uuid");
class AgentModel {
    constructor() {
        this.agents = new Map();
    }
    create(data) {
        const agent = {
            id: (0, uuid_1.v4)(),
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
    findById(id) {
        return this.agents.get(id);
    }
    findAll() {
        return Array.from(this.agents.values());
    }
    update(id, data) {
        const agent = this.agents.get(id);
        if (!agent)
            return null;
        const updatedAgent = {
            ...agent,
            ...data,
            updatedAt: new Date()
        };
        this.agents.set(id, updatedAgent);
        return updatedAgent;
    }
    delete(id) {
        return this.agents.delete(id);
    }
    findByCapability(capability) {
        return this.findAll().filter(agent => agent.capabilities.includes(capability) && agent.status === 'active');
    }
    findByStatus(status) {
        return this.findAll().filter(agent => agent.status === status);
    }
}
exports.AgentModel = AgentModel;
//# sourceMappingURL=agent.model.js.map