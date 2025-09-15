import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import DashboardOverview from './DashboardOverview';
import { useSocket } from '../../contexts/SocketContext';

// Mock the useSocket hook
vi.mock('../../contexts/SocketContext', () => ({
  useSocket: () => ({
    socket: null,
    isConnected: false,
    agents: [],
    tasks: [],
    joinAgentRoom: vi.fn(),
    joinTaskRoom: vi.fn(),
    leaveAgentRoom: vi.fn(),
    leaveTaskRoom: vi.fn(),
  }),
}));

// Mock the API calls
vi.mock('../../utils/api', () => ({
  agentApi: {
    getAll: vi.fn(),
  },
  taskApi: {
    getAll: vi.fn(),
  },
}));

const mockAgentApi = require('../../utils/api').agentApi;
const mockTaskApi = require('../../utils/api').taskApi;

describe('DashboardOverview', () => {
  const mockAgents = [
    {
      id: '1',
      name: 'Test Agent 1',
      type: 'test-type',
      capabilities: ['capability1', 'capability2'],
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Test Agent 2',
      type: 'test-type',
      capabilities: ['capability3'],
      status: 'busy',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const mockTasks = [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Test description',
      status: 'completed',
      priority: 'medium',
      createdBy: 'user1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Test Task 2',
      description: 'Test description',
      status: 'pending',
      priority: 'high',
      createdBy: 'user1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockAgentApi.getAll.mockImplementation(() => new Promise(() => {}));
    mockTaskApi.getAll.mockImplementation(() => new Promise(() => {}));

    render(<DashboardOverview />);

    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
  });

  it('renders dashboard with stats when data is loaded', async () => {
    mockAgentApi.getAll.mockResolvedValue({
      success: true,
      data: mockAgents,
    });
    mockTaskApi.getAll.mockResolvedValue({
      success: true,
      data: mockTasks,
    });

    render(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByText('Total Agents')).toBeInTheDocument();
      expect(screen.getByText('Active Agents')).toBeInTheDocument();
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Total Agents
      expect(screen.getByText('2')).toBeInTheDocument(); // Total Tasks
      expect(screen.getByText('1')).toBeInTheDocument(); // Completed Tasks
    });
  });

  it('displays error message when API calls fail', async () => {
    mockAgentApi.getAll.mockRejectedValue(new Error('Failed to fetch agents'));
    mockTaskApi.getAll.mockRejectedValue(new Error('Failed to fetch tasks'));

    render(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch data/i)).toBeInTheDocument();
    });
  });

  it('displays no active agents message when no agents are active', async () => {
    const inactiveAgents = [
      {
        id: '1',
        name: 'Inactive Agent',
        type: 'test-type',
        capabilities: ['capability1'],
        status: 'inactive',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    mockAgentApi.getAll.mockResolvedValue({
      success: true,
      data: inactiveAgents,
    });
    mockTaskApi.getAll.mockResolvedValue({
      success: true,
      data: [],
    });

    render(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByText(/no active agents/i)).toBeInTheDocument();
    });
  });

  it('displays no tasks message when no tasks exist', async () => {
    mockAgentApi.getAll.mockResolvedValue({
      success: true,
      data: [],
    });
    mockTaskApi.getAll.mockResolvedValue({
      success: true,
      data: [],
    });

    render(<DashboardOverview />);

    await waitFor(() => {
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
    });
  });
});