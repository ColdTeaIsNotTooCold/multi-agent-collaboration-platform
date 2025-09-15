import { logger } from '../utils/logger';
import { config } from '../config';

export interface CostTrackingEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  agentId?: string;
  taskId?: string;
  requestType: 'chat' | 'agent_communication' | 'task_analysis' | 'agent_suggestion' | 'other';
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  metadata: Record<string, any>;
}

export interface CostSummary {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  modelBreakdown: Record<string, {
    cost: number;
    tokens: number;
    requests: number;
  }>;
  typeBreakdown: Record<string, {
    cost: number;
    tokens: number;
    requests: number;
  }>;
  dailyBreakdown: Record<string, {
    cost: number;
    tokens: number;
    requests: number;
  }>;
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface BudgetAlert {
  id: string;
  timestamp: Date;
  userId?: string;
  budgetType: 'daily' | 'monthly' | 'project';
  budgetLimit: number;
  currentSpent: number;
  alertType: 'warning' | 'critical';
  message: string;
}

export class AICostTrackerService {
  private costEvents: CostTrackingEvent[] = [];
  private budgetAlerts: BudgetAlert[] = [];
  private budgets: Map<string, { limit: number; spent: number; period: 'daily' | 'monthly' | 'project' }> = new Map();

  constructor() {
    // Initialize default budgets
    this.budgets.set('default_daily', { limit: 10, spent: 0, period: 'daily' });
    this.budgets.set('default_monthly', { limit: 200, spent: 0, period: 'monthly' });

    // Start cleanup and reset processes
    this.startDailyReset();
    this.startMonthlyReset();
    this.startEventCleanup();
  }

  trackCost(event: Omit<CostTrackingEvent, 'id' | 'timestamp'>): void {
    const costEvent: CostTrackingEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date()
    };

    this.costEvents.push(costEvent);

    // Update budget tracking
    this.updateBudgets(costEvent.cost, costEvent.userId);

    // Check for budget alerts
    this.checkBudgetAlerts(costEvent);

    // Log significant costs
    if (costEvent.cost > 1) {
      logger.warn('High cost AI request', {
        cost: costEvent.cost,
        tokens: costEvent.usage.totalTokens,
        type: costEvent.requestType,
        userId: costEvent.userId
      });
    }

    logger.info('Cost tracked', {
      eventId: costEvent.id,
      cost: costEvent.cost.toFixed(4),
      tokens: costEvent.usage.totalTokens,
      type: costEvent.requestType
    });
  }

  async getCostSummary(
    startDate?: Date,
    endDate?: Date,
    userId?: string,
    agentId?: string,
    taskId?: string
  ): Promise<CostSummary> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days
    const end = endDate || new Date();

    const filteredEvents = this.costEvents.filter(event => {
      const eventTime = event.timestamp.getTime();
      const inTimeRange = eventTime >= start.getTime() && eventTime <= end.getTime();
      const matchesUser = !userId || event.userId === userId;
      const matchesAgent = !agentId || event.agentId === agentId;
      const matchesTask = !taskId || event.taskId === taskId;

      return inTimeRange && matchesUser && matchesAgent && matchesTask;
    });

    const summary: CostSummary = {
      totalCost: 0,
      totalTokens: 0,
      totalRequests: 0,
      modelBreakdown: {},
      typeBreakdown: {},
      dailyBreakdown: {},
      timeRange: { start, end }
    };

    filteredEvents.forEach(event => {
      summary.totalCost += event.cost;
      summary.totalTokens += event.usage.totalTokens;
      summary.totalRequests++;

      // Model breakdown
      if (!summary.modelBreakdown[event.model]) {
        summary.modelBreakdown[event.model] = { cost: 0, tokens: 0, requests: 0 };
      }
      summary.modelBreakdown[event.model].cost += event.cost;
      summary.modelBreakdown[event.model].tokens += event.usage.totalTokens;
      summary.modelBreakdown[event.model].requests++;

      // Type breakdown
      if (!summary.typeBreakdown[event.requestType]) {
        summary.typeBreakdown[event.requestType] = { cost: 0, tokens: 0, requests: 0 };
      }
      summary.typeBreakdown[event.requestType].cost += event.cost;
      summary.typeBreakdown[event.requestType].tokens += event.usage.totalTokens;
      summary.typeBreakdown[event.requestType].requests++;

      // Daily breakdown
      const dateKey = event.timestamp.toISOString().split('T')[0];
      if (!summary.dailyBreakdown[dateKey]) {
        summary.dailyBreakdown[dateKey] = { cost: 0, tokens: 0, requests: 0 };
      }
      summary.dailyBreakdown[dateKey].cost += event.cost;
      summary.dailyBreakdown[dateKey].tokens += event.usage.totalTokens;
      summary.dailyBreakdown[dateKey].requests++;
    });

