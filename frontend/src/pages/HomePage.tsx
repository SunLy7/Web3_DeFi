import React from 'react';
import { Box, Heading, Text, Button, Stack, Image, Container, SimpleGrid } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <Box>
      {/* 英雄区 */}
      <Box py={10} textAlign="center">
        <Container maxW="container.lg">
          <Heading as="h1" size="2xl" mb={4}>
            下一代去中心化交易平台
          </Heading>
          <Text fontSize="xl" mb={8} color="gray.400">
            通过自动做市商交易代币，提供流动性并获取奖励
          </Text>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4} justify="center">
            <Button as={RouterLink} to="/swap" size="lg" colorScheme="blue">
              开始交易
            </Button>
            <Button as={RouterLink} to="/pools" size="lg" variant="outline" colorScheme="blue">
              探索流动池
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* 特点介绍 */}
      <Box py={16} bg="gray.800">
        <Container maxW="container.lg">
          <Heading as="h2" size="xl" mb={12} textAlign="center">
            平台特点
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <FeatureCard 
              title="低交易费用" 
              description="只收取0.3%的交易费用，远低于中心化交易所"
              icon="📉"
            />
            <FeatureCard 
              title="高流动性奖励" 
              description="为流动性提供者提供高额APR奖励"
              icon="💰"
            />
            <FeatureCard 
              title="安全可信" 
              description="智能合约经过严格审计，确保资产安全"
              icon="🛡️"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* 统计数据 */}
      <Box py={16}>
        <Container maxW="container.lg">
          <Heading as="h2" size="xl" mb={12} textAlign="center">
            平台数据
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <StatCard figure="$1.2M+" label="总锁仓价值" />
            <StatCard figure="12K+" label="活跃用户" />
            <StatCard figure="$350K+" label="日交易量" />
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
};

// 功能卡片组件
interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <Box p={6} bg="gray.700" borderRadius="lg" textAlign="center">
      <Text fontSize="4xl" mb={4}>{icon}</Text>
      <Heading as="h3" size="md" mb={2}>{title}</Heading>
      <Text color="gray.400">{description}</Text>
    </Box>
  );
};

// 统计卡片组件
interface StatCardProps {
  figure: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ figure, label }) => {
  return (
    <Box p={6} bg="gray.800" borderRadius="lg" textAlign="center" borderWidth="1px" borderColor="blue.500">
      <Heading as="h3" size="xl" mb={2} color="blue.400">{figure}</Heading>
      <Text color="gray.400">{label}</Text>
    </Box>
  );
};

export default HomePage; 