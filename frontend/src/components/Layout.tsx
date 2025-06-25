import React, { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box>
      {children}
    </Box>
  );
};

export default Layout; 