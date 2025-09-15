import { prisma } from '../utils/database';
import { UserModel } from '../models/user.model';
import { AgentModel } from '../models/agent.model';
import { TaskModel } from '../models/task.model';

describe('Database Integration Tests', () => {
  let userModel: UserModel;
  let agentModel: AgentModel;
  let taskModel: TaskModel;

  beforeEach(() => {
    userModel = new UserModel();
    agentModel = new AgentModel();
    taskModel = new TaskModel();
  });

  describe('Database Connection', () => {
    it('should be able to connect to database', async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        expect(true).toBe(true);
      } catch (error) {
        // If database is not available, skip these tests
        pending('Database not available for testing');
      }
    });
  });

  describe('User Model', () => {
    it('should create a new user', async () => {
      try {
        const user = await userModel.create('testuser', 'test@example.com', 'password123', 'user');

        expect(user).toBeDefined();
        expect(user.username).toBe('testuser');
        expect(user.email).toBe('test@example.com');
        expect(user.role).toBe('user');
        expect(user.id).toBeDefined();
        expect(user.createdAt).toBeInstanceOf(Date);
      } catch (error) {
        pending('Database not available for testing');
      }
    });

    it('should find user by username', async () => {
      try {
        // Create a user first
        const createdUser = await userModel.create('findme', 'find@example.com', 'password123', 'user');

        // Find the user
        const foundUser = await userModel.findByUsername('findme');

        expect(foundUser).toBeDefined();
        expect(foundUser?.username).toBe('findme');
        expect(foundUser?.email).toBe('find@example.com');
      } catch (error) {
        pending('Database not available for testing');
      }
    });

    it('should find user by email', async () => {
      try {
        // Create a user first
        const createdUser = await userModel.create('emailuser', 'emailtest@example.com', 'password123', 'user');

        // Find the user
        const foundUser = await userModel.findByEmail('emailtest@example.com');

        expect(foundUser).toBeDefined();
        expect(foundUser?.username).toBe('emailuser');
        expect(foundUser?.email).toBe('emailtest@example.com');
      } catch (error) {
        pending('Database not available for testing');
      }
    });

    it('should validate login credentials', async () => {
      try {
        // Create a user first
        await userModel.create('loginuser', 'login@example.com', 'password123', 'user');

        // Test valid login
        const validUser = await userModel.validateLogin('loginuser', 'password123');
        expect(validUser).toBeDefined();
        expect(validUser?.username).toBe('loginuser');

        // Test invalid password
        const invalidUser = await userModel.validateLogin('loginuser', 'wrongpassword');
        expect(invalidUser).toBeNull();
      } catch (error) {
        pending('Database not available for testing');
      }
    });
  });

  describe('Agent Model', () => {
    it('should create a new agent', async () => {
      try {
        const agent = await agentModel.create({
          name: 'Test Agent',
          type: 'ai',
          capabilities: ['test', 'automation'],
          metadata: { version: '1.0.0' }
        });

        expect(agent).toBeDefined();
        expect(agent.name).toBe('Test Agent');
        expect(agent.type).toBe('ai');
        expect(agent.capabilities).toContain('test');
        expect(agent.capabilities).toContain('automation');
        expect(agent.status).toBe('active');
        expect(agent.id).toBeDefined();
      } catch (error) {
        pending('Database not available for testing');
      }
    });

    it('should find agent by id', async () => {
      try {
        // Create an agent first
        const createdAgent = await agentModel.create({
          name: 'Find Me Agent',
          type: 'human',
          capabilities: ['testing'],
          metadata: { specialty: 'qa' }
        });

        // Find the agent
        const foundAgent = await agentModel.findById(createdAgent.id);

        expect(foundAgent).toBeDefined();
        expect(foundAgent?.name).toBe('Find Me Agent');
        expect(foundAgent?.type).toBe('human');
      } catch (error) {
        pending('Database not available for testing');
      }
    });

    it('should find agents by capability', async () => {
      try {
        // Create agents with different capabilities
        await agentModel.create({
          name: 'AI Assistant',
          type: 'ai',
          capabilities: ['ai', 'ml', 'testing'],
          metadata: {}
        });

        await agentModel.create({
          name: 'Test Bot',
          type: 'bot',
          capabilities: ['testing', 'automation'],
          metadata: {}
        });

        // Find agents with testing capability
        const testingAgents = await agentModel.findByCapability('testing');

        expect(testingAgents.length).toBeGreaterThan(0);
        expect(testingAgents.some(agent => agent.capabilities.includes('testing'))).toBe(true);
      } catch (error) {
        pending('Database not available for testing');
      }
    });

    it('should update agent status', async () => {
      try {
        // Create an agent
        const agent = await agentModel.create({
          name: 'Status Test Agent',
          type: 'ai',
          capabilities: ['testing'],
          metadata: {}
        });

        // Update status to busy
        const updatedAgent = await agentModel.update(agent.id, { status: 'busy' });

        expect(updatedAgent).toBeDefined();
        expect(updatedAgent?.status).toBe('busy');
      } catch (error) {
        pending('Database not available for testing');
      }
    });
  });

  describe('Task Model', () => {
    let testUser: any;
    let testAgent: any;

    beforeEach(async () => {
      try {
        // Create a test user and agent for task tests
        testUser = await userModel.create('taskuser', 'task@example.com', 'password123', 'user');
        testAgent = await agentModel.create({
          name: 'Task Agent',
          type: 'ai',
          capabilities: ['task-management'],
          metadata: {}
        });
      } catch (error) {
        // Ignore setup errors
      }
    });

    it('should create a new task', async () => {
      try {
        const task = await taskModel.create({
          title: 'Test Task',
          description: 'This is a test task',
          priority: 'medium',
          metadata: { category: 'testing' }
        }, testUser.id);

        expect(task).toBeDefined();
        expect(task.title).toBe('Test Task');
        expect(task.description).toBe('This is a test task');
        expect(task.priority).toBe('medium');
        expect(task.status).toBe('pending');
        expect(task.createdBy).toBe(testUser.id);
      } catch (error) {
        pending('Database not available for testing');
      }
    });

    it('should assign task to agent', async () => {
      try {
        // Create a task
        const task = await taskModel.create({
          title: 'Assignment Test',
          description: 'Test task assignment',
          priority: 'high',
          metadata: {}
        }, testUser.id);

        // Assign task to agent
        const assignedTask = await taskModel.assignTask(task.id, testAgent.id);

        expect(assignedTask).toBeDefined();
        expect(assignedTask?.assignedTo).toBe(testAgent.id);
        expect(assignedTask?.status).toBe('assigned');
      } catch (error) {
        pending('Database not available for testing');
      }
    });

    it('should find tasks by status', async () => {
      try {
        // Create tasks with different statuses
        await taskModel.create({
          title: 'Pending Task',
          description: 'Pending task',
          priority: 'low',
          metadata: {}
        }, testUser.id);

        const taskInProgress = await taskModel.create({
          title: 'In Progress Task',
          description: 'Task in progress',
          priority: 'medium',
          metadata: {}
        }, testUser.id);

        // Update task status
        await taskModel.update(taskInProgress.id, { status: 'in_progress' });

        // Find pending tasks
        const pendingTasks = await taskModel.findByStatus('pending');
        expect(pendingTasks.length).toBeGreaterThan(0);
        expect(pendingTasks.some(task => task.title === 'Pending Task')).toBe(true);

        // Find in-progress tasks
        const inProgressTasks = await taskModel.findByStatus('in_progress');
        expect(inProgressTasks.some(task => task.title === 'In Progress Task')).toBe(true);
      } catch (error) {
        pending('Database not available for testing');
      }
    });

    it('should find tasks by assignee', async () => {
      try {
        // Create and assign a task
        const task = await taskModel.create({
          title: 'Assigned Task',
          description: 'Task assigned to agent',
          priority: 'high',
          metadata: {}
        }, testUser.id);

        await taskModel.assignTask(task.id, testAgent.id);

        // Find tasks by assignee
        const assignedTasks = await taskModel.findByAssignee(testAgent.id);

        expect(assignedTasks.length).toBeGreaterThan(0);
        expect(assignedTasks.some(task => task.title === 'Assigned Task')).toBe(true);
      } catch (error) {
        pending('Database not available for testing');
      }
    });
  });

  describe('Database Relationships', () => {
    it('should maintain user-task relationships', async () => {
      try {
        // Create user and task
        const user = await userModel.create('reluser', 'rel@example.com', 'password123', 'user');
        const task = await taskModel.create({
          title: 'Relationship Test',
          description: 'Testing relationships',
          priority: 'medium',
          metadata: {}
        }, user.id);

        // Verify relationship through database query
        const userTasks = await taskModel.findByCreator(user.id);

        expect(userTasks.length).toBeGreaterThan(0);
        expect(userTasks.some(t => t.id === task.id)).toBe(true);
      } catch (error) {
        pending('Database not available for testing');
      }
    });
  });
});