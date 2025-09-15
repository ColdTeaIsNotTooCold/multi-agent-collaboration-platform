import React, { useState, useEffect } from 'react';
import { Agent, Task } from '../../types';
import { agentApi, taskApi } from '../../utils/api';
import { useSocket } from '../../contexts/SocketContext';
import styled from 'styled-components';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Section = styled.section`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  color: #333;
  margin: 0;
`;

const ViewAllButton = styled.button`
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.3s ease;

  &:hover {
    background: #5a6fd8;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ListItem = styled.div<{ borderColor?: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid ${props => props.borderColor || '#667eea'};
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
`;

const ItemMeta = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;

  background-color: ${props => {
    switch (props.$status) {
      case 'active': return '#d4edda';
      case 'inactive': return '#f8d7da';
      case 'busy': return '#fff3cd';
      case 'error': return '#f8d7da';
      case 'completed': return '#d4edda';
      case 'in_progress': return '#fff3cd';
      case 'pending': return '#e2e3e5';
      case 'failed': return '#f8d7da';
      default: return '#e2e3e5';
    }
  }};

  color: ${props => {
    switch (props.$status) {
      case 'active': return '#155724';
      case 'inactive': return '#721c24';
      case 'busy': return '#856404';
      case 'error': return '#721c24';
      case 'completed': return '#155724';
      case 'in_progress': return '#856404';
      case 'pending': return '#383d41';
      case 'failed': return '#721c24';
      default: return '#383d41';
    }
  }};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
`;

const DashboardOverview: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { agents: socketAgents, tasks: socketTasks } = useSocket();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [agentsResponse, tasksResponse] = await Promise.all([
          agentApi.getAll(),
          taskApi.getAll()
        ]);

        if (agentsResponse.success && agentsResponse.data) {
          setAgents(agentsResponse.data);
        }

        if (tasksResponse.success && tasksResponse.data) {
          setTasks(tasksResponse.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update data when socket receives updates
  useEffect(() => {
    if (socketAgents.length > 0) {
      setAgents(socketAgents);
    }
  }, [socketAgents]);

  useEffect(() => {
    if (socketTasks.length > 0) {
      setTasks(socketTasks);
    }
  }, [socketTasks]);

  const stats = {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === 'active').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
  };

  const recentTasks = tasks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'busy');

  if (loading) {
    return <LoadingMessage>Loading dashboard...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <div>
      <StatsGrid>
        <StatCard>
          <StatValue>{stats.totalAgents}</StatValue>
          <StatLabel>Total Agents</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.activeAgents}</StatValue>
          <StatLabel>Active Agents</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.totalTasks}</StatValue>
          <StatLabel>Total Tasks</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.completedTasks}</StatValue>
          <StatLabel>Completed Tasks</StatLabel>
        </StatCard>
      </StatsGrid>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <Section>
          <SectionHeader>
            <SectionTitle>Active Agents</SectionTitle>
            <ViewAllButton onClick={() => window.location.href = '/agents'}>
              View All
            </ViewAllButton>
          </SectionHeader>
          <List>
            {activeAgents.slice(0, 5).map(agent => (
              <ListItem key={agent.id} borderColor="#667eea">
                <ItemInfo>
                  <ItemName>{agent.name}</ItemName>
                  <ItemMeta>{agent.type} • {agent.capabilities.join(', ')}</ItemMeta>
                </ItemInfo>
                <StatusBadge $status={agent.status}>{agent.status}</StatusBadge>
              </ListItem>
            ))}
            {activeAgents.length === 0 && (
              <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                No active agents
              </div>
            )}
          </List>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Recent Tasks</SectionTitle>
            <ViewAllButton onClick={() => window.location.href = '/tasks'}>
              View All
            </ViewAllButton>
          </SectionHeader>
          <List>
            {recentTasks.map(task => (
              <ListItem key={task.id} borderColor="#764ba2">
                <ItemInfo>
                  <ItemName>{task.title}</ItemName>
                  <ItemMeta>
                    Priority: {task.priority} •
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </ItemMeta>
                </ItemInfo>
                <StatusBadge $status={task.status}>{task.status}</StatusBadge>
              </ListItem>
            ))}
            {recentTasks.length === 0 && (
              <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                No tasks yet
              </div>
            )}
          </List>
        </Section>
      </div>
    </div>
  );
};

export default DashboardOverview;