'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Input } from '@/components/ui/Input';

// Mock bulk operations data
const mockBulkData = {
  availableOperations: [
    {
      id: 'bulk-client-update',
      name: 'Client Account Management',
      description: 'Bulk update client statuses, plans, billing settings, and account configurations',
      category: 'Clients',
      icon: '👥',
      estimatedTime: '2-5 minutes',
      maxRecords: 1000,
      supportedFormats: ['CSV', 'Excel', 'JSON'],
      requiredFields: ['client_id', 'action']
    },
    {
      id: 'bulk-lead-processing',
      name: 'Lead Data Processing',
      description: 'Import, export, tag, and process lead data across multiple clients and sources',
      category: 'Leads',
      icon: '🎯',
      estimatedTime: '3-10 minutes',
      maxRecords: 10000,
      supportedFormats: ['CSV', 'Excel', 'JSON', 'XML'],
      requiredFields: ['lead_id', 'operation']
    },
    {
      id: 'bulk-pixel-sync',
      name: 'Pixel Synchronization',
      description: 'Bulk manage pixel connections, force sync operations, and update pixel configurations',
      category: 'Pixels',
      icon: '🔌',
      estimatedTime: '5-15 minutes',
      maxRecords: 500,
      supportedFormats: ['CSV', 'JSON'],
      requiredFields: ['pixel_id', 'client_id', 'action']
    },
    {
      id: 'bulk-widget-deploy',
      name: 'Widget Deployment',
      description: 'Deploy, update, or configure multiple widgets across client accounts',
      category: 'Widgets',
      icon: '🔧',
      estimatedTime: '2-8 minutes',
      maxRecords: 200,
      supportedFormats: ['JSON', 'YAML'],
      requiredFields: ['widget_id', 'client_id', 'configuration']
    },
    {
      id: 'bulk-billing-ops',
      name: 'Billing Operations',
      description: 'Process billing updates, apply credits, manage subscriptions, and handle payment issues',
      category: 'Billing',
      icon: '💳',
      estimatedTime: '1-3 minutes',
      maxRecords: 500,
      supportedFormats: ['CSV', 'Excel'],
      requiredFields: ['client_id', 'billing_action', 'amount']
    },
    {
      id: 'bulk-data-cleanup',
      name: 'Data Cleanup & Archive',
      description: 'Archive old data, clean up test records, and optimize database performance',
      category: 'System',
      icon: '🗂️',
      estimatedTime: '10-30 minutes',
      maxRecords: 50000,
      supportedFormats: ['JSON'],
      requiredFields: ['table_name', 'cleanup_action', 'date_range']
    }
  ],
  recentOperations: [
    {
      id: 'bulk-001',
      name: 'Q3 Client Plan Updates',
      type: 'bulk-client-update',
      status: 'completed' as const,
      totalRecords: 234,
      processedRecords: 234,
      successfulRecords: 231,
      failedRecords: 3,
      startedBy: 'Admin User',
      startedAt: '2024-08-29T09:15:00Z',
      completedAt: '2024-08-29T09:18:30Z',
      duration: 210,
      format: 'CSV'
    },
    {
      id: 'bulk-002',
      name: 'Lead Import - Campaign XYZ',
      type: 'bulk-lead-processing',
      status: 'running' as const,
      totalRecords: 8500,
      processedRecords: 5670,
      successfulRecords: 5612,
      failedRecords: 58,
      startedBy: 'System Scheduler',
      startedAt: '2024-08-29T10:30:00Z',
      completedAt: null,
      duration: null,
      format: 'Excel',
      progress: 66.7
    },
    {
      id: 'bulk-003',
      name: 'Pixel Sync Force Update',
      type: 'bulk-pixel-sync',
      status: 'completed' as const,
      totalRecords: 89,
      processedRecords: 89,
      successfulRecords: 84,
      failedRecords: 5,
      startedBy: 'Admin User',
      startedAt: '2024-08-29T08:45:00Z',
      completedAt: '2024-08-29T08:52:15Z',
      duration: 435,
      format: 'JSON'
    },
    {
      id: 'bulk-004',
      name: 'Monthly Billing Adjustments',
      type: 'bulk-billing-ops',
      status: 'failed' as const,
      totalRecords: 156,
      processedRecords: 47,
      successfulRecords: 43,
      failedRecords: 4,
      startedBy: 'Admin User',
      startedAt: '2024-08-29T07:30:00Z',
      completedAt: '2024-08-29T07:32:45Z',
      duration: 165,
      format: 'CSV',
      error: 'Payment gateway connection timeout'
    },
    {
      id: 'bulk-005',
      name: 'Widget Configuration Update',
      type: 'bulk-widget-deploy',
      status: 'completed' as const,
      totalRecords: 42,
      processedRecords: 42,
      successfulRecords: 42,
      failedRecords: 0,
      startedBy: 'System Scheduler',
      startedAt: '2024-08-28T16:20:00Z',
      completedAt: '2024-08-28T16:23:12Z',
      duration: 192,
      format: 'JSON'
    }
  ],
  dataManagement: {
    databaseStats: {
      totalRecords: 15847293,
      totalSize: '2.8TB',
      leadRecords: 8947234,
      clientRecords: 1247,
      pixelRecords: 89543,
      widgetRecords: 1566,
      transactionRecords: 5810249
    },
    cleanupOpportunities: [
      {
        table: 'leads',
        category: 'Test Data',
        recordCount: 12450,
        estimatedSavings: '45MB',
        recommendation: 'Archive test leads older than 6 months'
      },
      {
        table: 'sync_jobs',
        category: 'Completed Jobs',
        recordCount: 234890,
        estimatedSavings: '1.2GB',
        recommendation: 'Archive completed sync jobs older than 90 days'
      },
      {
        table: 'logs',
        category: 'Debug Logs',
        recordCount: 5678234,
        estimatedSavings: '890MB',
        recommendation: 'Clean debug logs older than 30 days'
      },
      {
        table: 'sessions',
        category: 'Expired Sessions',
        recordCount: 45670,
        estimatedSavings: '23MB',
        recommendation: 'Remove expired user sessions'
      }
    ]
  }
};

