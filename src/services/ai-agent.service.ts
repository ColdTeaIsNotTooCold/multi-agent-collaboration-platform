import { AIService, AIAgentMessage } from './ai.service';
import { PromptTemplateService } from './prompt-templates.service';
import { AgentService } from './agent.service';
import { TaskService } from './task.service';
import { logger } from '../utils/logger';

export interface AgentMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'action' | 'request' | 'response';
  priority: 'low' | 'medium' | 'high';
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface AIEnhancedAgent {
  id: string;
  name: string;
  type: 'ai' | 'human' | 'bot';
  capabilities: string[];
  status: 'active' | 'inactive' | 'busy';
  personality?: string;
  expertise: string[];
  communicationStyle: 'formal' | 'casual' | 'technical' | 'supportive';
  metadata: Record<string, any>;
  lastActiveAt: Date;
}

export class AIAgentService {
  private aiService: AIService;
  private promptService: PromptTemplateService;
  private agentService: AgentService;
  private taskService: TaskService;
  private messageQueue: Map<string, AgentMessage[]> = new Map();

  constructor() {
    this.aiService = new AIService();
    this.promptService = new PromptTemplateService();
    this.agentService = new AgentService();
    this.taskService = new TaskService();
  }

  async sendAIMessage(message: AIAgentMessage): Promise<string> {
    try {
      logger.info('Processing AI agent message', {
        agentId: message.agentId,
        hasTaskContext: !!message.context?.taskId,
        messageLength: message.content.length
      });

      // Generate AI response
      const aiResponse = await this.aiService.generateAgentResponse(message);

      // Store message in conversation history
      await this.storeMessage(message.agentId, message.content, 'user');

      // Store AI response
      await this.storeMessage(message.agentId, aiResponse.content, 'assistant');

      // Emit via WebSocket if available
      await this.emitMessageUpdate(message.agentId, aiResponse.content);

      return aiResponse.content;
    } catch (error) {
      logger.error('AI message processing failed', {
        agentId: message.agentId,
        error: error instanceof Error ? error.message : error
      });
      throw new Error(`Failed to process AI message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateAgentIntroduction(agentId: string, context?: { taskId?: string; teamName?: string }): Promise<string> {
    const agent = await this.agentService.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const template = this.promptService.getTemplate('agent-introduction');
    if (!template) {
      throw new Error('Agent introduction template not found');
    }

    const capabilities = agent.capabilities.join(', ');
    const taskContext = context?.taskId ? `working on task ${context.taskId}` : 'available to assist';

    const introduction = this.promptService.renderTemplate(template.id, {
      agentName: agent.name,
      capabilities,
      taskContext
    });

    return introduction;
  }

  async requestAgentCollaboration(
    requesterId: string,
    targetAgentId: string,
    taskDescription: string,
    requiredCapability: string,
    taskDetails: string
  ): Promise<string> {
    const template = this.promptService.getTemplate('agent-collaboration-request');
    if (!template) {
      throw new Error('Collaboration request template not found');
    }

    const targetAgent = await this.agentService.getAgent(targetAgentId);
    if (!targetAgent) {
      throw new Error(`Target agent not found: ${targetAgentId}`);
    }

    const request = this.promptService.renderTemplate(template.id, {
      targetAgent: targetAgent.name,
      taskDescription,
      requiredCapability,
      taskDetails
    });

    // Send the collaboration request as an AI message
    const aiMessage: AIAgentMessage = {
      agentId: targetAgentId,
      content: request,
      context: {
        taskId: undefined, // This would be populated if there's a specific task
        previousMessages: [
          {
            senderId: requesterId,
            content: request,
            timestamp: new Date()
          }
        ]
      }
    };

    return this.sendAIMessage(aiMessage);
  }

  async provideAgentStatusUpdate(
    agentId: string,
    taskName: string,
    progressDescription: string,
    currentStatus: string,
    nextSteps: string
  ): Promise<string> {
    const template = this.promptService.getTemplate('agent-status-update');
    if (!template) {
      throw new Error('Status update template not found');
    }

    const update = this.promptService.renderTemplate(template.id, {
      taskName,
      progressDescription,
      currentStatus,
      nextSteps
    });

    const aiMessage: AIAgentMessage = {
      agentId,
      content: update,
      context: {
        taskId: undefined, // This would be populated if there's a specific task
        previousMessages: []
      }
    };

    return this.sendAIMessage(aiMessage);
  }

  async analyzeTaskWithAI(taskId: string): Promise<any> {
    try {
      const task = await this.taskService.getTask(taskId);
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      const aiResponse = await this.aiService.analyzeTask(task.description, task.title);

      // Parse the AI response to extract structured information
      const analysis = this.parseTaskAnalysis(aiResponse.content);

      // Update task metadata with AI analysis
      await this.taskService.updateTask(taskId, {
        metadata: {
          ...task.metadata,
          aiAnalysis: analysis,
          aiAnalysisTimestamp: new Date().toISOString()
        }
      });

      return analysis;
    } catch (error) {
      logger.error('Task AI analysis failed', {
        taskId,
        error: error instanceof Error ? error.message : error
      });
      throw new Error(`Failed to analyze task with AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async suggestAgentForTask(taskId: string): Promise<any> {
    try {
      const task = await this.taskService.getTask(taskId);
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      // Get available agents
      const availableAgents = await this.agentService.getAgentsByStatus('active');

      // Get AI recommendation
      const aiResponse = await this.aiService.suggestTaskAssignment(task.description, availableAgents);

      // Parse the AI response
      const recommendation = this.parseAgentRecommendation(aiResponse.content);

      return {
        taskId,
        recommendation,
        aiResponse: aiResponse.content,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Agent suggestion failed', {
        taskId,
        error: error instanceof Error ? error.message : error
      });
      throw new Error(`Failed to suggest agent for task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleAgentMessageRouting(message: AgentMessage): Promise<void> {
    try {
      logger.info('Routing agent message', {
        from: message.senderId,
        to: message.receiverId,
        type: message.type,
        priority: message.priority
      });

      // Check if receiver is an AI agent
      const receiverAgent = await this.agentService.getAgent(message.receiverId);
      if (!receiverAgent) {
        throw new Error(`Receiver agent not found: ${message.receiverId}`);
      }

      if (receiverAgent.type === 'ai') {
        // Handle AI agent response
        await this.handleAIMessageResponse(message);
      } else {
        // Route to human/bot agent via WebSocket
        await this.emitMessageToAgent(message.receiverId, message);
      }

      // Store message in queue for the receiver
      this.queueMessage(message.receiverId, message);

    } catch (error) {
      logger.error('Message routing failed', {
        from: message.senderId,
        to: message.receiverId,
        error: error instanceof Error ? error.message : error
      });
      throw new Error(`Failed to route message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleAIMessageResponse(message: AgentMessage): Promise<void> {
    try {
      // Get previous messages for context
      const previousMessages = this.getMessageQueue(message.receiverId);

      const aiMessage: AIAgentMessage = {
        agentId: message.receiverId,
        content: message.content,
        context: {
          taskId: message.metadata.taskId,
          previousMessages: previousMessages.slice(-5).map(msg => ({
            senderId: msg.senderId,
            content: msg.content,
            timestamp: msg.timestamp
          }))
        }
      };

      // Generate AI response
      const aiResponse = await this.sendAIMessage(aiMessage);

      // Create response message
      const responseMessage: AgentMessage = {
        id: this.generateMessageId(),
        senderId: message.receiverId,
        receiverId: message.senderId,
        content: aiResponse,
        type: 'response',
        priority: message.priority,
        metadata: {
          ...message.metadata,
          responseTo: message.id
        },
        timestamp: new Date()
      };

      // Route response back to sender
      await this.handleAgentMessageRouting(responseMessage);

    } catch (error) {
      logger.error('AI message response handling failed', {
        agentId: message.receiverId,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  private parseTaskAnalysis(aiResponse: string): any {
    // This is a simple parser - in production, you might want more sophisticated parsing
    const analysis: any = {
      summary: '',
      requirements: [],
      complexity: 'medium',
      skills: [],
      challenges: [],
      approach: ''
    };

    const lines = aiResponse.split('\n');
    let currentSection = '';

    lines.forEach(line => {
      line = line.trim();
      if (line.startsWith('Task Summary:')) {
        currentSection = 'summary';
        analysis.summary = line.replace('Task Summary:', '').trim();
      } else if (line.startsWith('Key Requirements:')) {
        currentSection = 'requirements';
      } else if (line.startsWith('Estimated Complexity:')) {
        currentSection = 'complexity';
        analysis.complexity = line.replace('Estimated Complexity:', '').trim();
      } else if (line.startsWith('Required Skills:')) {
        currentSection = 'skills';
      } else if (line.startsWith('Potential Challenges:')) {
        currentSection = 'challenges';
      } else if (line.startsWith('Recommended Approach:')) {
        currentSection = 'approach';
        analysis.approach = line.replace('Recommended Approach:', '').trim();
      } else if (line.startsWith('-') && currentSection === 'requirements') {
        analysis.requirements.push(line.replace('-', '').trim());
      } else if (line.startsWith('-') && currentSection === 'skills') {
        analysis.skills.push(line.replace('-', '').trim());
      } else if (line.startsWith('-') && currentSection === 'challenges') {
        analysis.challenges.push(line.replace('-', '').trim());
      }
    });

    return analysis;
  }

  private parseAgentRecommendation(aiResponse: string): any {
    const recommendation: any = {
      agentId: '',
      agentName: '',
      reasoning: '',
      confidence: 'medium',
      alternative: '',
      successRate: '0%'
    };

    const lines = aiResponse.split('\n');
    lines.forEach(line => {
      line = line.trim();
      if (line.startsWith('- Agent:')) {
        const agentInfo = line.replace('- Agent:', '').trim();
        recommendation.agentName = agentInfo.split('(')[0].trim();
        recommendation.agentId = agentInfo.match(/\(([^)]+)\)/)?.[1] || '';
      } else if (line.startsWith('- Reason:')) {
        recommendation.reasoning = line.replace('- Reason:', '').trim();
      } else if (line.startsWith('- Confidence:')) {
        recommendation.confidence = line.replace('- Confidence:', '').trim();
      } else if (line.startsWith('- Alternative:')) {
        recommendation.alternative = line.replace('- Alternative:', '').trim();
      } else if (line.startsWith('- Estimated Success Rate:')) {
        recommendation.successRate = line.replace('- Estimated Success Rate:', '').trim();
      }
    });

    return recommendation;
  }

  private async storeMessage(agentId: string, content: string, role: string): Promise<void> {
    // This would typically store the message in a database
    // For now, we'll just log it
    logger.info('Message stored', { agentId, role, contentLength: content.length });
  }

  private async emitMessageUpdate(agentId: string, content: string): Promise<void> {
    // This would emit the message via WebSocket
    // For now, we'll just log it
    logger.info('Message update emitted', { agentId, contentLength: content.length });
  }

  private async emitMessageToAgent(agentId: string, message: AgentMessage): Promise<void> {
    // This would emit the message to the specific agent via WebSocket
    logger.info('Message sent to agent', { agentId, messageId: message.id, type: message.type });
  }

  private queueMessage(agentId: string, message: AgentMessage): void {
    if (!this.messageQueue.has(agentId)) {
      this.messageQueue.set(agentId, []);
    }
    this.messageQueue.get(agentId)!.push(message);
  }

  private getMessageQueue(agentId: string): AgentMessage[] {
    return this.messageQueue.get(agentId) || [];
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getAgentConversationHistory(agentId: string, limit: number = 50): Promise<AgentMessage[]> {
    const messages = this.getMessageQueue(agentId);
    return messages.slice(-limit);
  }

  async clearAgentMessageQueue(agentId: string): Promise<void> {
    this.messageQueue.delete(agentId);
    logger.info('Agent message queue cleared', { agentId });
  }

  async getAIServiceStats(): Promise<any> {
    return {
      messageQueueSize: this.messageQueue.size,
      totalMessagesQueued: Array.from(this.messageQueue.values()).reduce((sum, queue) => sum + queue.length, 0),
      aiServiceStats: await this.aiService.getUsageStats()
    };
  }
}