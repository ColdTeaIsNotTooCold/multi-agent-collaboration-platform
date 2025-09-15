import React from 'react';
import Layout from '../../components/common/Layout';
import AgentList from '../../components/agents/AgentList';

const AgentsPage: React.FC = () => {
  return (
    <Layout title="Agents">
      <AgentList />
    </Layout>
  );
};

export default AgentsPage;