    return summary;
  }

  async getCostForecast(days: number = 7): Promise<{
    projectedCost: number;
    projectedTokens: number;
    confidence: 'low' | 'medium' | 'high';
    factors: {
      dailyAverage: number;
      trend: 'increasing' | 'stable' | 'decreasing';
      seasonality: 'none' | 'detected';
    };
  }> {
    const last7Days = await this.getCostSummary(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date()
    );

    const dailyAverage = last7Days.totalCost / 7;
    const projectedCost = dailyAverage * days;
    const projectedTokens = (last7Days.totalTokens / 7) * days;

    // Simple trend analysis
    const costs = Object.values(last7Days.dailyBreakdown).map(d => d.cost);
    const trend = this.analyzeTrend(costs);

    return {
      projectedCost,
      projectedTokens,
      confidence: costs.length >= 5 ? 'high' : costs.length >= 3 ? 'medium' : 'low',
      factors: {
        dailyAverage,
        trend,
        seasonality: 'none'
      }
    };
  }

  setBudget(
    budgetKey: string,
    limit: number,
    period: 'daily' | 'monthly' | 'project',
    userId?: string
  ): void {
    const key = userId ? `${userId}_${budgetKey}` : budgetKey;
    this.budgets.set(key, { limit, spent: 0, period });
    logger.info('Budget set', { key, limit, period, userId });
  }

  getBudgetStatus(budgetKey: string, userId?: string): {
    limit: number;
    spent: number;
    remaining: number;
    percentage: number;
    period: 'daily' | 'monthly' | 'project';
    status: 'healthy' | 'warning' | 'critical';
  } | null {
    const key = userId ? `${userId}_${budgetKey}` : budgetKey;
    const budget = this.budgets.get(key);

    if (!budget) {
      return null;
    }

    const percentage = (budget.spent / budget.limit) * 100;
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (percentage >= 90) {
      status = 'critical';
    } else if (percentage >= 70) {
      status = 'warning';
    }

    return {
      limit: budget.limit,
      spent: budget.spent,
      remaining: budget.limit - budget.spent,
      percentage,
      period: budget.period,
      status
    };
  }

  getBudgetAlerts(userId?: string): BudgetAlert[] {
    if (userId) {
      return this.budgetAlerts.filter(alert => alert.userId === userId);
    }
    return this.budgetAlerts;
  }

  clearBudgetAlerts(userId?: string): void {
    if (userId) {
      this.budgetAlerts = this.budgetAlerts.filter(alert => alert.userId !== userId);
    } else {
      this.budgetAlerts = [];
    }
  }

  private updateBudgets(cost: number, userId?: string): void {
    this.budgets.forEach((budget, key) => {
      const keyParts = key.split('_');
      const isUserSpecific = keyParts.length > 1;
      const budgetUserId = isUserSpecific ? keyParts[0] : null;

      // Update if budget matches user or is global
      if (!budgetUserId || budgetUserId === userId) {
        budget.spent += cost;
      }
    });
  }

  private checkBudgetAlerts(event: CostTrackingEvent): void {
    this.budgets.forEach((budget, key) => {
      const keyParts = key.split('_');
      const isUserSpecific = keyParts.length > 1;
      const budgetUserId = isUserSpecific ? keyParts[0] : null;

      // Check if budget applies to this event
      if (!budgetUserId || budgetUserId === event.userId) {
        const percentage = (budget.spent / budget.limit) * 100;

        if (percentage >= 90 && percentage < 91) {
          this.createBudgetAlert({
            userId: event.userId,
            budgetType: budget.period,
            budgetLimit: budget.limit,
            currentSpent: budget.spent,
            alertType: 'critical',
            message: `Critical: ${percentage.toFixed(1)}% of ${budget.period} budget used`
          });
        } else if (percentage >= 70 && percentage < 71) {
          this.createBudgetAlert({
            userId: event.userId,
            budgetType: budget.period,
            budgetLimit: budget.limit,
            currentSpent: budget.spent,
            alertType: 'warning',
            message: `Warning: ${percentage.toFixed(1)}% of ${budget.period} budget used`
          });
        }
      }
    });
  }

  private createBudgetAlert(alert: Omit<BudgetAlert, 'id' | 'timestamp'>): void {
    const budgetAlert: BudgetAlert = {
      ...alert,
      id: this.generateEventId(),
      timestamp: new Date()
    };

    this.budgetAlerts.push(budgetAlert);
    logger.warn('Budget alert created', budgetAlert);
  }

  private analyzeTrend(costs: number[]): 'increasing' | 'stable' | 'decreasing' {
    if (costs.length < 2) return 'stable';

    const recent = costs.slice(-3);
    const earlier = costs.slice(-6, -3);

    if (recent.length === 0 || earlier.length === 0) return 'stable';

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

    const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;

    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  private startDailyReset(): void {
    // Reset daily budgets at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.resetDailyBudgets();
      // Set up daily reset
      setInterval(() => this.resetDailyBudgets(), 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }

  private startMonthlyReset(): void {
    // Reset monthly budgets on the first day of each month
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    nextMonth.setHours(0, 0, 0, 0);

    const msUntilMonth = nextMonth.getTime() - now.getTime();

    setTimeout(() => {
      this.resetMonthlyBudgets();
      // Set up monthly reset
      setInterval(() => this.resetMonthlyBudgets(), 30 * 24 * 60 * 60 * 1000);
    }, msUntilMonth);
  }

  private startEventCleanup(): void {
    // Clean up old cost events (keep last 90 days)
    setInterval(() => {
      const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      this.costEvents = this.costEvents.filter(event => event.timestamp > cutoff);

      // Clean up old alerts (keep last 30 days)
      const alertCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      this.budgetAlerts = this.budgetAlerts.filter(alert => alert.timestamp > alertCutoff);
    }, 24 * 60 * 60 * 1000); // Run daily
  }

  private resetDailyBudgets(): void {
    this.budgets.forEach((budget, key) => {
      if (budget.period === 'daily') {
        budget.spent = 0;
        logger.info('Daily budget reset', { key });
      }
    });
  }

  private resetMonthlyBudgets(): void {
    this.budgets.forEach((budget, key) => {
      if (budget.period === 'monthly') {
        budget.spent = 0;
        logger.info('Monthly budget reset', { key });
      }
    });
  }

  private generateEventId(): string {
    return `cost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Emergency stop function
  emergencyStop(): void {
    logger.error('Emergency stop triggered - AI service disabled');
    // This would typically disable AI functionality across the platform
    // For now, we'll just log and set all budgets to 0
    this.budgets.forEach((budget, key) => {
      budget.limit = 0;
    });
  }
}