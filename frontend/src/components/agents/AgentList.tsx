import React, { useState, useEffect } from 'react';
import { Agent } from '../../types';
import { agentApi } from '../../utils/api';
import { useSocket } from '../../contexts/SocketContext';
import styled from 'styled-components';

const Container = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h3`
  color: #333;
  margin: 0;
`;

const CreateButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1.5rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const AgentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const AgentCard = styled.div<{ borderColor?: string }>`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid ${props => props.borderColor || '#667eea'};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const AgentName = styled.h4`
  color: #333;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
`;

const AgentType = styled.div`
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const CapabilityTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const CapabilityTag = styled.span`
  padding: 0.25rem 0.5rem;
  background: #e9ecef;
  border-radius: 12px;
  font-size: 0.75rem;
  color: #495057;
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
      default: return '#e2e3e5';
    }
  }};

  color: ${props => {
    switch (props.$status) {
      case 'active': return '#155724';
      case 'inactive': return '#721c24';
      case 'busy': return '#856404';
      case 'error': return '#721c24';
      default: return '#383d41';
    }
  }};
`;

const AgentMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.75rem;
  color: #666;
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

const AgentList: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { agents: socketAgents } = useSocket();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await agentApi.getAll();

        if (response.success && response.data) {
          setAgents(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch agents');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Update agents when socket receives updates
  useEffect(() => {
    if (socketAgents.length > 0) {
      setAgents(socketAgents);
    }
  }, [socketAgents]);

  // Filter agents based on search term
  useEffect(() => {
    const filtered = agents.filter(agent =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.capabilities.some(cap =>
        cap.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredAgents(filtered);
  }, [agents, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#667eea';
      case 'inactive': return '#6c757d';
      case 'busy': return '#ffc107';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <LoadingMessage>Loading agents...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <Container>
      <Header>
        <Title>Agents</Title>
        <CreateButton onClick={() => window.location.href = '/agents/create'}>
          Create Agent
        </CreateButton>
      </Header>

      <SearchBar
        type="text"
        placeholder="Search agents by name, type, or capabilities..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <AgentGrid>
        {filteredAgents.map(agent => (
          <AgentCard
            key={agent.id}
            borderColor={getStatusColor(agent.status)}
          >
            <AgentName>{agent.name}</AgentName>
            <AgentType>{agent.type}</AgentType>

            <CapabilityTags>
              {agent.capabilities.slice(0, 3).map(capability => (
                <CapabilityTag key={capability}>
                  {capability}
                </CapabilityTag>
              ))}
              {agent.capabilities.length > 3 && (
                <CapabilityTag>
                  +{agent.capabilities.length - 3} more
                </CapabilityTag>
              )}
            </CapabilityTags>

            <div style={{ display: 'flex', justifyItems: 'center', gap: '1rem' }}>
              <StatusBadge $status={agent.status}>
                {agent.status}
              </StatusBadge>
              {agent.currentTask && (
                <span style={{ fontSize: '0.75rem', color: '#666' }}>
                  Task: {agent.currentTask}
                </span>
              )}
            </div>

            <AgentMeta>
              <span>Created: {new Date(agent.createdAt).toLocaleDateString()}</span>
              <span>ID: {agent.id.slice(0, 8)}</span>
            </AgentMeta>
          </AgentCard>
        ))}
      </AgentGrid>

      {filteredAgents.length === 0 && (
        <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
          {searchTerm ? 'No agents found matching your search.' : 'No agents available.'}
        </div>
      )}
    </Container>
  );
};

export default AgentList;