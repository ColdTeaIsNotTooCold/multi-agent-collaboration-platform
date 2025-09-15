import { Request, Response } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
  };
}
import { AgentService } from '../services/agent.service';
import { CreateAgentRequest, UpdateAgentRequest } from '../types';
import { logger } from '../utils/logger';

export class AgentController {
  private agentService: AgentService;

  constructor() {
    this.agentService = new AgentService();
  }

  createAgent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data: CreateAgentRequest = req.body;
      const agent = this.agentService.createAgent(data);

      res.status(201).json({
        success: true,
        data: agent,
        message: 'Agent created successfully'
      });
    } catch (error) {
      logger.error('Error creating agent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create agent'
      });
    }
  };

  getAgent = async (req: AuthRequest, res: Response): Promise<void> => {
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
    } catch (error) {
      logger.error('Error getting agent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get agent'
      });
    }
  };

  getAllAgents = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const agents = this.agentService.getAllAgents();

      res.status(200).json({
        success: true,
        data: agents,
        count: agents.length
      });
    } catch (error) {
      logger.error('Error getting agents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get agents'
      });
    }
  };

  updateAgent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateAgentRequest = req.body;
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
    } catch (error) {
      logger.error('Error updating agent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update agent'
      });
    }
  };

  deleteAgent = async (req: AuthRequest, res: Response): Promise<void> => {
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
    } catch (error) {
      logger.error('Error deleting agent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete agent'
      });
    }
  };

  getAgentsByCapability = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { capability } = req.params;
      const agents = this.agentService.getAgentsByCapability(capability);

      res.status(200).json({
        success: true,
        data: agents,
        count: agents.length
      });
    } catch (error) {
      logger.error('Error getting agents by capability:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get agents by capability'
      });
    }
  };

  getAgentsByStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status } = req.params;
      const agents = this.agentService.getAgentsByStatus(status as 'active' | 'inactive' | 'busy');

      res.status(200).json({
        success: true,
        data: agents,
        count: agents.length
      });
    } catch (error) {
      logger.error('Error getting agents by status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get agents by status'
      });
    }
  };
}