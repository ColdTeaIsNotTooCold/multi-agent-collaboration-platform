import React, { useState, useEffect } from 'react';
import { Task } from '../../types';
import { taskApi } from '../../utils/api';
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

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SearchBar = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.5rem;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TaskTable = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid #e1e8ed;
  color: #333;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e1e8ed;
`;

const Tr = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

const TaskTitle = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
`;

const TaskDescription = styled.div`
  font-size: 0.875rem;
  color: #666;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;

  background-color: ${props => {
    switch (props.$status) {
      case 'pending': return '#e2e3e5';
      case 'in_progress': return '#fff3cd';
      case 'completed': return '#d4edda';
      case 'failed': return '#f8d7da';
      default: return '#e2e3e5';
    }
  }};

  color: ${props => {
    switch (props.$status) {
      case 'pending': return '#383d41';
      case 'in_progress': return '#856404';
      case 'completed': return '#155724';
      case 'failed': return '#721c24';
      default: return '#383d41';
    }
  }};
`;

const PriorityBadge = styled.span<{ $priority: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;

  background-color: ${props => {
    switch (props.$priority) {
      case 'low': return '#d1ecf1';
      case 'medium': return '#fff3cd';
      case 'high': return '#f8d7da';
      case 'critical': return '#f5c6cb';
      default: return '#e2e3e5';
    }
  }};

  color: ${props => {
    switch (props.$priority) {
      case 'low': return '#0c5460';
      case 'medium': return '#856404';
      case 'high': return '#721c24';
      case 'critical': return '#721c24';
      default: return '#383d41';
    }
  }};
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: background 0.3s ease;

  &:last-child {
    margin-right: 0;
  }
`;

const ViewButton = styled(ActionButton)`
  background: #667eea;
  color: white;

  &:hover {
    background: #5a6fd8;
  }
`;

const AssignButton = styled(ActionButton)`
  background: #28a745;
  color: white;

  &:hover {
    background: #218838;
  }
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

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const { tasks: socketTasks } = useSocket();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await taskApi.getAll();

        if (response.success && response.data) {
          setTasks(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Update tasks when socket receives updates
  useEffect(() => {
    if (socketTasks.length > 0) {
      setTasks(socketTasks);
    }
  }, [socketTasks]);

  // Filter tasks based on search and filters
  useEffect(() => {
    let filtered = tasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const handleAssignTask = async (taskId: string) => {
    try {
      // For now, we'll assign to the first available agent
      // In a real implementation, you'd show a modal to select an agent
      await taskApi.assign(taskId, 'default-agent-id');
    } catch (err) {
      console.error('Failed to assign task:', err);
    }
  };

  if (loading) {
    return <LoadingMessage>Loading tasks...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <Container>
      <Header>
        <Title>Tasks</Title>
        <CreateButton onClick={() => window.location.href = '/tasks/create'}>
          Create Task
        </CreateButton>
      </Header>

      <Filters>
        <SearchBar
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </FilterSelect>
        <FilterSelect
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </FilterSelect>
      </Filters>

      <TaskTable>
        <Table>
          <thead>
            <tr>
              <Th>Task</Th>
              <Th>Status</Th>
              <Th>Priority</Th>
              <Th>Assigned To</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <Tr key={task.id}>
                <Td>
                  <TaskTitle>{task.title}</TaskTitle>
                  <TaskDescription>{task.description}</TaskDescription>
                </Td>
                <Td>
                  <StatusBadge $status={task.status}>
                    {task.status.replace('_', ' ')}
                  </StatusBadge>
                </Td>
                <Td>
                  <PriorityBadge $priority={task.priority}>
                    {task.priority}
                  </PriorityBadge>
                </Td>
                <Td>
                  {task.assignedTo || 'Unassigned'}
                </Td>
                <Td>
                  {new Date(task.createdAt).toLocaleDateString()}
                </Td>
                <Td>
                  <ViewButton onClick={() => window.location.href = `/tasks/${task.id}`}>
                    View
                  </ViewButton>
                  {!task.assignedTo && task.status === 'pending' && (
                    <AssignButton onClick={() => handleAssignTask(task.id)}>
                      Assign
                    </AssignButton>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TaskTable>

      {filteredTasks.length === 0 && (
        <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
          {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
            ? 'No tasks found matching your filters.'
            : 'No tasks available.'
          }
        </div>
      )}
    </Container>
  );
};

export default TaskList;