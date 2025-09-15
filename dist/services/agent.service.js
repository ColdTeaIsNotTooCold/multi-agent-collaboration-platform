"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const agent_model_1 = require("../models/agent.model");
const logger_1 = require("../utils/logger");
class AgentService {
    constructor() {
        this.agentModel = new agent_model_1.AgentModel();
    }
    createAgent(data) {
        logger_1.logger.info('Creating new agent', { name: data.name, type: data.type });
        return this.agentModel.create(data);
    }
    getAgent(id) {
        return this.agentModel.findById(id);
    }
    getAllAgents() {
        return this.agentModel.findAll();
    }
    updateAgent(id, data) {
        logger_1.logger.info('Updating agent', { id, data });
        return this.agentModel.update(id, data);
    }
    deleteAgent(id) {
        logger_1.logger.info('Deleting agent', { id });
        return this.agentModel.delete(id);
    }
    getAgentsByCapability(capability) {
        return this.agentModel.findByCapability(capability);
    }
    getAgentsByStatus(status) {
        return this.agentModel.findByStatus(status);
    }
}
exports.AgentService = AgentService;
//# sourceMappingURL=agent.service.js.map