import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: (failureCount, error) => {
        // Never retry on 401 (unauthorized) — means token is bad
        if (error?.response?.status === 401) return false;
        return failureCount < 1;
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <SettingsProvider>
              <App />
              <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: '13px',
                  fontWeight: '500',
                  background: '#FFFFFF',
                  color: '#191C1E',
                  border: '1px solid #DFD9CE',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(24, 27, 30, 0.08)',
                },
                success: {
                  iconTheme: { primary: '#2B5E44', secondary: '#FFFFFF' },
                },
                error: {
                  iconTheme: { primary: '#9E2A2B', secondary: '#FFFFFF' },
                },
                duration: 4000,
              }}
            />
            </SettingsProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
