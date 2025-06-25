import React from 'react';
import { Box, Heading, Text, Button, Container } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { injected } from './context/Web3Context';

const MockApp: React.FC = () => {
  const { active, account, activate, deactivate } = useWeb3React();

  const handleConnect = async () => {
    try {
      await activate(injected);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const handleDisconnect = () => {
    deactivate();
  };

  return (
    <Box minHeight="100vh" bg="gray.900" color="white" py={10}>
      <Container maxW="container.md">
        <Heading mb={6} textAlign="center">DeFi应用</Heading>
        
        <Box bg="gray.800" p={6} borderRadius="md" mb={6}>
          <Heading size="md" mb={4}>钱包连接测试</Heading>
          
          <Text mb={4}>
            {active 
              ? `已连接: ${account?.substring(0, 6)}...${account?.substring(account.length - 4)}` 
              : '未连接钱包'}
          </Text>
          
          <Button 
            colorScheme="blue" 
            onClick={active ? handleDisconnect : handleConnect}
          >
            {active ? '断开连接' : '连接钱包'}
          </Button>
        </Box>
        
        <Text textAlign="center" fontSize="sm" color="gray.500">
          这是一个临时测试页面，用于验证基本连接功能
        </Text>
      </Container>
    </Box>
  );
};

export default MockApp; 