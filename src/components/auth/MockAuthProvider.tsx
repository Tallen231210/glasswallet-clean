'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock user data for development
const MOCK_USER = {
  id: 'mock-user-id',
  firstName: 'John',
  lastName: 'Doe',
  emailAddress: 'john.doe@example.com',
  imageUrl: '',
};

interface MockAuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: typeof MOCK_USER | null;
  signIn: () => void;
  signOut: () => void;
}

const MockAuthContext = createContext<MockAuthContextType>({
  isLoaded: false,
  isSignedIn: false,
  user: null,
  signIn: () => {},
  signOut: () => {},
});

export const useMockAuth = () => useContext(MockAuthContext);

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoaded(true);
      // Auto-sign in for development
      setIsSignedIn(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const signIn = () => setIsSignedIn(true);
  const signOut = () => setIsSignedIn(false);

  return (
    <MockAuthContext.Provider 
      value={{
        isLoaded,
        isSignedIn,
        user: isSignedIn ? MOCK_USER : null,
        signIn,
        signOut,
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
};

// Mock components that match Clerk's API
export const SignedIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn } = useMockAuth();
  return isSignedIn ? <>{children}</> : null;
};

export const SignedOut: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn } = useMockAuth();
  return !isSignedIn ? <>{children}</> : null;
};

export const UserButton: React.FC = () => {
  const { user, signOut } = useMockAuth();
  
  if (!user) return null;
  
  return (
    <div className="relative">
      <button
        onClick={signOut}
        className="flex items-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      >
        <div className="w-8 h-8 bg-neon-green/20 rounded-full flex items-center justify-center">
          <span className="text-neon-green text-sm font-semibold">
            {user.firstName[0]}{user.lastName[0]}
          </span>
        </div>
        <div className="text-left">
          <div className="text-white text-sm">{user.firstName} {user.lastName}</div>
          <div className="text-gray-400 text-xs">{user.emailAddress}</div>
        </div>
      </button>
    </div>
  );
};