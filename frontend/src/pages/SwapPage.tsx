import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Text,
  useToast
} from '@chakra-ui/react';
import { ArrowDownIcon } from '@chakra-ui/icons';
// import { useWeb3React } from '@web3-react/core';
// import { ethers } from 'ethers';

const SwapPage: React.FC = () => {
  const [fromToken, setFromToken] = useState('tokenA');
  const [toToken, setToToken] = useState('tokenB');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();
  // 模拟钱包状态
  const active = false;

  // 根据输入金额计算输出金额 (模拟)
  const calculateOutputAmount = (input: string, isFromToken: boolean) => {
    if (!input || isNaN(Number(input))) {
      return '';
    }

    const amount = parseFloat(input);
    
    // 简单模拟价格比例 (实际项目中应该调用合约获取实时价格)
    if (isFromToken) {
      // TokenA -> TokenB 的价格比例假设为 1:2
      setToAmount((amount * 2).toString());
    } else {
      // TokenB -> TokenA 的价格比例假设为 2:1
      setFromAmount((amount / 2).toString());
    }
  };

  // 处理输入变化
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromAmount(value);
    calculateOutputAmount(value, true);
  };

  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToAmount(value);
    calculateOutputAmount(value, false);
  };

  // 切换代币
  const handleSwitchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // 执行交易
  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast({
        title: '输入金额无效',
        description: '请输入有效的交换金额',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: '交易成功',
        description: '代币交换已完成',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // 清空输入
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      toast({
        title: '交易失败',
        description: '处理交易时出错',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Swap error:', error);
    }

    setIsLoading(false);
  };

  return (
    <Box maxW="500px" mx="auto" py={8}>
      <Card>
        <CardHeader>
          <Heading size="lg" textAlign="center">交易代币</Heading>
        </CardHeader>
        <CardBody>
          {/* 输入代币部分 */}
          <FormControl mb={4}>
            <FormLabel>从</FormLabel>
            <Flex mb={2}>
              <Select 
                value={fromToken} 
                onChange={(e) => setFromToken(e.target.value)}
                mr={2}
                bg="gray.700"
                width="120px"
              >
                <option value="tokenA">Token A</option>
                <option value="tokenB">Token B</option>
              </Select>
              <InputGroup>
                <Input 
                  placeholder="0.0" 
                  value={fromAmount} 
                  onChange={handleFromAmountChange}
                  bg="gray.700"
                />
                <InputRightElement width="60px">
                  <Button size="xs" onClick={() => setFromAmount('100')}>最大</Button>
                </InputRightElement>
              </InputGroup>
            </Flex>
            <Text fontSize="sm" color="gray.500">
              余额: {fromToken === 'tokenA' ? '1000' : '2000'} {fromToken === 'tokenA' ? 'TKNA' : 'TKNB'}
            </Text>
          </FormControl>

          {/* 切换按钮 */}
          <Flex justify="center" my={4}>
            <Button 
              onClick={handleSwitchTokens} 
              size="sm" 
              bg="gray.700" 
              borderRadius="full"
              p={1}
            >
              <ArrowDownIcon />
            </Button>
          </Flex>

          {/* 输出代币部分 */}
          <FormControl mb={6}>
            <FormLabel>到</FormLabel>
            <Flex mb={2}>
              <Select 
                value={toToken} 
                onChange={(e) => setToToken(e.target.value)}
                mr={2}
                bg="gray.700"
                width="120px"
              >
                <option value="tokenA">Token A</option>
                <option value="tokenB">Token B</option>
              </Select>
              <Input 
                placeholder="0.0" 
                value={toAmount} 
                onChange={handleToAmountChange}
                bg="gray.700"
              />
            </Flex>
            <Text fontSize="sm" color="gray.500">
              余额: {toToken === 'tokenA' ? '1000' : '2000'} {toToken === 'tokenA' ? 'TKNA' : 'TKNB'}
            </Text>
          </FormControl>

          {/* 价格信息 */}
          <Box bg="gray.700" p={3} borderRadius="md" mb={6}>
            <Flex justify="space-between">
              <Text color="gray.500">价格</Text>
              <Text>
                {fromToken === 'tokenA' ? '1 TKNA = 2 TKNB' : '1 TKNB = 0.5 TKNA'}
              </Text>
            </Flex>
            <Flex justify="space-between">
              <Text color="gray.500">滑点容忍度</Text>
              <Text>0.5%</Text>
            </Flex>
          </Box>

          {/* 交换按钮 */}
          <Button 
            colorScheme="blue" 
            width="100%" 
            size="lg"
            onClick={handleSwap}
            isLoading={isLoading}
          >
            交换
          </Button>
        </CardBody>
      </Card>
    </Box>
  );
};

export default SwapPage; 