import { TaskService } from '../services/task.service';
import { CreateTaskRequest, UpdateTaskRequest } from '../types';

describe('TaskService', () => {
  let taskService: TaskService;
  const testUserId = 'test-user-id';

  beforeEach(() => {
    taskService = new TaskService();
  });

  describe('createTask', () => {
    it('should create a new task with valid data', () => {
      const taskData: CreateTaskRequest = {
        title: 'Test Task',
        description: 'This is a test task',
        priority: 'medium'
      };

      const task = taskService.createTask(taskData, testUserId);

      expect(task).toBeDefined();
      expect(task.title).toBe(taskData.title);
      expect(task.description).toBe(taskData.description);
      expect(task.priority).toBe(taskData.priority);
      expect(task.status).toBe('pending');
      expect(task.createdBy).toBe(testUserId);
      expect(task.id).toBeDefined();
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    it('should create task with metadata', () => {
      const taskData: CreateTaskRequest = {
        title: 'Test Task',
        description: 'This is a test task',
        priority: 'high',
        metadata: { category: 'development', estimatedHours: 5 }
      };

      const task = taskService.createTask(taskData, testUserId);

      expect(task.metadata).toEqual(taskData.metadata);
    });
  });

  describe('getTask', () => {
    it('should return task by id', () => {
      const taskData: CreateTaskRequest = {
        title: 'Test Task',
        description: 'This is a test task',
        priority: 'low'
      };

      const createdTask = taskService.createTask(taskData, testUserId);
      const foundTask = taskService.getTask(createdTask.id);

      expect(foundTask).toBeDefined();
      expect(foundTask?.id).toBe(createdTask.id);
    });

    it('should return undefined for non-existent task', () => {
      const task = taskService.getTask('non-existent-id');
      expect(task).toBeUndefined();
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks', () => {
      const taskData1: CreateTaskRequest = {
        title: 'Task 1',
        description: 'First task',
        priority: 'high'
      };

      const taskData2: CreateTaskRequest = {
        title: 'Task 2',
        description: 'Second task',
        priority: 'medium'
      };

      taskService.createTask(taskData1, testUserId);
      taskService.createTask(taskData2, testUserId);

      const tasks = taskService.getAllTasks();

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[1].title).toBe('Task 2');
    });

    it('should return empty array when no tasks exist', () => {
      const tasks = taskService.getAllTasks();
      expect(tasks).toHaveLength(0);
    });
  });

  describe('updateTask', () => {
    it('should update task with valid data', () => {
      const taskData: CreateTaskRequest = {
        title: 'Test Task',
        description: 'This is a test task',
        priority: 'low'
      };

      const createdTask = taskService.createTask(taskData, testUserId);
      const updateData: UpdateTaskRequest = {
        title: 'Updated Task',
        status: 'in_progress'
      };

      const updatedTask = taskService.updateTask(createdTask.id, updateData);

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.title).toBe(updateData.title);
      expect(updatedTask?.status).toBe(updateData.status);
      expect(updatedTask?.updatedAt.getTime()).toBeGreaterThanOrEqual(createdTask.updatedAt.getTime());
    });

    it('should set completedAt when status is completed', () => {
      const taskData: CreateTaskRequest = {
        title: 'Test Task',
        description: 'This is a test task',
        priority: 'medium'
      };

      const createdTask = taskService.createTask(taskData, testUserId);
      const updateData: UpdateTaskRequest = {
        status: 'completed'
      };

      const updatedTask = taskService.updateTask(createdTask.id, updateData);

      expect(updatedTask?.completedAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent task', () => {
      const updateData: UpdateTaskRequest = {
        title: 'Updated Task'
      };

      const result = taskService.updateTask('non-existent-id', updateData);
      expect(result).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('should delete existing task', () => {
      const taskData: CreateTaskRequest = {
        title: 'Test Task',
        description: 'This is a test task',
        priority: 'high'
      };

      const createdTask = taskService.createTask(taskData, testUserId);
      const deleted = taskService.deleteTask(createdTask.id);

      expect(deleted).toBe(true);
      expect(taskService.getTask(createdTask.id)).toBeUndefined();
    });

    it('should return false for non-existent task', () => {
      const deleted = taskService.deleteTask('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('assignTask', () => {
    it('should assign task to agent', () => {
      const taskData: CreateTaskRequest = {
        title: 'Test Task',
        description: 'This is a test task',
        priority: 'medium'
      };

      const createdTask = taskService.createTask(taskData, testUserId);
      const agentId = 'test-agent-id';

      const assignedTask = taskService.assignTask(createdTask.id, agentId);

      expect(assignedTask).toBeDefined();
      expect(assignedTask?.assignedTo).toBe(agentId);
      expect(assignedTask?.status).toBe('assigned');
    });

    it('should return null for non-existent task', () => {
      const result = taskService.assignTask('non-existent-id', 'test-agent-id');
      expect(result).toBeNull();
    });
  });

  describe('getTasksByStatus', () => {
    it('should return tasks with specific status', () => {
      const taskData1: CreateTaskRequest = {
        title: 'Task 1',
        description: 'First task',
        priority: 'high'
      };

      const taskData2: CreateTaskRequest = {
        title: 'Task 2',
        description: 'Second task',
        priority: 'medium'
      };

      const task1 = taskService.createTask(taskData1, testUserId);
      const task2 = taskService.createTask(taskData2, testUserId);

      taskService.updateTask(task1.id, { status: 'completed' });

      const pendingTasks = taskService.getTasksByStatus('pending');
      const completedTasks = taskService.getTasksByStatus('completed');

      expect(pendingTasks).toHaveLength(1);
      expect(completedTasks).toHaveLength(1);
    });
  });

  describe('getTasksByAssignee', () => {
    it('should return tasks assigned to specific agent', () => {
      const taskData1: CreateTaskRequest = {
        title: 'Task 1',
        description: 'First task',
        priority: 'high'
      };

      const taskData2: CreateTaskRequest = {
        title: 'Task 2',
        description: 'Second task',
        priority: 'medium'
      };

      const task1 = taskService.createTask(taskData1, testUserId);
      const task2 = taskService.createTask(taskData2, testUserId);

      const agentId1 = 'agent-1';
      const agentId2 = 'agent-2';

      taskService.assignTask(task1.id, agentId1);
      taskService.assignTask(task2.id, agentId2);

      const agent1Tasks = taskService.getTasksByAssignee(agentId1);
      const agent2Tasks = taskService.getTasksByAssignee(agentId2);

      expect(agent1Tasks).toHaveLength(1);
      expect(agent2Tasks).toHaveLength(1);
      expect(agent1Tasks[0].assignedTo).toBe(agentId1);
      expect(agent2Tasks[0].assignedTo).toBe(agentId2);
    });
  });

  describe('getTasksByCreator', () => {
    it('should return tasks created by specific user', () => {
      const userId1 = 'user-1';
      const userId2 = 'user-2';

      const taskData1: CreateTaskRequest = {
        title: 'Task 1',
        description: 'First task',
        priority: 'high'
      };

      const taskData2: CreateTaskRequest = {
        title: 'Task 2',
        description: 'Second task',
        priority: 'medium'
      };

      taskService.createTask(taskData1, userId1);
      taskService.createTask(taskData2, userId2);

      const user1Tasks = taskService.getTasksByCreator(userId1);
      const user2Tasks = taskService.getTasksByCreator(userId2);

      expect(user1Tasks).toHaveLength(1);
      expect(user2Tasks).toHaveLength(1);
      expect(user1Tasks[0].createdBy).toBe(userId1);
      expect(user2Tasks[0].createdBy).toBe(userId2);
    });
  });

  describe('getTasksByPriority', () => {
    it('should return tasks with specific priority', () => {
      const taskData1: CreateTaskRequest = {
        title: 'Task 1',
        description: 'First task',
        priority: 'high'
      };

      const taskData2: CreateTaskRequest = {
        title: 'Task 2',
        description: 'Second task',
        priority: 'high'
      };

      const taskData3: CreateTaskRequest = {
        title: 'Task 3',
        description: 'Third task',
        priority: 'low'
      };

      taskService.createTask(taskData1, testUserId);
      taskService.createTask(taskData2, testUserId);
      taskService.createTask(taskData3, testUserId);

      const highPriorityTasks = taskService.getTasksByPriority('high');
      const lowPriorityTasks = taskService.getTasksByPriority('low');

      expect(highPriorityTasks).toHaveLength(2);
      expect(lowPriorityTasks).toHaveLength(1);
    });
  });
});