type Operation = typeof mockBulkData.availableOperations[0];

export default function BulkOperationsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [operationConfig, setOperationConfig] = useState({
    dryRun: true,
    batchSize: 100,
    notifyOnComplete: true,
    skipValidation: false,
    continueOnError: true
  });

  const categories = ['all', 'Clients', 'Leads', 'Pixels', 'Widgets', 'Billing', 'System'];

  const filteredOperations = selectedCategory === 'all' 
    ? mockBulkData.availableOperations
    : mockBulkData.availableOperations.filter(op => op.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'running': return '⏳';
      case 'failed': return '❌';
      default: return '📄';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Clients': 'bg-blue-500/10 border-blue-500/20',
      'Leads': 'bg-green-500/10 border-green-500/20',
      'Pixels': 'bg-purple-500/10 border-purple-500/20',
      'Widgets': 'bg-yellow-500/10 border-yellow-500/20',
      'Billing': 'bg-red-500/10 border-red-500/20',
      'System': 'bg-gray-500/10 border-gray-500/20'
    };
    return colors[category as keyof typeof colors] || 'bg-white/5 border-white/10';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleStartOperation = () => {
    // Simulate starting bulk operation
    alert(`Starting ${selectedOperation?.name} with ${uploadedFile?.name || 'configuration'}...`);
    setShowOperationModal(false);
    setSelectedOperation(null);
    setUploadedFile(null);
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-start justify-between space-component">
          <div className="space-element">
            <h1 className="text-heading text-white mb-2">⚡ Bulk Operations</h1>
            <p className="text-body-large text-gray-400 max-w-2xl">
              Powerful tools for managing large-scale operations, data processing, and system maintenance
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-800 border border-white/20 text-white rounded px-3 py-2 text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            <NeonButton 
              variant="secondary"
              onClick={() => router.push('/admin/monitoring')}
            >
              📊 Monitor Operations
            </NeonButton>
            <NeonButton 
              variant="secondary"
              onClick={() => router.push('/admin/dashboard')}
            >
              ← Back to Admin
            </NeonButton>
          </div>
        </div>
        
        {/* Operations Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Available Operations"
            value={mockBulkData.availableOperations.length}
            description="Operation types"
            icon="⚡"
            variant="default"
            trend="6 categories"
          />
          <StatCard
            title="Operations Today"
            value="8"
            description="Completed successfully"
            icon="✅"
            variant="success"
            trend="+2 vs yesterday"
          />
          <StatCard
            title="Records Processed"
            value="47.2K"
            description="This week"
            icon="📊"
            variant="neon"
            trend="+18% weekly"
          />
          <StatCard
            title="Success Rate"
            value="97.8%"
            description="Last 30 days"
            icon="🎯"
            variant="success"
            trend="+1.2%"
          />
        </div>

        {/* Database Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="p-6 col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Database Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-green mb-1">
                  {(mockBulkData.dataManagement.databaseStats.totalRecords / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-gray-400">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {mockBulkData.dataManagement.databaseStats.totalSize}
                </div>
                <div className="text-sm text-gray-400">Database Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">4</div>
                <div className="text-sm text-gray-400">Cleanup Opportunities</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Lead Records</div>
                <div className="text-xl font-semibold text-white">
                  {(mockBulkData.dataManagement.databaseStats.leadRecords / 1000000).toFixed(1)}M
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Pixel Records</div>
                <div className="text-xl font-semibold text-white">
                  {mockBulkData.dataManagement.databaseStats.pixelRecords.toLocaleString()}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Transaction Records</div>
                <div className="text-xl font-semibold text-white">
                  {(mockBulkData.dataManagement.databaseStats.transactionRecords / 1000000).toFixed(1)}M
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Cleanup Opportunities</h3>
            <div className="space-y-3">
              {mockBulkData.dataManagement.cleanupOpportunities.map((cleanup, index) => (
                <div key={index} className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-white">{cleanup.category}</div>
                    <div className="text-yellow-400 font-medium">{cleanup.estimatedSavings}</div>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">{cleanup.recommendation}</div>
                  <div className="text-xs text-gray-500">
                    {cleanup.recordCount.toLocaleString()} records in {cleanup.table}
                  </div>
                </div>
              ))}
              <NeonButton size="sm" className="w-full mt-4">
                🗂️ Start Cleanup
              </NeonButton>
            </div>
          </GlassCard>
        </div>

        {/* Available Operations */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Available Bulk Operations</h2>
            <NeonButton size="sm" variant="secondary">
              📁 Import Template
            </NeonButton>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOperations.map((operation) => (
              <GlassCard key={operation.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{operation.icon}</div>
                      <div>
                        <h3 className="font-semibold text-white">{operation.name}</h3>
                        <div className={`inline-block px-2 py-1 rounded text-xs ${getCategoryColor(operation.category)}`}>
                          {operation.category}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400">{operation.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Records:</span>
                      <span className="text-white">{operation.maxRecords.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Est. Time:</span>
                      <span className="text-white">{operation.estimatedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Formats:</span>
                      <span className="text-white">{operation.supportedFormats.join(', ')}</span>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <div className="text-xs text-blue-200 font-medium mb-1">Required Fields</div>
                    <div className="text-xs text-gray-300">
                      {operation.requiredFields.join(', ')}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex gap-2">
                    <NeonButton
                      onClick={() => {
                        setSelectedOperation(operation);
                        setShowOperationModal(true);
                      }}
                      className="flex-1"
                      size="sm"
                    >
                      🚀 Start Operation
                    </NeonButton>
                    <NeonButton
                      variant="secondary"
                      size="sm"
                    >
                      📄 Template
                    </NeonButton>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Recent Operations */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Operations</h3>
            <NeonButton size="sm" variant="secondary">
              View All History
            </NeonButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Operation</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Records</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Success Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Started By</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockBulkData.recentOperations.map((operation) => (
                  <tr key={operation.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-medium">{operation.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(operation.status) as any} size="sm">
                          {getStatusIcon(operation.status)} {operation.status}
                        </Badge>
                        {operation.status === 'running' && operation.progress && (
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-neon-green h-2 rounded-full"
                              style={{ width: `${operation.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {operation.processedRecords.toLocaleString()}/{operation.totalRecords.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={operation.successfulRecords / operation.processedRecords >= 0.95 ? 'text-green-400' : 'text-yellow-400'}>
                        {((operation.successfulRecords / operation.processedRecords) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{operation.startedBy}</td>
                    <td className="py-3 px-4 text-gray-300">
                      {operation.duration ? `${Math.floor(operation.duration / 60)}:${(operation.duration % 60).toString().padStart(2, '0')}` : 'Running...'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <NeonButton size="sm" variant="secondary">
                          📊 Details
                        </NeonButton>
                        {operation.status === 'failed' && (
                          <NeonButton size="sm" variant="secondary">
                            🔄 Retry
                          </NeonButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Start Operation Modal */}
        {showOperationModal && selectedOperation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/20 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Start Operation: {selectedOperation.name}
                  </h3>
                  <button
                    onClick={() => {
                      setShowOperationModal(false);
                      setSelectedOperation(null);
                      setUploadedFile(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-white mb-3">Data Upload</h4>
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="file-upload"
                        onChange={handleFileUpload}
                        accept=".csv,.xlsx,.json,.xml"
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="text-4xl mb-4">📁</div>
                        <div className="text-white mb-2">
                          {uploadedFile ? uploadedFile.name : 'Click to upload file or drag and drop'}
                        </div>
                        <div className="text-sm text-gray-400">
                          Supported: {selectedOperation.supportedFormats.join(', ')} (Max {selectedOperation.maxRecords.toLocaleString()} records)
                        </div>
                      </label>
                    </div>
                    {uploadedFile && (
                      <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">{uploadedFile.name}</div>
                            <div className="text-sm text-gray-400">
                              {formatBytes(uploadedFile.size)} • Uploaded successfully
                            </div>
                          </div>
                          <button
                            onClick={() => setUploadedFile(null)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-3">Operation Configuration</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-white">Dry Run (Preview only)</span>
                        <input
                          type="checkbox"
                          checked={operationConfig.dryRun}
                          onChange={(e) => setOperationConfig({...operationConfig, dryRun: e.target.checked})}
                          className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 rounded focus:ring-neon-green focus:ring-2"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-white">Continue on errors</span>
                        <input
                          type="checkbox"
                          checked={operationConfig.continueOnError}
                          onChange={(e) => setOperationConfig({...operationConfig, continueOnError: e.target.checked})}
                          className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 rounded focus:ring-neon-green focus:ring-2"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-white">Notify on completion</span>
                        <input
                          type="checkbox"
                          checked={operationConfig.notifyOnComplete}
                          onChange={(e) => setOperationConfig({...operationConfig, notifyOnComplete: e.target.checked})}
                          className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 rounded focus:ring-neon-green focus:ring-2"
                        />
                      </label>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Batch Size</span>
                        <select
                          value={operationConfig.batchSize}
                          onChange={(e) => setOperationConfig({...operationConfig, batchSize: parseInt(e.target.value)})}
                          className="bg-gray-800 border border-white/20 text-white rounded px-3 py-1 text-sm"
                        >
                          <option value={50}>50 records</option>
                          <option value={100}>100 records</option>
                          <option value={200}>200 records</option>
                          <option value={500}>500 records</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="text-sm text-yellow-200 font-medium mb-2">Required Fields</div>
                    <div className="text-xs text-gray-300 mb-2">
                      Make sure your file includes these required columns:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedOperation.requiredFields.map(field => (
                        <span key={field} className="bg-yellow-500/20 px-2 py-1 rounded text-xs text-yellow-200">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="text-sm text-blue-200 font-medium mb-2">
                      Estimated Processing Time: {selectedOperation.estimatedTime}
                    </div>
                    <div className="text-xs text-gray-400">
                      This operation can process up to {selectedOperation.maxRecords.toLocaleString()} records
                      {operationConfig.dryRun && ' (Dry run will be much faster)'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <NeonButton
                    variant="secondary"
                    onClick={() => {
                      setShowOperationModal(false);
                      setSelectedOperation(null);
                      setUploadedFile(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </NeonButton>
                  <NeonButton
                    onClick={handleStartOperation}
                    className="flex-1"
                    disabled={!uploadedFile}
                  >
                    {operationConfig.dryRun ? '👁️ Preview' : '🚀 Start Operation'}
                  </NeonButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}