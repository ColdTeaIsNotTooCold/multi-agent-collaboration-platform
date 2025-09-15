import { logger } from '../utils/logger';

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: 'agent' | 'task' | 'communication' | 'analysis';
  createdAt: Date;
  updatedAt: Date;
}

export class PromptTemplateService {
  private templates: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates(): void {
    // Agent Communication Templates
    this.addTemplate({
      id: 'agent-introduction',
      name: 'Agent Introduction',
      description: 'Template for agent self-introduction',
      category: 'agent',
      template: `Hello! I'm {agentName}, an AI agent with expertise in {capabilities}. I'm here to help you with {taskContext}. How can I assist you today?`,
      variables: ['agentName', 'capabilities', 'taskContext']
    });

    this.addTemplate({
      id: 'agent-collaboration-request',
      name: 'Agent Collaboration Request',
      description: 'Template for requesting collaboration between agents',
      category: 'communication',
      template: `Hi {targetAgent}, I'm working on {taskDescription} and could use your expertise in {requiredCapability}. Would you be available to collaborate? The task involves {taskDetails}.`,
      variables: ['targetAgent', 'taskDescription', 'requiredCapability', 'taskDetails']
    });

    this.addTemplate({
      id: 'agent-status-update',
      name: 'Agent Status Update',
      description: 'Template for providing status updates',
      category: 'communication',
      template: `Status update for {taskName}: {progressDescription}. Current status: {currentStatus}. Next steps: {nextSteps}.`,
      variables: ['taskName', 'progressDescription', 'currentStatus', 'nextSteps']
    });

    // Task Analysis Templates
    this.addTemplate({
      id: 'task-analysis',
      name: 'Task Analysis',
      description: 'Template for analyzing task requirements and complexity',
      category: 'analysis',
      template: `Analyze the following task:

Title: {taskTitle}
Description: {taskDescription}
Priority: {taskPriority}

Please provide:
1. Task Summary: {summary}
2. Key Requirements: {requirements}
3. Estimated Complexity: {complexity}
4. Required Skills: {skills}
5. Potential Challenges: {challenges}
6. Recommended Approach: {approach}`,
      variables: ['taskTitle', 'taskDescription', 'taskPriority', 'summary', 'requirements', 'complexity', 'skills', 'challenges', 'approach']
    });

    this.addTemplate({
      id: 'task-breakdown',
      name: 'Task Breakdown',
      description: 'Template for breaking down complex tasks into subtasks',
      category: 'analysis',
      template: `Break down the following task into manageable subtasks:

Main Task: {taskTitle}
Description: {taskDescription}

Please provide a structured breakdown with:
1. Subtask 1: {subtask1}
   - Estimated time: {time1}
   - Dependencies: {deps1}
   - Required skills: {skills1}

[Continue with additional subtasks as needed]

2. Overall Timeline: {timeline}
3. Critical Path: {criticalPath}`,
      variables: ['taskTitle', 'taskDescription', 'subtask1', 'time1', 'deps1', 'skills1', 'timeline', 'criticalPath']
    });

    // Decision Support Templates
    this.addTemplate({
      id: 'agent-recommendation',
      name: 'Agent Recommendation',
      description: 'Template for recommending agents for task assignment',
      category: 'analysis',
      template: `Based on the task requirements and available agents, recommend the best agent:

Task: {taskDescription}
Required Skills: {requiredSkills}
Available Agents: {agentsList}

Recommendation:
- Agent: {recommendedAgent}
- Reason: {reasoning}
- Confidence: {confidenceLevel}
- Alternative: {alternativeAgent}
- Estimated Success Rate: {successRate}`,
      variables: ['taskDescription', 'requiredSkills', 'agentsList', 'recommendedAgent', 'reasoning', 'confidenceLevel', 'alternativeAgent', 'successRate']
    });

    // Communication Templates
    this.addTemplate({
      id: 'escalation-request',
      name: 'Escalation Request',
      description: 'Template for escalating issues to higher-level agents',
      category: 'communication',
      template: `Issue Escalation Request:
- Task: {taskName}
- Current Agent: {currentAgent}
- Issue Description: {issueDescription}
- Impact: {impactLevel}
- Attempts Made: {attemptsMade}
- Required Assistance: {assistanceNeeded}
- Urgency: {urgencyLevel}`,
      variables: ['taskName', 'currentAgent', 'issueDescription', 'impactLevel', 'attemptsMade', 'assistanceNeeded', 'urgencyLevel']
    });

    this.addTemplate({
      id: 'completion-report',
      name: 'Task Completion Report',
      description: 'Template for reporting task completion',
      category: 'communication',
      template: `Task Completion Report:

Task: {taskName}
Assigned to: {agentName}
Started: {startTime}
Completed: {completionTime}
Duration: {duration}

Results:
- {result1}
- {result2}
- {result3}

Challenges Overcome: {challenges}
Lessons Learned: {lessonsLearned}
Recommendations: {recommendations}`,
      variables: ['taskName', 'agentName', 'startTime', 'completionTime', 'duration', 'result1', 'result2', 'result3', 'challenges', 'lessonsLearned', 'recommendations']
    });
  }

