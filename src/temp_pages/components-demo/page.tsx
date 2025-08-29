'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { 
  GlassCard, 
  NeonButton, 
  Input, 
  Select, 
  Badge, 
  Progress, 
  StatCard, 
  DataTable, 
  FormField, 
  Toggle, 
  Alert,
  ToastProvider,
  useToast,
  Loading,
  Spinner
} from '@/components/ui';
import { Header } from '@/components/layout';

const ComponentsDemo = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [toggleValue, setToggleValue] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { showToast } = useToast();

  // Sample data for DataTable
  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', credits: 1250, status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', credits: 850, status: 'Pending' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', credits: 2100, status: 'Active' },
  ];

  const columns = [
    { key: 'name' as keyof typeof sampleData[0], header: 'Name', sortable: true },
    { key: 'email' as keyof typeof sampleData[0], header: 'Email' },
    { 
      key: 'credits' as keyof typeof sampleData[0], 
      header: 'Credits', 
      render: (value: number) => `$${value.toLocaleString()}`,
      sortable: true 
    },
    { 
      key: 'status' as keyof typeof sampleData[0], 
      header: 'Status',
      render: (value: string) => (
        <Badge 
          variant={value === 'Active' ? 'success' : 'warning'} 
          size="sm"
          dot
        >
          {value}
        </Badge>
      )
    },
  ];

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const handleTestLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast({
        title: 'Success!',
        message: 'Loading completed successfully',
        variant: 'success',
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Background */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-green/5 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <Header
          title="Component Library Demo"
          subtitle="Interactive showcase of all GlassWallet UI components"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Components Demo' },
          ]}
          actions={
            <div className="flex gap-2">
              <NeonButton onClick={() => showToast({ message: 'Header action clicked!', variant: 'info' })}>
                Test Action
              </NeonButton>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={12543}
            change={{ value: 12.5, type: 'increase', period: 'last month' }}
            icon="👥"
            variant="neon"
          />
          <StatCard
            title="Revenue"
            value="$84,532"
            change={{ value: 8.2, type: 'increase', period: 'last month' }}
            icon="💰"
            variant="success"
          />
          <StatCard
            title="Credits Used"
            value={9876}
            change={{ value: 3.1, type: 'decrease', period: 'last week' }}
            icon="⚡"
            variant="warning"
          />
          <StatCard
            title="Active Sessions"
            value={234}
            icon="🔄"
            variant="default"
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Components */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Form Components</h2>
            
            <div className="space-y-6">
              <FormField 
                label="Email Address" 
                required
                error={inputValue === 'error' ? 'Invalid email address' : undefined}
                helperText="Enter a valid email address"
              >
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  leftIcon="📧"
                />
              </FormField>

              <FormField label="Select Option">
                <Select
                  placeholder="Choose an option..."
                  options={selectOptions}
                  value={selectValue}
                  onChange={(e) => setSelectValue(e.target.value)}
                />
              </FormField>

              <Toggle
                label="Enable Notifications"
                description="Receive email notifications for important updates"
                checked={toggleValue}
                onChange={(e) => setToggleValue(e.target.checked)}
              />

              <div className="flex gap-3">
                <NeonButton onClick={() => showToast({ message: 'Form submitted!', variant: 'success' })}>
                  Submit Form
                </NeonButton>
                <NeonButton variant="secondary">
                  Cancel
                </NeonButton>
              </div>
            </div>
          </GlassCard>

          {/* Progress & Loading */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Progress & Loading</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Progress Bars</h3>
                <div className="space-y-3">
                  <Progress value={75} variant="neon" showLabel label="Upload Progress" />
                  <Progress value={45} variant="success" size="sm" />
                  <Progress value={90} variant="warning" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Loading States</h3>
                <div className="flex items-center gap-4 mb-4">
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" variant="white" />
                </div>
                
                <NeonButton 
                  onClick={handleTestLoading}
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Test Loading'}
                </NeonButton>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="success" dot>Active</Badge>
                  <Badge variant="warning" size="sm">Pending</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="neon" size="lg">Premium</Badge>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <Alert variant="info" title="Information">
              This is an informational message with some additional context.
            </Alert>
            <Alert variant="success" dismissible onDismiss={() => console.log('Success alert dismissed')}>
              Your changes have been saved successfully!
            </Alert>
          </div>
          <div className="space-y-4">
            <Alert variant="warning" title="Warning">
              Please review your settings before proceeding.
            </Alert>
            <Alert variant="error" title="Error" dismissible onDismiss={() => console.log('Error alert dismissed')}>
              Something went wrong. Please try again.
            </Alert>
          </div>
        </div>

        {/* Data Table */}
        <GlassCard>
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Data Table</h2>
              <div className="flex gap-2">
                <NeonButton 
                  size="sm"
                  onClick={() => showToast({ 
                    message: 'Export functionality would be implemented here',
                    variant: 'info' 
                  })}
                >
                  Export
                </NeonButton>
                <Input
                  placeholder="Search users..."
                  variant="search"
                  rightIcon="🔍"
                  className="w-64"
                />
              </div>
            </div>
          </div>

          <DataTable
            data={sampleData}
            columns={columns}
            loading={loading}
            pagination={{
              page: 1,
              limit: 10,
              total: 50,
              onPageChange: (page) => console.log('Navigate to page:', page)
            }}
            onSort={(column, direction) => console.log('Sort:', column, direction)}
          />
        </GlassCard>

        {/* Toast Demo */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Toast Notifications</h2>
          <div className="flex flex-wrap gap-3">
            <NeonButton 
              size="sm"
              onClick={() => showToast({ message: 'This is an info toast', variant: 'info' })}
            >
              Info Toast
            </NeonButton>
            <NeonButton 
              size="sm" 
              onClick={() => showToast({ 
                title: 'Success!',
                message: 'Operation completed successfully', 
                variant: 'success' 
              })}
            >
              Success Toast
            </NeonButton>
            <NeonButton 
              size="sm"
              onClick={() => showToast({ 
                message: 'Warning: Please check your settings', 
                variant: 'warning',
                action: { label: 'View Settings', onClick: () => console.log('View settings') }
              })}
            >
              Warning Toast
            </NeonButton>
            <NeonButton 
              size="sm"
              onClick={() => showToast({ 
                title: 'Error',
                message: 'Something went wrong', 
                variant: 'error' 
              })}
            >
              Error Toast
            </NeonButton>
          </div>
        </GlassCard>

        {loading && (
          <GlassCard>
            <Loading message="Processing your request..." size="lg" />
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default function ComponentsDemoPage() {
  return (
    <ToastProvider>
      <ComponentsDemo />
    </ToastProvider>
  );
}