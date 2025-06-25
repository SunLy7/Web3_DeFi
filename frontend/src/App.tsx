import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SwapPage from './pages/SwapPage';
import PoolsPage from './pages/PoolsPage';
import StakingPage from './pages/StakingPage';
// import { Web3ProviderComponent } from './context/Web3Context';

const App: React.FC = () => {
  return (
    <Box minH="100vh" bg="gray.900">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/swap" element={<SwapPage />} />
          <Route path="/pools" element={<PoolsPage />} />
          <Route path="/staking" element={<StakingPage />} />
        </Routes>
      </Layout>
    </Box>
  );
};

export default App; 