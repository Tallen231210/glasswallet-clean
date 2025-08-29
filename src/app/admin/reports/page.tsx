'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Input } from '@/components/ui/Input';

// Mock reports data
const mockReportsData = {
  availableReports: [
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'High-level business metrics and KPIs for leadership team',
      category: 'Business',
      icon: '📊',
      estimatedTime: '2-3 minutes',
      dataPoints: 25,
      lastGenerated: '2024-08-29T09:00:00Z',
      frequency: 'Weekly'
    },
    {
      id: 'client-performance',
      name: 'Client Performance Report',
      description: 'Detailed client analytics including revenue, leads, and engagement metrics',
      category: 'Analytics',
      icon: '👥',
      estimatedTime: '3-5 minutes',
      dataPoints: 45,
      lastGenerated: '2024-08-29T08:30:00Z',
      frequency: 'Monthly'
    },
    {
      id: 'platform-insights',
      name: 'Platform Integration Insights',
      description: 'Performance metrics across Meta, Google Ads, and TikTok integrations',
      category: 'Technical',
      icon: '🔌',
      estimatedTime: '4-6 minutes',
      dataPoints: 38,
      lastGenerated: '2024-08-28T16:45:00Z',
      frequency: 'Bi-weekly'
    },
    {
      id: 'financial-analysis',
      name: 'Financial Analysis',
      description: 'Revenue trends, churn analysis, and financial forecasting',
      category: 'Finance',
      icon: '💰',
      estimatedTime: '5-7 minutes',
      dataPoints: 52,
      lastGenerated: '2024-08-27T14:20:00Z',
      frequency: 'Monthly'
    },
    {
      id: 'system-health',
      name: 'System Health Report',
      description: 'Infrastructure metrics, uptime, performance, and security insights',
      category: 'Technical',
      icon: '🔍',
      estimatedTime: '2-4 minutes',
      dataPoints: 28,
      lastGenerated: '2024-08-29T06:00:00Z',
      frequency: 'Daily'
    },
    {
      id: 'lead-quality',
      name: 'Lead Quality Assessment',
      description: 'Lead scoring, conversion paths, and quality optimization insights',
      category: 'Analytics',
      icon: '🎯',
      estimatedTime: '4-5 minutes',
      dataPoints: 35,
      lastGenerated: '2024-08-28T11:15:00Z',
      frequency: 'Weekly'
    }
  ],
  recentReports: [
    {
      id: 'rpt-001',
      name: 'Executive Summary',
      type: 'executive-summary',
      status: 'completed' as const,
      generatedBy: 'System Scheduler',
      generatedAt: '2024-08-29T09:00:00Z',
      fileSize: '2.4MB',
      format: 'PDF',
      downloadCount: 12,
      shared: true
    },
    {
      id: 'rpt-002',
      name: 'Client Performance Q3 2024',
      type: 'client-performance',
      status: 'completed' as const,
      generatedBy: 'Admin User',
      generatedAt: '2024-08-29T08:30:00Z',
      fileSize: '5.7MB',
      format: 'Excel',
      downloadCount: 8,
      shared: false
    },
    {
      id: 'rpt-003',
      name: 'Platform Integration Analysis',
      type: 'platform-insights',
      status: 'generating' as const,
      generatedBy: 'System Scheduler',
      generatedAt: '2024-08-29T10:45:00Z',
      fileSize: '',
      format: 'PDF',
      downloadCount: 0,
      shared: false,
      progress: 67
    },
    {
      id: 'rpt-004',
      name: 'Daily System Health',
      type: 'system-health',
      status: 'completed' as const,
      generatedBy: 'System Scheduler',
      generatedAt: '2024-08-29T06:00:00Z',
      fileSize: '1.8MB',
      format: 'JSON',
      downloadCount: 3,
      shared: true
    },
    {
      id: 'rpt-005',
      name: 'Financial Forecast Aug 2024',
      type: 'financial-analysis',
      status: 'failed' as const,
      generatedBy: 'Admin User',
      generatedAt: '2024-08-28T15:20:00Z',
      fileSize: '',
      format: 'PDF',
      downloadCount: 0,
      shared: false,
      error: 'Data source connection timeout'
    }
  ],
  scheduledReports: [
    {
      id: 'schedule-001',
      reportType: 'executive-summary',
      name: 'Weekly Executive Summary',
      frequency: 'weekly',
      nextRun: '2024-09-02T09:00:00Z',
      recipients: ['ceo@company.com', 'cto@company.com'],
      format: 'PDF',
      status: 'active' as const
    },
    {
      id: 'schedule-002',
      reportType: 'system-health',
      name: 'Daily System Health Check',
      frequency: 'daily',
      nextRun: '2024-08-30T06:00:00Z',
      recipients: ['devops@company.com', 'admin@company.com'],
      format: 'JSON',
      status: 'active' as const
    },
    {
      id: 'schedule-003',
      reportType: 'client-performance',
      name: 'Monthly Client Review',
      frequency: 'monthly',
      nextRun: '2024-09-01T08:00:00Z',
      recipients: ['sales@company.com', 'success@company.com'],
      format: 'Excel',
      status: 'paused' as const
    }
  ]
};

