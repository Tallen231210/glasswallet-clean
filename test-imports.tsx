// Test React component imports to verify they're no longer null
import React from 'react';

// Import the key components mentioned in the original request
import { 
  GlassCard, 
  NeonButton, 
  Badge, 
  StatCard, 
  Alert, 
  ToastProvider, 
  useToast, 
  Loading 
} from './src/components/ui';

// Test component that renders all the key components
const TestComponent: React.FC = () => {
  return (
    <div>
      <h1>Component Import Test</h1>
      
      <GlassCard className="p-4 mb-4">
        <h2>GlassCard Works!</h2>
      </GlassCard>
      
      <NeonButton className="mb-4">
        NeonButton Works!
      </NeonButton>
      
      <Badge variant="success" className="mb-4">
        Badge Works!
      </Badge>
      
      <StatCard 
        title="Test Stat"
        value="100"
        className="mb-4"
      />
      
      <Alert variant="info" className="mb-4">
        Alert Works!
      </Alert>
      
      <Loading message="Testing..." />
    </div>
  );
};

// Test component wrapped with ToastProvider
const App: React.FC = () => {
  return (
    <ToastProvider>
      <TestComponent />
    </ToastProvider>
  );
};

export default App;