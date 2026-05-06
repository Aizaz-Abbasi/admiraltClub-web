import './index.css';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouterProvider } from './router';
import { primeAuthCache } from './auth';

const queryClient = new QueryClient();
primeAuthCache(queryClient);

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <QueryClientProvider client={queryClient}>
    <AppRouterProvider />
  </QueryClientProvider>
);