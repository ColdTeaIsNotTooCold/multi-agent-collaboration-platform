import React from 'react';
import Layout from '../../components/common/Layout';
import TaskList from '../../components/tasks/TaskList';

const TasksPage: React.FC = () => {
  return (
    <Layout title="Tasks">
      <TaskList />
    </Layout>
  );
};

export default TasksPage;