type Report = typeof mockReportsData.availableReports[0];

export default function AdminReportsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    format: 'PDF',
    timeRange: '30d',
    includeCharts: true,
    includeRawData: false,
    recipients: '' as string,
    scheduledDelivery: false
  });

  const categories = ['all', 'Business', 'Analytics', 'Technical', 'Finance'];

  const filteredReports = selectedCategory === 'all' 
    ? mockReportsData.availableReports
    : mockReportsData.availableReports.filter(report => report.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'generating': return 'warning';
      case 'failed': return 'error';
      case 'active': return 'success';
      case 'paused': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'generating': return '⏳';
      case 'failed': return '❌';
      case 'active': return '🟢';
      case 'paused': return '⏸️';
      default: return '📄';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Business': return 'bg-blue-500/10 border-blue-500/20';
      case 'Analytics': return 'bg-green-500/10 border-green-500/20';
      case 'Technical': return 'bg-purple-500/10 border-purple-500/20';
      case 'Finance': return 'bg-yellow-500/10 border-yellow-500/20';
      default: return 'bg-white/5 border-white/10';
    }
  };

  const handleGenerateReport = () => {
    // Simulate report generation
    alert(`Generating ${selectedReport?.name} report with the specified configuration...`);
    setShowGenerateModal(false);
    setSelectedReport(null);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-start justify-between space-component">
          <div className="space-element">
            <h1 className="text-heading text-white mb-2">📄 Report Generation</h1>
            <p className="text-body-large text-gray-400 max-w-2xl">
              Generate comprehensive reports, manage automated scheduling, and export business intelligence data
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
              onClick={() => router.push('/admin/analytics')}
            >
              📊 View Analytics
            </NeonButton>
            <NeonButton 
              variant="secondary"
              onClick={() => router.push('/admin/dashboard')}
            >
              ← Back to Admin
            </NeonButton>
          </div>
        </div>
        
        {/* Report Generation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Available Reports"
            value={mockReportsData.availableReports.length}
            description="Report templates"
            icon="📊"
            variant="default"
            trend="6 report types"
          />
          <StatCard
            title="Generated Today"
            value="12"
            description="Reports completed"
            icon="📄"
            variant="success"
            trend="+4 vs yesterday"
          />
          <StatCard
            title="Scheduled Reports"
            value={mockReportsData.scheduledReports.length}
            description="Automated delivery"
            icon="⏰"
            variant="neon"
            trend="2 active schedules"
          />
          <StatCard
            title="Total Downloads"
            value="1,847"
            description="This month"
            icon="⬇️"
            variant="success"
            trend="+23% MoM"
          />
        </div>

        {/* Available Reports */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Available Report Templates</h2>
            <NeonButton size="sm" variant="secondary">
              + Create Custom Report
            </NeonButton>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <GlassCard key={report.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{report.icon}</div>
                      <div>
                        <h3 className="font-semibold text-white">{report.name}</h3>
                        <div className={`inline-block px-2 py-1 rounded text-xs ${getCategoryColor(report.category)}`}>
                          {report.category}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400">{report.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Generation Time:</span>
                      <span className="text-white">{report.estimatedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Data Points:</span>
                      <span className="text-white">{report.dataPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Update Frequency:</span>
                      <span className="text-white">{report.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Generated:</span>
                      <span className="text-white">
                        {new Date(report.lastGenerated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <NeonButton
                      onClick={() => {
                        setSelectedReport(report);
                        setShowGenerateModal(true);
                      }}
                      className="w-full"
                      size="sm"
                    >
                      📊 Generate Report
                    </NeonButton>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Reports</h3>
            <NeonButton size="sm" variant="secondary">
              View All Reports
            </NeonButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Report Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Generated By</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Generated At</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Size</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Downloads</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockReportsData.recentReports.map((report) => (
                  <tr key={report.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-medium">{report.name}</td>
                    <td className="py-3 px-4 text-gray-300">{report.format}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(report.status) as any} size="sm">
                          {getStatusIcon(report.status)} {report.status}
                        </Badge>
                        {report.status === 'generating' && report.progress && (
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-neon-green h-2 rounded-full"
                              style={{ width: `${report.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{report.generatedBy}</td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(report.generatedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-300">{report.fileSize || 'N/A'}</td>
                    <td className="py-3 px-4 text-neon-green">{report.downloadCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {report.status === 'completed' && (
                          <NeonButton size="sm" variant="secondary">
                            ⬇️ Download
                          </NeonButton>
                        )}
                        {report.status === 'failed' && (
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

        {/* Scheduled Reports */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Scheduled Reports</h3>
            <NeonButton size="sm" variant="secondary">
              + Create Schedule
            </NeonButton>
          </div>

          <div className="space-y-4">
            {mockReportsData.scheduledReports.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-white">{schedule.name}</h4>
                    <Badge variant={getStatusColor(schedule.status) as any} size="sm">
                      {getStatusIcon(schedule.status)} {schedule.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                    <div>
                      <span className="font-medium">Frequency:</span> {schedule.frequency}
                    </div>
                    <div>
                      <span className="font-medium">Next Run:</span> {' '}
                      {new Date(schedule.nextRun).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Recipients:</span> {schedule.recipients.length}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <NeonButton size="sm" variant="secondary">
                    ✏️ Edit
                  </NeonButton>
                  <NeonButton size="sm" variant="secondary">
                    {schedule.status === 'active' ? '⏸️' : '▶️'}
                  </NeonButton>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Generate Report Modal */}
        {showGenerateModal && selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/20 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Generate Report: {selectedReport.name}
                  </h3>
                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      setSelectedReport(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-white mb-3">Report Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Output Format</label>
                        <select
                          value={reportConfig.format}
                          onChange={(e) => setReportConfig({...reportConfig, format: e.target.value})}
                          className="w-full bg-gray-800 border border-white/20 text-white rounded px-3 py-2"
                        >
                          <option value="PDF">PDF Document</option>
                          <option value="Excel">Excel Spreadsheet</option>
                          <option value="JSON">JSON Data</option>
                          <option value="CSV">CSV Export</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Time Range</label>
                        <select
                          value={reportConfig.timeRange}
                          onChange={(e) => setReportConfig({...reportConfig, timeRange: e.target.value})}
                          className="w-full bg-gray-800 border border-white/20 text-white rounded px-3 py-2"
                        >
                          <option value="7d">Last 7 Days</option>
                          <option value="30d">Last 30 Days</option>
                          <option value="90d">Last 90 Days</option>
                          <option value="12m">Last 12 Months</option>
                          <option value="all">All Time</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-3">Content Options</h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={reportConfig.includeCharts}
                          onChange={(e) => setReportConfig({...reportConfig, includeCharts: e.target.checked})}
                          className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 rounded focus:ring-neon-green focus:ring-2"
                        />
                        <span className="text-white">Include Charts and Visualizations</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={reportConfig.includeRawData}
                          onChange={(e) => setReportConfig({...reportConfig, includeRawData: e.target.checked})}
                          className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 rounded focus:ring-neon-green focus:ring-2"
                        />
                        <span className="text-white">Include Raw Data Tables</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={reportConfig.scheduledDelivery}
                          onChange={(e) => setReportConfig({...reportConfig, scheduledDelivery: e.target.checked})}
                          className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 rounded focus:ring-neon-green focus:ring-2"
                        />
                        <span className="text-white">Schedule Automated Delivery</span>
                      </label>
                    </div>
                  </div>

                  {reportConfig.scheduledDelivery && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email Recipients (comma-separated)</label>
                      <Input
                        value={reportConfig.recipients}
                        onChange={(e) => setReportConfig({...reportConfig, recipients: e.target.value})}
                        placeholder="admin@company.com, team@company.com"
                        className="w-full"
                      />
                    </div>
                  )}

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="text-sm text-blue-200 font-medium mb-2">Estimated Generation Time</div>
                    <div className="text-white">{selectedReport.estimatedTime}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      This report will include {selectedReport.dataPoints} data points across the selected time range
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <NeonButton
                    variant="secondary"
                    onClick={() => {
                      setShowGenerateModal(false);
                      setSelectedReport(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </NeonButton>
                  <NeonButton
                    onClick={handleGenerateReport}
                    className="flex-1"
                  >
                    🚀 Generate Report
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