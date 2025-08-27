'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { InteractiveCard } from '@/components/ui/InteractiveCard';
import { usePermissions } from '@/contexts/UserContext';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';

// Mock log entry interface
interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
  details?: any;
  userId?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}

// Mock log data
const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-08-26T18:52:15.123Z',
    level: 'info',
    source: 'API Gateway',
    message: 'User authentication successful',
    details: { endpoint: '/api/auth/user', method: 'POST', statusCode: 200 },
    userId: 'user_123',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    requestId: 'req_abc123'
  },
  {
    id: '2',
    timestamp: '2024-08-26T18:51:45.456Z',
    level: 'error',
    source: 'Credit API',
    message: 'Credit pull request failed - timeout',
    details: { endpoint: '/api/leads/123/credit-pull', timeout: '30s', retryCount: 3 },
    userId: 'user_456',
    ip: '192.168.1.101',
    requestId: 'req_def456'
  },
  {
    id: '3',
    timestamp: '2024-08-26T18:51:30.789Z',
    level: 'warn',
    source: 'Background Jobs',
    message: 'Queue size approaching limit',
    details: { queueName: 'pixel-sync', currentSize: 850, maxSize: 1000 },
    requestId: 'job_ghi789'
  },
  {
    id: '4',
    timestamp: '2024-08-26T18:51:12.234Z',
    level: 'info',
    source: 'Pixel Sync',
    message: 'Successfully synced lead to Meta pixel',
    details: { leadId: 'lead_789', pixelId: 'pixel_meta_123', eventType: 'Lead' },
    userId: 'user_789',
    requestId: 'req_jkl012'
  },
  {
    id: '5',
    timestamp: '2024-08-26T18:50:55.567Z',
    level: 'debug',
    source: 'Database',
    message: 'Query execution completed',
    details: { query: 'SELECT * FROM leads WHERE status = $1', executionTime: '45ms', rowCount: 150 },
    requestId: 'req_mno345'
  },
  {
    id: '6',
    timestamp: '2024-08-26T18:50:40.890Z',
    level: 'error',
    source: 'Email Service',
    message: 'Failed to send notification email',
    details: { recipient: 'user@example.com', template: 'lead-qualified', errorCode: 'SMTP_ERROR' },
    userId: 'user_101',
    requestId: 'req_pqr678'
  },
  {
    id: '7',
    timestamp: '2024-08-26T18:50:25.123Z',
    level: 'info',
    source: 'Webhook',
    message: 'Webhook delivery successful',
    details: { url: 'https://client.com/webhook', statusCode: 200, responseTime: '250ms' },
    userId: 'user_202',
    requestId: 'req_stu901'
  },
  {
    id: '8',
    timestamp: '2024-08-26T18:50:10.456Z',
    level: 'warn',
    source: 'API Rate Limiter',
    message: 'Rate limit exceeded for user',
    details: { userId: 'user_303', endpoint: '/api/leads', requestCount: 101, limit: 100 },
    userId: 'user_303',
    ip: '192.168.1.105',
    requestId: 'req_vwx234'
  }
];

