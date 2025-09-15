import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { AIService } from '../services/ai.service';
import { AIAgentService } from '../services/ai-agent.service';
import { PromptTemplateService } from '../services/prompt-templates.service';
import { logger } from '../utils/logger';

const router = Router();
const aiService = new AIService();
const aiAgentService = new AIAgentService();
const promptService = new PromptTemplateService();

// Basic AI Chat Endpoint
router.post('/chat', [
  body('prompt').notEmpty().withMessage('Prompt is required'),
  body('systemPrompt').optional().isString(),
  body('temperature').optional().isFloat({ min: 0, max: 2 }),
  body('maxTokens').optional().isInt({ min: 1, max: 4000 }),
  body('model').optional().isString(),
  validateRequest
], async (req, res) => {
  try {
    const { prompt, systemPrompt, temperature, maxTokens, model } = req.body;

    const response = await aiService.generateResponse({
      prompt,
      systemPrompt,
      temperature,
      maxTokens,
      model
    });

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('AI chat request failed', { error: error instanceof Error ? error.message : error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Agent Communication Endpoints
router.post('/agents/:agentId/message', [
  param('agentId').isUUID().withMessage('Valid agent ID required'),
  body('content').notEmpty().withMessage('Message content is required'),
  body('context.taskId').optional().isUUID(),
  body('context.previousMessages').optional().isArray(),
  validateRequest
], async (req, res) => {
  try {
    const { agentId } = req.params;
    const { content, context } = req.body;

    const aiMessage = {
      agentId,
      content,
      context: {
        taskId: context?.taskId,
        previousMessages: context?.previousMessages || []
      }
    };

    const response = await aiAgentService.sendAIMessage(aiMessage);

    res.json({
      success: true,
      data: {
        response,
        agentId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Agent message request failed', {
      agentId: req.params.agentId,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate Agent Introduction
router.get('/agents/:agentId/introduction', [
  param('agentId').isUUID().withMessage('Valid agent ID required'),
  query('taskId').optional().isUUID(),
  query('teamName').optional().isString(),
  validateRequest
], async (req, res) => {
  try {
    const { agentId } = req.params;
    const { taskId, teamName } = req.query;

    const context = {
      taskId: taskId as string,
      teamName: teamName as string
    };

    const introduction = await aiAgentService.generateAgentIntroduction(agentId, context);

    res.json({
      success: true,
      data: {
        introduction,
        agentId,
        context,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Agent introduction request failed', {
      agentId: req.params.agentId,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Request Agent Collaboration
router.post('/agents/:agentId/collaboration', [
  param('agentId').isUUID().withMessage('Valid agent ID required'),
  body('targetAgentId').isUUID().withMessage('Target agent ID required'),
  body('taskDescription').notEmpty().withMessage('Task description required'),
  body('requiredCapability').notEmpty().withMessage('Required capability required'),
  body('taskDetails').notEmpty().withMessage('Task details required'),
  validateRequest
], async (req, res) => {
  try {
    const { agentId } = req.params;
    const { targetAgentId, taskDescription, requiredCapability, taskDetails } = req.body;

    const request = await aiAgentService.requestAgentCollaboration(
      agentId,
      targetAgentId,
      taskDescription,
      requiredCapability,
      taskDetails
    );

    res.json({
      success: true,
      data: {
        request,
        requesterId: agentId,
        targetAgentId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Agent collaboration request failed', {
      agentId: req.params.agentId,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Task Analysis with AI
router.post('/tasks/:taskId/analyze', [
  param('taskId').isUUID().withMessage('Valid task ID required'),
  validateRequest
], async (req, res) => {
  try {
    const { taskId } = req.params;

    const analysis = await aiAgentService.analyzeTaskWithAI(taskId);

    res.json({
      success: true,
      data: {
        analysis,
        taskId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Task analysis request failed', {
      taskId: req.params.taskId,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Suggest Agent for Task
router.get('/tasks/:taskId/suggest-agent', [
  param('taskId').isUUID().withMessage('Valid task ID required'),
  validateRequest
], async (req, res) => {
  try {
    const { taskId } = req.params;

    const suggestion = await aiAgentService.suggestAgentForTask(taskId);

    res.json({
      success: true,
      data: suggestion,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Agent suggestion request failed', {
      taskId: req.params.taskId,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Prompt Template Management
router.get('/templates', async (req, res) => {
  try {
    const templates = promptService.getAllTemplates();
    res.json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    logger.error('Template list request failed', { error: error instanceof Error ? error.message : error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/templates/:category', [
  param('category').isIn(['agent', 'task', 'communication', 'analysis']).withMessage('Invalid template category'),
  validateRequest
], async (req, res) => {
  try {
    const { category } = req.params;
    const templates = promptService.getTemplatesByCategory(category as any);
    res.json({
      success: true,
      data: templates,
      category,
      count: templates.length
    });
  } catch (error) {
    logger.error('Template category request failed', {
      category: req.params.category,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/templates/render', [
  body('templateId').notEmpty().withMessage('Template ID required'),
  body('variables').isObject().withMessage('Variables must be an object'),
  validateRequest
], async (req, res) => {
  try {
    const { templateId, variables } = req.body;

    const rendered = promptService.renderTemplate(templateId, variables);

    res.json({
      success: true,
      data: {
        rendered,
        templateId,
        variables,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Template render request failed', {
      templateId: req.body.templateId,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// AI Service Health Check
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await aiService.healthCheck();
    const stats = await aiAgentService.getAIServiceStats();

    res.json({
      success: true,
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        stats
      }
    });
  } catch (error) {
    logger.error('AI health check failed', { error: error instanceof Error ? error.message : error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// AI Usage Statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await aiService.getUsageStats();
    const agentStats = await aiAgentService.getAIServiceStats();

    res.json({
      success: true,
      data: {
        aiService: stats,
        agentService: agentStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('AI stats request failed', { error: error instanceof Error ? error.message : error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Agent Conversation History
router.get('/agents/:agentId/conversation', [
  param('agentId').isUUID().withMessage('Valid agent ID required'),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  validateRequest
], async (req, res) => {
  try {
    const { agentId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const history = await aiAgentService.getAgentConversationHistory(agentId, limit);

    res.json({
      success: true,
      data: {
        history,
        agentId,
        limit,
        count: history.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Agent conversation history request failed', {
      agentId: req.params.agentId,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;