import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
// import { Web3ReactProvider } from '@web3-react/core';
// import { Web3Provider } from '@ethersproject/providers';
import App from './App';
import './index.css';

// 获取Web3提供者
// function getLibrary(provider: any): Web3Provider {
//   const library = new Web3Provider(provider);
//   library.pollingInterval = 12000;
//   return library;
// }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
); 