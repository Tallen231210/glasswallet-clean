'use client';

import React from 'react';
import { 
  GlassCard, 
  NeonButton, 
  Badge, 
  StatCard, 
  Alert, 
  ToastProvider, 
  useToast, 
  Loading 
} from '@/components/ui';

const TestPage: React.FC = () => {
  const { showToast } = useToast();

  const handleToastTest = () => {
    showToast({
      message: 'All components are working correctly!',
      variant: 'success'
    });
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">Component Import Test</h1>
        
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">GlassCard Component</h2>
          <p className="text-gray-300">This component is working correctly!</p>
        </GlassCard>
        
        <div className="flex gap-4">
          <NeonButton onClick={handleToastTest}>
            Test NeonButton & Toast
          </NeonButton>
          <NeonButton variant="secondary">
            Secondary Button
          </NeonButton>
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <Badge variant="success">Success Badge</Badge>
          <Badge variant="neon">Neon Badge</Badge>
          <Badge variant="warning">Warning Badge</Badge>
          <Badge variant="error">Error Badge</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Test Metric 1"
            value="1,234"
            icon="📈"
            variant="success"
            trend="+12.5%"
          />
          <StatCard
            title="Test Metric 2"
            value="567"
            icon="⭐"
            variant="neon"
            trend="+8.3%"
          />
          <StatCard
            title="Test Metric 3"
            value="89.2%"
            icon="🎯"
            variant="default"
            trend="+2.1%"
          />
        </div>
        
        <Alert variant="info" title="Component Test">
          All UI components are importing and rendering correctly!
        </Alert>
        
        <Alert variant="success" title="Success">
          The React import null error has been resolved!
        </Alert>
        
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Loading Component Test</h3>
          <Loading message="Testing loading component..." />
        </GlassCard>
      </div>
    </div>
  );
};

const TestPageWrapper: React.FC = () => {
  return (
    <ToastProvider>
      <TestPage />
    </ToastProvider>
  );
};

export default TestPageWrapper;