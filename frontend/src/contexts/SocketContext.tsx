import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Agent, Task, SocketMessage } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  agents: Agent[];
  tasks: Task[];
  joinAgentRoom: (agentId: string) => void;
  joinTaskRoom: (taskId: string) => void;
  leaveAgentRoom: (agentId: string) => void;
  leaveTaskRoom: (taskId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io('http://localhost:3001', {
      auth: {
        token,
      },
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    // Listen for real-time updates
    newSocket.on('agent-updated', (agent: Agent) => {
      setAgents(prev => prev.map(a => a.id === agent.id ? agent : a));
    });

    newSocket.on('task-updated', (task: Task) => {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    });

    newSocket.on('agent-created', (agent: Agent) => {
      setAgents(prev => [...prev, agent]);
    });

    newSocket.on('task-created', (task: Task) => {
      setTasks(prev => [...prev, task]);
    });

    newSocket.on('agent-deleted', (agentId: string) => {
      setAgents(prev => prev.filter(a => a.id !== agentId));
    });

    newSocket.on('task-deleted', (taskId: string) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinAgentRoom = (agentId: string) => {
    if (socket) {
      socket.emit('join-agent-room', agentId);
    }
  };

  const joinTaskRoom = (taskId: string) => {
    if (socket) {
      socket.emit('join-task-room', taskId);
    }
  };

  const leaveAgentRoom = (agentId: string) => {
    if (socket) {
      socket.emit('leave-agent-room', agentId);
    }
  };

  const leaveTaskRoom = (taskId: string) => {
    if (socket) {
      socket.emit('leave-task-room', taskId);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    agents,
    tasks,
    joinAgentRoom,
    joinTaskRoom,
    leaveAgentRoom,
    leaveTaskRoom,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};