import OpenAI from 'openai';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  model: string;
}

export interface AIAgentMessage {
  agentId: string;
  content: string;
  context?: {
    taskId?: string;
    previousMessages?: Array<{
      senderId: string;
      content: string;
      timestamp: Date;
    }>;
  };
}

export class AIService {
  private openai: OpenAI;
  private requestCounts: Map<string, number> = new Map();
  private lastReset: Date = new Date();

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.ai.openai.apiKey,
      timeout: config.ai.openai.timeout
    });

    // Initialize rate limiting counters
    this.requestCounts.set('minute', 0);
    this.requestCounts.set('hour', 0);
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      this.checkRateLimits();

      logger.info('Generating AI response', {
        model: request.model || config.ai.openai.model,
        promptLength: request.prompt.length,
        maxTokens: request.maxTokens || config.ai.openai.maxTokens
      });

      const completion = await this.openai.chat.completions.create({
        model: request.model || config.ai.openai.model,
        messages: [
          {
            role: 'system',
            content: request.systemPrompt || 'You are a helpful AI assistant in a multi-agent collaboration platform.'
          },
          {
            role: 'user',
            content: request.prompt
          }
        ],
        temperature: request.temperature ?? config.ai.openai.temperature,
        max_tokens: request.maxTokens ?? config.ai.openai.maxTokens
      });

      const response = completion.choices[0]?.message?.content || '';
      const usage = completion.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      const cost = this.calculateCost(usage, request.model || config.ai.openai.model);

      logger.info('AI response generated', {
        tokensUsed: usage.total_tokens,
        cost: cost.toFixed(4),
        responseLength: response.length
      });

      return {
        content: response,
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens
        },
        cost,
        model: request.model || config.ai.openai.model
      };
    } catch (error) {
      logger.error('AI request failed', { error: error instanceof Error ? error.message : error });
      throw new Error(`AI service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateAgentResponse(message: AIAgentMessage): Promise<AIResponse> {
    const systemPrompt = this.buildAgentSystemPrompt(message);
    const userPrompt = this.buildAgentUserPrompt(message);

    return this.generateResponse({
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.3, // Lower temperature for more consistent agent behavior
      maxTokens: 1000
    });
  }

  async analyzeTask(taskDescription: string, taskTitle: string): Promise<AIResponse> {
    const systemPrompt = `You are a task analysis AI assistant. Analyze the following task and provide:
1. A brief summary of the task
2. Key requirements or deliverables
3. Estimated complexity (simple, medium, complex)
4. Suggested skills or capabilities needed
5. Potential challenges or considerations

Keep your response concise and structured.`;

    const prompt = `Task Title: ${taskTitle}\n\nTask Description: ${taskDescription}\n\nPlease analyze this task.`;

    return this.generateResponse({
      prompt,
      systemPrompt,
      temperature: 0.2,
      maxTokens: 800
    });
  }

  async suggestTaskAssignment(taskDescription: string, availableAgents: Array<{
    id: string;
    name: string;
    capabilities: string[];
    status: string;
  }>): Promise<AIResponse> {
    const systemPrompt = `You are a task assignment AI assistant. Based on the task description and available agents, recommend the best agent for this task.
Consider:
1. Agent capabilities and how they match task requirements
2. Agent current status (prefer 'active' agents)
3. Task complexity and agent expertise

Respond with:
1. Recommended agent ID and name
2. Reasoning for the recommendation
3. Confidence level (high, medium, low)
4. Alternative recommendations if available`;

    const agentsList = availableAgents.map(agent =>
      `- ${agent.name} (${agent.id}): ${agent.capabilities.join(', ')} - Status: ${agent.status}`
    ).join('\n');

    const prompt = `Task Description: ${taskDescription}\n\nAvailable Agents:\n${agentsList}\n\nRecommend the best agent for this task.`;

    return this.generateResponse({
      prompt,
      systemPrompt,
      temperature: 0.1,
      maxTokens: 600
    });
  }

  private buildAgentSystemPrompt(message: AIAgentMessage): string {
    return `You are an AI agent in a multi-agent collaboration platform. Your agent ID is ${message.agentId}.

Your role is to:
1. Communicate professionally and helpfully with other agents
2. Provide insightful responses based on the task context
3. Collaborate effectively to achieve common goals
4. Ask clarifying questions when needed
5. Share relevant information and expertise

${message.context?.taskId ? `You are working on task ID: ${message.context.taskId}` : ''}
Keep your responses focused, professional, and actionable.`;
  }

  private buildAgentUserPrompt(message: AIAgentMessage): string {
    let prompt = message.content;

    if (message.context?.previousMessages && message.context.previousMessages.length > 0) {
      prompt += '\n\nPrevious conversation:\n';
      message.context.previousMessages.forEach(msg => {
        prompt += `${msg.senderId}: ${msg.content}\n`;
      });
    }

    return prompt;
  }

  private checkRateLimits(): void {
    const now = new Date();
    const minuteDiff = Math.floor((now.getTime() - this.lastReset.getTime()) / 60000);

    // Reset counters if a minute has passed
    if (minuteDiff >= 1) {
      this.requestCounts.set('minute', 0);
      this.lastReset = now;
    }

    const minuteCount = this.requestCounts.get('minute') || 0;
    const hourCount = this.requestCounts.get('hour') || 0;

    if (minuteCount >= config.ai.rateLimit.requestsPerMinute) {
      throw new Error('Rate limit exceeded: Too many requests per minute');
    }

    if (hourCount >= config.ai.rateLimit.requestsPerHour) {
      throw new Error('Rate limit exceeded: Too many requests per hour');
    }

    // Update counters
    this.requestCounts.set('minute', minuteCount + 1);
    this.requestCounts.set('hour', hourCount + 1);
  }

  private calculateCost(usage: { prompt_tokens: number; completion_tokens: number }, model: string): number {
    const rates = config.ai.cost.gpt4;
    const inputCost = (usage.prompt_tokens / 1000) * rates.input;
    const outputCost = (usage.completion_tokens / 1000) * rates.output;
    return inputCost + outputCost;
  }

  async getUsageStats(): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    rateLimitStatus: {
      minuteRemaining: number;
      hourRemaining: number;
    };
  }> {
    const minuteCount = this.requestCounts.get('minute') || 0;
    const hourCount = this.requestCounts.get('hour') || 0;

    return {
      totalRequests: minuteCount + hourCount,
      totalTokens: 0, // This would need to be tracked separately
      totalCost: 0, // This would need to be tracked separately
      rateLimitStatus: {
        minuteRemaining: Math.max(0, config.ai.rateLimit.requestsPerMinute - minuteCount),
        hourRemaining: Math.max(0, config.ai.rateLimit.requestsPerHour - hourCount)
      }
    };
  }

  // Health check for AI service
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.generateResponse({
        prompt: 'test',
        systemPrompt: 'Respond with "OK" only.',
        maxTokens: 5
      });
      return response.content.trim() === 'OK';
    } catch (error) {
      logger.error('AI service health check failed', { error: error instanceof Error ? error.message : error });
      return false;
    }
  }
}