  private addTemplate(template: Omit<PromptTemplate, 'createdAt' | 'updatedAt'>): void {
    const fullTemplate: PromptTemplate = {
      ...template,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.templates.set(template.id, fullTemplate);
    logger.info('Prompt template added', { id: template.id, name: template.name });
  }

  renderTemplate(templateId: string, variables: Record<string, string>): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Validate required variables
    const missingVariables = template.variables.filter(varName => !variables[varName]);
    if (missingVariables.length > 0) {
      throw new Error(`Missing required variables: ${missingVariables.join(', ')}`);
    }

    let rendered = template.template;

    // Replace variables
    template.variables.forEach(variable => {
      const value = variables[variable] || '';
      rendered = rendered.replace(new RegExp(`{${variable}}`, 'g'), value);
    });

    return rendered;
  }

  getTemplate(templateId: string): PromptTemplate | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: PromptTemplate['category']): PromptTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.category === category);
  }

  addCustomTemplate(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): PromptTemplate {
    const id = this.generateTemplateId(template.name);
    const fullTemplate: PromptTemplate = {
      ...template,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.templates.set(id, fullTemplate);
    logger.info('Custom prompt template added', { id, name: template.name });

    return fullTemplate;
  }

  updateTemplate(templateId: string, updates: Partial<Omit<PromptTemplate, 'id' | 'createdAt'>>): PromptTemplate | null {
    const template = this.templates.get(templateId);
    if (!template) {
      return null;
    }

    const updatedTemplate: PromptTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date()
    };

    this.templates.set(templateId, updatedTemplate);
    logger.info('Prompt template updated', { id: templateId });

    return updatedTemplate;
  }

  deleteTemplate(templateId: string): boolean {
    const deleted = this.templates.delete(templateId);
    if (deleted) {
      logger.info('Prompt template deleted', { id: templateId });
    }
    return deleted;
  }

  private generateTemplateId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  validateTemplate(template: string, variables: string[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for malformed variable placeholders
    const variablePattern = /\{([^}]+)\}/g;
    const matches = template.match(variablePattern);

    if (matches) {
      const foundVariables = matches.map(match => match.slice(1, -1));

      // Check for undefined variables
      foundVariables.forEach(variable => {
        if (!variables.includes(variable)) {
          errors.push(`Undefined variable: ${variable}`);
        }
      });

      // Check for missing variables
      variables.forEach(variable => {
        if (!foundVariables.includes(variable)) {
          errors.push(`Variable not used in template: ${variable}`);
        }
      });
    } else {
      // No variables found in template
      if (variables.length > 0) {
        errors.push('Template contains no variable placeholders but variables are defined');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}