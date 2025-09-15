import React from 'react';
import Layout from '../../components/common/Layout';
import DashboardOverview from '../../components/dashboard/DashboardOverview';

const DashboardPage: React.FC = () => {
  return (
    <Layout title="Dashboard">
      <DashboardOverview />
    </Layout>
  );
};

export default DashboardPage;