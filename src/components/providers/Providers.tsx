'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './AuthProvider';
import { useState } from 'react';
import { useFCMRegistration } from '@/hooks/useFCM';

import { Toaster } from 'sonner';

function FCMRegistration() {
  useFCMRegistration();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 0, // Disabled global retries to prevent flooding backend on errors
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthProvider>
          <FCMRegistration />
          {children}
        </AuthProvider>
        <Toaster position="bottom-right" theme="light" toastOptions={{ className: 'bg-card text-text-primary border border-border shadow-md rounded-lg' }} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
