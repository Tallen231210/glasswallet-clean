'use client';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { SimpleToast } from '@/components/ui/SimpleToast';
import { mockLeads } from '@/lib/mockData';

interface CreditReport {
  score: number;
  scoreRange: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  accountHistory: {
    totalAccounts: number;
    openAccounts: number;
    closedAccounts: number;
    delinquentAccounts: number;
  };
  creditUtilization: number;
  paymentHistory: number;
  creditAge: number;
  hardInquiries: number;
  publicRecords: number;
  generatedAt: string;
}

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;

  // Find the lead in mock data
  const lead = mockLeads.find(l => l.id === leadId);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [creditReport, setCreditReport] = useState<CreditReport | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // Generate a realistic mock credit report
  const generateMockCreditReport = (leadCreditScore?: number): CreditReport => {
    const score = leadCreditScore || Math.floor(Math.random() * 300) + 500; // 500-800
    
    let scoreRange: string;
    let riskLevel: 'Low' | 'Medium' | 'High';
    
    if (score >= 750) {
      scoreRange = 'Excellent (750-850)';
      riskLevel = 'Low';
    } else if (score >= 700) {
      scoreRange = 'Good (700-749)';
      riskLevel = 'Low';
    } else if (score >= 650) {
      scoreRange = 'Fair (650-699)';
      riskLevel = 'Medium';
    } else {
      scoreRange = 'Poor (300-649)';
      riskLevel = 'High';
    }
    
    return {
      score,
      scoreRange,
      riskLevel,
      accountHistory: {
        totalAccounts: Math.floor(Math.random() * 15) + 5,
        openAccounts: Math.floor(Math.random() * 8) + 3,
        closedAccounts: Math.floor(Math.random() * 7) + 2,
        delinquentAccounts: score < 650 ? Math.floor(Math.random() * 3) : 0,
      },
      creditUtilization: Math.floor(Math.random() * 60) + 10,
      paymentHistory: Math.floor(Math.random() * 20) + 80,
      creditAge: Math.floor(Math.random() * 120) + 24, // months
      hardInquiries: Math.floor(Math.random() * 5),
      publicRecords: score < 600 ? Math.floor(Math.random() * 2) : 0,
      generatedAt: new Date().toISOString(),
    };
  };

  // Load existing credit report if available
  useEffect(() => {
    if (lead && lead.creditScore) {
      setCreditReport(generateMockCreditReport(lead.creditScore));
    }
  }, [lead]);

  if (!lead) {
    return (
      <AppLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <GlassCard className="p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-3xl">❌</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Lead Not Found</h2>
            <p className="text-gray-400 mb-6">The lead you're looking for doesn't exist.</p>
            <NeonButton onClick={() => router.push('/leads')}>
              Back to Leads
            </NeonButton>
          </GlassCard>
        </div>
      </AppLayout>
    );
  }

  const handleCreditPull = async () => {
    setIsProcessing(true);
    try {
      // Simulate realistic API delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate new credit report
      const newCreditReport = generateMockCreditReport();
      setCreditReport(newCreditReport);
      
      // Simulate adding transaction record
      const transaction = {
        id: `txn-${Date.now()}`,
        type: 'credit-pull',
        costInCents: 299, // $2.99
        status: 'completed',
        createdAt: new Date().toISOString(),
        creditScore: newCreditReport.score,
      };
      
      setCreditTransactions(prev => [transaction, ...prev]);
      showNotification(
        `🎉 Credit report generated! Score: ${newCreditReport.score} (${newCreditReport.riskLevel} Risk)`,
        'success'
      );
      
    } catch (error) {
      console.error('Credit pull error:', error);
      showNotification('Failed to pull credit report. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'qualified': return 'success';
      case 'processing': return 'warning';
      case 'completed': return 'neon';
      case 'new': return 'default';
      default: return 'default';
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading text-white mb-2">
              👤 {lead.firstName} {lead.lastName}
            </h1>
            <p className="text-body-large text-gray-400">
              Detailed lead profile and credit qualification dashboard
            </p>
          </div>
          <div className="flex gap-3">
            <NeonButton variant="secondary" onClick={() => router.push('/leads')}>
              Back to Leads
            </NeonButton>
            <NeonButton 
              onClick={handleCreditPull} 
              disabled={isProcessing}
              className={isProcessing ? 'animate-pulse' : ''}
            >
              {isProcessing ? '⏳ Processing...' : '💳 Pull Credit Report'}
            </NeonButton>
          </div>
        </div>

        {/* Lead Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Lead Status"
            value={lead.status}
            description="Current stage"
            icon="📋"
            variant={getStatusColor(lead.status) as any}
          />
          <StatCard
            title="Credit Score"
            value={creditReport?.score || lead.creditScore || 'Not Pulled'}
            description={creditReport?.scoreRange || 'FICO score'}
            icon="📊"
            variant={creditReport?.score || lead.creditScore ? 'success' : 'default'}
          />
          <StatCard
            title="Lead Source"
            value={lead.source}
            description="Acquisition channel"
            icon="📡"
            variant="neon"
          />
          <StatCard
            title="Days Active"
            value={Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
            description="Since creation"
            icon="⏰"
            variant="default"
          />
        </div>

        {/* Lead Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Personal Information */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">👤 Personal Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Full Name:</span>
                <span className="text-white font-medium">{lead.firstName} {lead.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{lead.email}</span>
              </div>
              {lead.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone:</span>
                  <span className="text-white">{lead.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <Badge variant={getStatusColor(lead.status) as any}>
                  {lead.status}
                </Badge>
              </div>
            </div>
          </GlassCard>

          {/* Lead Analytics */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📈 Lead Analytics</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Created:</span>
                <span className="text-white">{new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Updated:</span>
                <span className="text-white">{new Date(lead.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Source:</span>
                <Badge variant="neon">{lead.source}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {lead.tags.map((tag) => (
                    <Badge key={tag} variant="default" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

        </div>

        {/* Notes and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Notes */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📝 Notes</h3>
            <div className="space-y-4">
              {lead.notes && (
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-gray-300 text-sm">{lead.notes}</p>
                </div>
              )}
              {lead.qualificationNotes && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="text-green-300 font-medium mb-1">Qualification Notes</h4>
                  <p className="text-green-200 text-sm">{lead.qualificationNotes}</p>
                </div>
              )}
              {!lead.notes && !lead.qualificationNotes && (
                <p className="text-gray-400 text-sm italic">No notes available</p>
              )}
            </div>
          </GlassCard>

          {/* Actions */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🚀 Actions</h3>
            <div className="space-y-3">
              <NeonButton className="w-full justify-start" onClick={handleCreditPull} disabled={isProcessing}>
                💳 {isProcessing ? 'Processing Credit Pull...' : 'Pull Credit Report'}
              </NeonButton>
              <NeonButton variant="secondary" className="w-full justify-start">
                📧 Send Email
              </NeonButton>
              <NeonButton variant="secondary" className="w-full justify-start">
                📞 Schedule Call
              </NeonButton>
              <NeonButton variant="secondary" className="w-full justify-start">
                🏷️ Add Tags
              </NeonButton>
              <NeonButton variant="secondary" className="w-full justify-start">
                📝 Add Note
              </NeonButton>
            </div>
          </GlassCard>
        </div>

        {/* Credit Report Section */}
        {creditReport && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-subheading text-white">📊 Credit Report Analysis</h2>
              <Badge 
                variant={creditReport.riskLevel === 'Low' ? 'success' : 
                       creditReport.riskLevel === 'Medium' ? 'warning' : 'error'}
              >
                {creditReport.riskLevel} Risk
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Credit Score Breakdown */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">🎯 Credit Score Breakdown</h3>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-neon-green/10 rounded-lg border border-neon-green/20">
                    <div className="text-4xl font-bold text-neon-green mb-2">
                      {creditReport.score}
                    </div>
                    <div className="text-sm text-neon-green/80">
                      {creditReport.scoreRange}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Payment History</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${creditReport.paymentHistory}%` }}
                          />
                        </div>
                        <span className="text-white text-sm">{creditReport.paymentHistory}%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Credit Utilization</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              creditReport.creditUtilization > 30 ? 'bg-red-500' : 
                              creditReport.creditUtilization > 15 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(creditReport.creditUtilization, 100)}%` }}
                          />
                        </div>
                        <span className="text-white text-sm">{creditReport.creditUtilization}%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Credit Age</span>
                      <span className="text-white">{Math.floor(creditReport.creditAge / 12)} years {creditReport.creditAge % 12} months</span>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Account Overview */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">🏦 Account Overview</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {creditReport.accountHistory.totalAccounts}
                      </div>
                      <div className="text-sm text-gray-400">Total Accounts</div>
                    </div>
                    <div className="text-center p-3 bg-green-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">
                        {creditReport.accountHistory.openAccounts}
                      </div>
                      <div className="text-sm text-green-300">Open Accounts</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Closed Accounts:</span>
                      <span className="text-white">{creditReport.accountHistory.closedAccounts}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Delinquent Accounts:</span>
                      <span className={`font-medium ${
                        creditReport.accountHistory.delinquentAccounts > 0 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {creditReport.accountHistory.delinquentAccounts}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hard Inquiries:</span>
                      <span className={`font-medium ${
                        creditReport.hardInquiries > 2 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {creditReport.hardInquiries}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Public Records:</span>
                      <span className={`font-medium ${
                        creditReport.publicRecords > 0 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {creditReport.publicRecords}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Risk Assessment */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">⚠️ Risk Assessment & Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border ${
                  creditReport.riskLevel === 'Low' ? 'bg-green-500/10 border-green-500/20' :
                  creditReport.riskLevel === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
                  'bg-red-500/10 border-red-500/20'
                }`}>
                  <div className="text-center">
                    <div className={`text-3xl mb-2 ${
                      creditReport.riskLevel === 'Low' ? 'text-green-400' :
                      creditReport.riskLevel === 'Medium' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {creditReport.riskLevel === 'Low' ? '✅' : 
                       creditReport.riskLevel === 'Medium' ? '⚠️' : '⛔'}
                    </div>
                    <div className={`font-bold ${
                      creditReport.riskLevel === 'Low' ? 'text-green-300' :
                      creditReport.riskLevel === 'Medium' ? 'text-yellow-300' :
                      'text-red-300'
                    }`}>
                      {creditReport.riskLevel} Risk
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Qualification Status</h4>
                  <p className="text-sm text-gray-300">
                    {creditReport.score >= 700 ? 'Pre-approved for premium products' :
                     creditReport.score >= 650 ? 'Qualified with standard terms' :
                     'May require additional documentation'}
                  </p>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Report Generated</h4>
                  <p className="text-sm text-gray-300">
                    {new Date(creditReport.generatedAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-neon-green mt-1">
                    FCRA Compliant ✓
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Credit Transaction History */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">💳 Credit Transaction History</h3>
          <div className="space-y-3">
            {creditTransactions.length > 0 ? (
              creditTransactions.map((transaction: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Credit Pull</p>
                    <p className="text-gray-400 text-sm">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-300">-${(transaction.costInCents / 100).toFixed(2)}</p>
                    <Badge variant={transaction.status === 'completed' ? 'success' : 'warning'} size="sm">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400">No credit transactions yet</p>
                <p className="text-gray-500 text-sm mt-1">Credit pulls for this lead will appear here</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Processing Status */}
        {isProcessing && (
          <GlassCard className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-neon-green text-3xl">⏳</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Processing Credit Pull</h3>
              <p className="text-gray-400">Connecting to credit bureau and generating comprehensive report...</p>
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-neon-green h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">This usually takes 2-5 seconds...</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Toast Notification */}
        {showToast && (
          <SimpleToast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </AppLayout>
  );
}