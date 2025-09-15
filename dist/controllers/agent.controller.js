"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentController = void 0;
const agent_service_1 = require("../services/agent.service");
const logger_1 = require("../utils/logger");
class AgentController {
    constructor() {
        this.createAgent = async (req, res) => {
            try {
                const data = req.body;
                const agent = this.agentService.createAgent(data);
                res.status(201).json({
                    success: true,
                    data: agent,
                    message: 'Agent created successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error creating agent:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to create agent'
                });
            }
        };
        this.getAgent = async (req, res) => {
            try {
                const { id } = req.params;
                const agent = this.agentService.getAgent(id);
                if (!agent) {
                    res.status(404).json({
                        success: false,
                        error: 'Agent not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: agent
                });
            }
            catch (error) {
                logger_1.logger.error('Error getting agent:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get agent'
                });
            }
        };
        this.getAllAgents = async (req, res) => {
            try {
                const agents = this.agentService.getAllAgents();
                res.status(200).json({
                    success: true,
                    data: agents,
                    count: agents.length
                });
            }
            catch (error) {
                logger_1.logger.error('Error getting agents:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get agents'
                });
            }
        };
        this.updateAgent = async (req, res) => {
            try {
                const { id } = req.params;
                const data = req.body;
                const agent = this.agentService.updateAgent(id, data);
                if (!agent) {
                    res.status(404).json({
                        success: false,
                        error: 'Agent not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: agent,
                    message: 'Agent updated successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error updating agent:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to update agent'
                });
            }
        };
        this.deleteAgent = async (req, res) => {
            try {
                const { id } = req.params;
                const deleted = this.agentService.deleteAgent(id);
                if (!deleted) {
                    res.status(404).json({
                        success: false,
                        error: 'Agent not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Agent deleted successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error deleting agent:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to delete agent'
                });
            }
        };
        this.getAgentsByCapability = async (req, res) => {
            try {
                const { capability } = req.params;
                const agents = this.agentService.getAgentsByCapability(capability);
                res.status(200).json({
                    success: true,
                    data: agents,
                    count: agents.length
                });
            }
            catch (error) {
                logger_1.logger.error('Error getting agents by capability:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get agents by capability'
                });
            }
        };
        this.getAgentsByStatus = async (req, res) => {
            try {
                const { status } = req.params;
                const agents = this.agentService.getAgentsByStatus(status);
                res.status(200).json({
                    success: true,
                    data: agents,
                    count: agents.length
                });
            }
            catch (error) {
                logger_1.logger.error('Error getting agents by status:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get agents by status'
                });
            }
        };
        this.agentService = new agent_service_1.AgentService();
    }
}
exports.AgentController = AgentController;
//# sourceMappingURL=agent.controller.js.map