import React from 'react';
import { Box, VStack, Text, Divider, Stat, StatLabel, StatNumber } from '@chakra-ui/react';

const Sidebar: React.FC = () => {
  return (
    <Box 
      as="aside" 
      width="250px" 
      bg="gray.800" 
      borderRight="1px" 
      borderColor="gray.700"
      display={{ base: 'none', md: 'block' }}
      px={4}
      py={6}
    >
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontWeight="bold" mb={3} color="gray.400" fontSize="sm">
            市场概览
          </Text>
          
          <VStack align="stretch" spacing={2}>
            <Stat>
              <StatLabel color="gray.500">总锁仓价值</StatLabel>
              <StatNumber>$1,245,678</StatNumber>
            </Stat>
            
            <Stat>
              <StatLabel color="gray.500">24h交易量</StatLabel>
              <StatNumber>$345,921</StatNumber>
            </Stat>
          </VStack>
        </Box>
        
        <Divider borderColor="gray.700" />
        
        <Box>
          <Text fontWeight="bold" mb={3} color="gray.400" fontSize="sm">
            代币价格
          </Text>
          
          <VStack align="stretch" spacing={2}>
            <Stat>
              <StatLabel color="gray.500">Token A</StatLabel>
              <StatNumber>$1.23 <Text as="span" color="green.400" fontSize="sm">+2.5%</Text></StatNumber>
            </Stat>
            
            <Stat>
              <StatLabel color="gray.500">Token B</StatLabel>
              <StatNumber>$0.95 <Text as="span" color="red.400" fontSize="sm">-1.2%</Text></StatNumber>
            </Stat>
          </VStack>
        </Box>
        
        <Divider borderColor="gray.700" />
        
        <Box>
          <Text fontWeight="bold" mb={3} color="gray.400" fontSize="sm">
            质押收益
          </Text>
          
          <VStack align="stretch" spacing={2}>
            <Stat>
              <StatLabel color="gray.500">流动性挖矿 APR</StatLabel>
              <StatNumber>5.2%</StatNumber>
            </Stat>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default Sidebar; 