export default function AdminLogsPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'debug'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  // Check if user has admin access
  if (!hasPermission('platformAdminAccess')) {
    return (
      <AppShell
        headerTitle="Access Denied"
        headerSubtitle="This feature is restricted to platform administrators"
      >
        <div className="p-6 max-w-2xl mx-auto text-center">
          <GlassCard className="p-8">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-400 mb-6">
              System Logs are restricted to platform administrators only.
            </p>
            <NeonButton onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </NeonButton>
          </GlassCard>
        </div>
      </AppShell>
    );
  }

  // Auto-refresh logs
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // In a real app, this would fetch new logs from the API
      // For demo, we'll just add a new mock log entry occasionally
      if (Math.random() < 0.3) {
        const newLog: LogEntry = {
          id: `new_${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: Math.random() > 0.8 ? 'error' : Math.random() > 0.6 ? 'warn' : 'info',
          source: ['API Gateway', 'Database', 'Credit API', 'Email Service'][Math.floor(Math.random() * 4)]!,
          message: 'Auto-generated log entry for demo',
          requestId: `req_${Math.random().toString(36).substr(2, 9)}`
        };
        
        setLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep only latest 100 logs
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter logs based on search and filters
  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.requestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(log => log.source === sourceFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, levelFilter, sourceFilter]);


  const getLevelVariant = (level: string) => {
    switch (level) {
      case 'info': return 'info';
      case 'warn': return 'warning';
      case 'error': return 'error';
      case 'debug': return 'default';
      default: return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const uniqueSources = Array.from(new Set(logs.map(log => log.source)));
  const logCounts = {
    total: filteredLogs.length,
    info: filteredLogs.filter(l => l.level === 'info').length,
    warn: filteredLogs.filter(l => l.level === 'warn').length,
    error: filteredLogs.filter(l => l.level === 'error').length,
    debug: filteredLogs.filter(l => l.level === 'debug').length,
  };

  return (
    <AppShell
      headerTitle="System Logs"
      headerSubtitle="Real-time system logs and application monitoring"
      headerActions={
        <div className="flex gap-2">
          <NeonButton 
            variant="secondary"
            onClick={() => router.push('/admin')}
          >
            ← Back to Admin
          </NeonButton>
          <NeonButton 
            variant={autoRefresh ? 'primary' : 'secondary'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
          </NeonButton>
          <NeonButton onClick={() => console.log('Export logs')}>
            📥 Export
          </NeonButton>
        </div>
      }
    >
      <div className="p-6 space-y-8 max-w-7xl mx-auto">

        {/* Log Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="text-lg font-bold text-white mb-2">Total</h3>
              <div className="text-2xl font-bold text-neon-green">{logCounts.total}</div>
            </GlassCard>
          </InteractiveCard>
          
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">ℹ️</div>
              <h3 className="text-lg font-bold text-white mb-2">Info</h3>
              <div className="text-2xl font-bold text-blue-400">{logCounts.info}</div>
            </GlassCard>
          </InteractiveCard>
          
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold text-white mb-2">Warnings</h3>
              <div className="text-2xl font-bold text-yellow-400">{logCounts.warn}</div>
            </GlassCard>
          </InteractiveCard>
          
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">🚨</div>
              <h3 className="text-lg font-bold text-white mb-2">Errors</h3>
              <div className="text-2xl font-bold text-red-400">{logCounts.error}</div>
            </GlassCard>
          </InteractiveCard>
          
          <InteractiveCard hoverEffect="glow">
            <GlassCard className="p-6 text-center">
              <div className="text-3xl mb-3">🐛</div>
              <h3 className="text-lg font-bold text-white mb-2">Debug</h3>
              <div className="text-2xl font-bold text-gray-400">{logCounts.debug}</div>
            </GlassCard>
          </InteractiveCard>
        </div>

        {/* Search and Filters */}
        <GlassCard className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField label="Search Logs">
              <Input
                type="text"
                placeholder="Search messages, sources, IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </FormField>
            
            <FormField label="Level Filter">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="info">Info</option>
                <option value="warn">Warnings</option>
                <option value="error">Errors</option>
                <option value="debug">Debug</option>
              </select>
            </FormField>
            
            <FormField label="Source Filter">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
              >
                <option value="all">All Sources</option>
                {uniqueSources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </FormField>
            
            <div className="flex items-end">
              <NeonButton 
                variant="secondary" 
                onClick={() => {
                  setSearchTerm('');
                  setLevelFilter('all');
                  setSourceFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </NeonButton>
            </div>
          </div>
        </GlassCard>

        {/* Logs List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Log Entries */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Log Entries ({filteredLogs.length})
                </h2>
                <div className="flex items-center gap-2">
                  {autoRefresh && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-400">Live</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 max-h-[800px] overflow-y-auto">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant={getLevelVariant(log.level)} size="sm">
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-400">{log.source}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-white text-sm mb-2">{log.message}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {log.requestId && (
                        <span>Request: {log.requestId}</span>
                      )}
                      {log.userId && (
                        <span>User: {log.userId}</span>
                      )}
                      {log.ip && (
                        <span>IP: {log.ip}</span>
                      )}
                    </div>
                  </div>
                ))}

                {filteredLogs.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-bold text-white mb-2">No Logs Found</h3>
                    <p className="text-gray-400">
                      {searchTerm || levelFilter !== 'all' || sourceFilter !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'No logs available at this time'
                      }
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Log Details */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6 sticky top-6">
              {selectedLog ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Log Details</h3>
                    <button
                      onClick={() => setSelectedLog(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Timestamp</label>
                      <p className="text-white">{formatTimestamp(selectedLog.timestamp)}</p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400">Level</label>
                      <div className="mt-1">
                        <Badge variant={getLevelVariant(selectedLog.level)} size="sm">
                          {selectedLog.level.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400">Source</label>
                      <p className="text-white">{selectedLog.source}</p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400">Message</label>
                      <p className="text-white">{selectedLog.message}</p>
                    </div>

                    {selectedLog.requestId && (
                      <div>
                        <label className="text-sm text-gray-400">Request ID</label>
                        <p className="text-white font-mono text-sm">{selectedLog.requestId}</p>
                      </div>
                    )}

                    {selectedLog.userId && (
                      <div>
                        <label className="text-sm text-gray-400">User ID</label>
                        <p className="text-white font-mono text-sm">{selectedLog.userId}</p>
                      </div>
                    )}

                    {selectedLog.ip && (
                      <div>
                        <label className="text-sm text-gray-400">IP Address</label>
                        <p className="text-white font-mono text-sm">{selectedLog.ip}</p>
                      </div>
                    )}

                    {selectedLog.details && (
                      <div>
                        <label className="text-sm text-gray-400">Details</label>
                        <pre className="text-xs bg-black/30 p-3 rounded mt-2 overflow-x-auto">
                          <code className="text-green-400">
                            {JSON.stringify(selectedLog.details, null, 2)}
                          </code>
                        </pre>
                      </div>
                    )}

                    <div className="pt-4 border-t border-white/10">
                      <NeonButton size="sm" variant="secondary" className="w-full">
                        View Related Logs
                      </NeonButton>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👈</div>
                  <h3 className="text-lg font-bold text-white mb-2">Select a Log</h3>
                  <p className="text-gray-400 text-sm">
                    Click on any log entry to view detailed information
                  </p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}