import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Flex, 
  Button, 
  Heading, 
  HStack,
  useColorMode,
  IconButton
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../context/Web3Context';

const Navbar: React.FC = () => {
  const { account, activate, deactivate, active } = useWeb3React();
  const { colorMode, toggleColorMode } = useColorMode();
  
  // 连接钱包
  const connectWallet = async () => {
    try {
      await activate(injected);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // 断开钱包
  const disconnectWallet = () => {
    deactivate();
  };

  // 格式化地址显示
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Box as="header" bg="gray.800" px={4} py={2} borderBottom="1px" borderColor="gray.700">
      <Flex align="center" justify="space-between">
        <HStack spacing={4}>
          <Heading as="div" size="md" color="blue.400">
            <RouterLink to="/">DeFi平台</RouterLink>
          </Heading>

          <HStack spacing={2} ml={8}>
            <Button as={RouterLink} to="/swap" variant="ghost" colorScheme="blue">
              交易
            </Button>
            <Button as={RouterLink} to="/pools" variant="ghost" colorScheme="blue">
              流动池
            </Button>
            <Button as={RouterLink} to="/staking" variant="ghost" colorScheme="blue">
              质押挖矿
            </Button>
          </HStack>
        </HStack>
        
        <HStack spacing={4}>
          <IconButton
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            aria-label="切换主题"
            size="sm"
            variant="ghost"
          />

          {active ? (
            <Button 
              colorScheme="blue" 
              variant="outline"
              onClick={disconnectWallet}
            >
              {formatAddress(account as string)}
            </Button>
          ) : (
            <Button 
              colorScheme="blue"
              onClick={connectWallet}
            >
              连接钱包
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar; 