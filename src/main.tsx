// // src/main.tsx
// import { QueryClientProvider } from '@tanstack/react-query';
// import { queryClient } from './lib/queryClient';

// <QueryClientProvider client={queryClient}></QueryClientProvider>

// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AppRouterProvider } from './router';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AppRouterProvider />
        </QueryClientProvider>
    </StrictMode>
);