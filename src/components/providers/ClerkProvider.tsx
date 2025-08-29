'use client';

import { ClerkProvider as BaseClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

interface ClerkProviderProps {
  children: React.ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  return (
    <BaseClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#00ff88',
          colorBackground: '#000000',
          colorText: '#ffffff',
        },
        elements: {
          formButtonPrimary: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
          card: 'bg-gray-900/80 backdrop-blur-xl border border-white/10',
        }
      }}
    >
      {children}
    </BaseClerkProvider>
  );
}