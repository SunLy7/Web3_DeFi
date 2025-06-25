import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Table,
  Tbody,
  Tr,
  Td,
  Th,
  Thead,
  Text,
  Flex,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Input,
  FormControl,
  FormLabel,
  HStack,
} from '@chakra-ui/react';

// 模拟数据接口
interface Pool {
  id: string;
  tokenA: string;
  tokenB: string;
  reserveA: string;
  reserveB: string;
  apr: number;
  userLiquidity?: string;
}

const PoolsPage: React.FC = () => {
  const [pools, setPools] = useState<Pool[]>([
    {
      id: '1',
      tokenA: 'Token A',
      tokenB: 'Token B',
      reserveA: '1000000',
      reserveB: '2000000',
      apr: 5.2,
      userLiquidity: '2500',
    },
  ]);

  const [tokenAAmount, setTokenAAmount] = useState('');
  const [tokenBAmount, setTokenBAmount] = useState('');

  // 添加流动性
  const handleAddLiquidity = () => {
    // 这里添加与合约交互的逻辑
    console.log('添加流动性:', tokenAAmount, tokenBAmount);
    
    // 清空输入
    setTokenAAmount('');
    setTokenBAmount('');
  };

  // 移除流动性
  const handleRemoveLiquidity = (poolId: string) => {
    // 这里添加与合约交互的逻辑
    console.log('移除流动性:', poolId);
  };

  // 当输入A代币数量时，自动计算B代币数量
  const calculateTokenBAmount = (tokenAValue: string) => {
    if (!tokenAValue || isNaN(Number(tokenAValue))) {
      setTokenBAmount('');
      return;
    }
    
    // 假设比例为1:2
    const amount = parseFloat(tokenAValue) * 2;
    setTokenBAmount(amount.toString());
  };

  // 当输入B代币数量时，自动计算A代币数量
  const calculateTokenAAmount = (tokenBValue: string) => {
    if (!tokenBValue || isNaN(Number(tokenBValue))) {
      setTokenAAmount('');
      return;
    }
    
    // 假设比例为2:1
    const amount = parseFloat(tokenBValue) / 2;
    setTokenAAmount(amount.toString());
  };

  // 处理输入变化
  const handleTokenAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTokenAAmount(value);
    calculateTokenBAmount(value);
  };

  const handleTokenBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTokenBAmount(value);
    calculateTokenAAmount(value);
  };

  return (
    <Box maxW="container.xl" mx="auto" py={8}>
      <Heading mb={6}>流动性池</Heading>
      
      <Tabs variant="enclosed" colorScheme="blue" mb={8}>
        <TabList>
          <Tab>浏览池</Tab>
          <Tab>我的流动性</Tab>
          <Tab>添加流动性</Tab>
        </TabList>
        
        <TabPanels>
          {/* 浏览池列表 */}
          <TabPanel>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>池</Th>
                    <Th>储备量</Th>
                    <Th>APR</Th>
                    <Th>操作</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pools.map((pool) => (
                    <Tr key={pool.id}>
                      <Td>
                        <Text fontWeight="bold">{pool.tokenA}/{pool.tokenB}</Text>
                      </Td>
                      <Td>
                        <Text>{Number(pool.reserveA).toLocaleString()} {pool.tokenA}</Text>
                        <Text>{Number(pool.reserveB).toLocaleString()} {pool.tokenB}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="green">{pool.apr}%</Badge>
                      </Td>
                      <Td>
                        <Button size="sm" colorScheme="blue">添加流动性</Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
          
          {/* 我的流动性 */}
          <TabPanel>
            {pools.some(pool => pool.userLiquidity && Number(pool.userLiquidity) > 0) ? (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>池</Th>
                      <Th>我的流动性</Th>
                      <Th>份额</Th>
                      <Th>操作</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pools
                      .filter(pool => pool.userLiquidity && Number(pool.userLiquidity) > 0)
                      .map((pool) => {
                        const totalLiquidity = Number(pool.reserveA) + Number(pool.reserveB);
                        const userShare = (Number(pool.userLiquidity) / totalLiquidity) * 100;
                        
                        return (
                          <Tr key={pool.id}>
                            <Td>
                              <Text fontWeight="bold">{pool.tokenA}/{pool.tokenB}</Text>
                            </Td>
                            <Td>
                              <Text>{Number(pool.userLiquidity).toLocaleString()}</Text>
                            </Td>
                            <Td>
                              <Text>{userShare.toFixed(2)}%</Text>
                            </Td>
                            <Td>
                              <Button 
                                size="sm" 
                                colorScheme="red"
                                onClick={() => handleRemoveLiquidity(pool.id)}
                              >
                                移除
                              </Button>
                            </Td>
                          </Tr>
                        );
                      })}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Box textAlign="center" py={10}>
                <Text fontSize="lg" mb={4}>你还没有提供任何流动性</Text>
                <Button colorScheme="blue">添加流动性</Button>
              </Box>
            )}
          </TabPanel>
          
          {/* 添加流动性 */}
          <TabPanel>
            <Box maxW="500px" mx="auto">
              <FormControl mb={4}>
                <FormLabel>Token A 数量</FormLabel>
                <Input 
                  value={tokenAAmount} 
                  onChange={handleTokenAChange} 
                  placeholder="0.0"
                />
              </FormControl>
              
              <FormControl mb={6}>
                <FormLabel>Token B 数量</FormLabel>
                <Input 
                  value={tokenBAmount} 
                  onChange={handleTokenBChange}
                  placeholder="0.0"
                />
              </FormControl>
              
              <HStack justify="center">
                <Button colorScheme="blue" onClick={handleAddLiquidity}>
                  添加流动性
                </Button>
              </HStack>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default PoolsPage; 