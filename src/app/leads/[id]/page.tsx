'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { 
  GlassCard, 
  NeonButton, 
  Badge, 
  StatCard,
  Alert,
  Progress,
  ToastProvider,
  useToast,
  Loading,
  Toggle,
  LeadTagManager
} from '@/components/ui';
import { Header } from '@/components/layout';

interface LeadDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  consentGiven: boolean;
  processed: boolean;
  creditScore?: number;
  incomeEstimate?: number;
  createdAt: string;
  updatedAt: string;
  leadTags: Array<{
    id: string;
    tagType: 'qualified' | 'unqualified' | 'whitelist' | 'blacklist';
    tagReason: string;
    createdAt: string;
    rule?: {
      ruleName: string;
    };
  }>;
  creditTransactions: Array<{
    costInCents: number;
    createdAt: string;
  }>;
}

const LeadDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  
  const [lead, setLead] = useState<LeadDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [processingCredit, setProcessingCredit] = useState(false);

  const leadId = params.id as string;

  useEffect(() => {
    if (leadId) {
      fetchLeadDetails();
    }
  }, [leadId]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/leads/${leadId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch lead details');
      }

      setLead(result.data);
    } catch (error) {
      console.error('Error fetching lead details:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch lead details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreditPull = async () => {
    if (!lead || !lead.consentGiven) {
      showToast({
        title: 'Consent Required',
        message: 'Cannot perform credit pull without proper consent',
        variant: 'error'
      });
      return;
    }

    setProcessingCredit(true);
    try {
      showToast({
        title: 'Credit Pull Initiated',
        message: 'Processing credit report request...',
        variant: 'info'
      });

      const response = await fetch(`/api/leads/${leadId}/credit-pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Credit pull request failed');
      }

      if (result.data.success) {
        showToast({
          title: 'Credit Pull Successful',
          message: `Credit score: ${result.data.creditScore} | Cost: $${(result.data.costInCents / 100).toFixed(2)}`,
          variant: 'success'
        });

        // Refresh lead data to show updated credit information
        await fetchLeadDetails();
      } else {
        const errorMessage = result.data.error?.message || 'Credit pull failed';
        const isRetryable = result.data.error?.retryable;
        
        showToast({
          title: 'Credit Pull Failed',
          message: `${errorMessage}${isRetryable ? ' (You can retry this request)' : ''}`,
          variant: 'error'
        });
      }

    } catch (error) {
      console.error('Error processing credit pull:', error);
      showToast({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to process credit pull',
        variant: 'error'
      });
    } finally {
      setProcessingCredit(false);
    }
  };

  const getStatusBadge = (lead: LeadDetails) => {
    const qualifiedTag = lead.leadTags.find(tag => tag.tagType === 'qualified');
    const unqualifiedTag = lead.leadTags.find(tag => tag.tagType === 'unqualified');
    const whitelistTag = lead.leadTags.find(tag => tag.tagType === 'whitelist');
    const blacklistTag = lead.leadTags.find(tag => tag.tagType === 'blacklist');

    if (qualifiedTag) return <Badge variant="success" size="lg" dot>Qualified Lead</Badge>;
    if (unqualifiedTag) return <Badge variant="error" size="lg" dot>Unqualified</Badge>;
    if (whitelistTag) return <Badge variant="neon" size="lg" dot>Whitelisted</Badge>;
    if (blacklistTag) return <Badge variant="warning" size="lg" dot>Blacklisted</Badge>;
    if (!lead.processed) return <Badge variant="default" size="lg">Pending Processing</Badge>;
    
    return <Badge variant="default" size="lg">No Classification</Badge>;
  };

  const getCreditScoreBadge = (score?: number) => {
    if (!score) return <Badge variant="default">Not Available</Badge>;
    
    if (score >= 750) return <Badge variant="success">Excellent ({score})</Badge>;
    if (score >= 700) return <Badge variant="success">Good ({score})</Badge>;
    if (score >= 650) return <Badge variant="warning">Fair ({score})</Badge>;
    return <Badge variant="error">Poor ({score})</Badge>;
  };

  const calculateTotalCost = () => {
    if (!lead) return 0;
    return lead.creditTransactions.reduce((sum, transaction) => sum + transaction.costInCents, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="absolute inset-0 bg-black" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <Loading message="Loading lead details..." size="lg" />
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen p-6">
        <div className="absolute inset-0 bg-black" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <Header title="Lead Details" subtitle="Lead information and credit status" />
          <Alert variant="error" title="Error Loading Lead">
            {error || 'Lead not found'}
          </Alert>
          <div className="mt-4">
            <NeonButton onClick={() => router.push('/leads')}>
              Back to Leads
            </NeonButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Background */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-green/5 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <Header
          title={`${lead.firstName} ${lead.lastName}`}
          subtitle={`Lead Details • Created ${new Date(lead.createdAt).toLocaleDateString()}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Leads', href: '/leads' },
            { label: `${lead.firstName} ${lead.lastName}` },
          ]}
          actions={
            <div className="flex gap-2">
              <NeonButton 
                onClick={handleCreditPull}
                loading={processingCredit}
                disabled={processingCredit || !lead.consentGiven}
              >
                {processingCredit ? 'Processing...' : 'Pull Credit Report'}
              </NeonButton>
              <NeonButton variant="secondary" onClick={() => router.push('/leads')}>
                Back to Leads
              </NeonButton>
            </div>
          }
        />

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Lead Status"
            value={(() => {
              const qualifiedTag = lead.leadTags.find(tag => tag.tagType === 'qualified');
              const unqualifiedTag = lead.leadTags.find(tag => tag.tagType === 'unqualified');
              const whitelistTag = lead.leadTags.find(tag => tag.tagType === 'whitelist');
              const blacklistTag = lead.leadTags.find(tag => tag.tagType === 'blacklist');
              
              if (qualifiedTag) return "Qualified Lead";
              if (unqualifiedTag) return "Unqualified";
              if (whitelistTag) return "Whitelisted";
              if (blacklistTag) return "Blacklisted";
              if (!lead.processed) return "Pending Processing";
              return "No Classification";
            })()}
            icon="🎯"
            variant="default"
          />
          <StatCard
            title="Credit Score"
            value={lead.creditScore?.toString() || "N/A"}
            icon="📊"
            variant={lead.creditScore ? (lead.creditScore >= 650 ? 'success' : 'warning') : 'default'}
          />
          <StatCard
            title="Processing Status"
            value={lead.processed ? 'Completed' : 'Pending'}
            icon={lead.processed ? '✅' : '⏳'}
            variant={lead.processed ? 'success' : 'warning'}
          />
          <StatCard
            title="Total Cost"
            value={`$${(calculateTotalCost() / 100).toFixed(2)}`}
            icon="💰"
            variant="default"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-3">
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                    <p className="text-white">{lead.firstName} {lead.lastName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                    <p className="text-white">{lead.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                    <p className="text-white">{lead.phone || '—'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
                    <p className="text-white">
                      {lead.address ? (
                        <>
                          {lead.address}<br />
                          {lead.city && lead.state && lead.zipCode && 
                            `${lead.city}, ${lead.state} ${lead.zipCode}`
                          }
                        </>
                      ) : '—'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">FCRA Consent</label>
                    <Badge variant={lead.consentGiven ? 'success' : 'error'}>
                      {lead.consentGiven ? 'Consent Given' : 'No Consent'}
                    </Badge>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Credit Information */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-3">
                Credit Information
              </h3>
              
              <div className="space-y-6">
                {lead.creditScore ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Credit Score</label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-white">{lead.creditScore}</span>
                          {getCreditScoreBadge(lead.creditScore)}
                        </div>
                        <Progress 
                          value={(lead.creditScore - 300) / 5.5} // Scale 300-850 to 0-100
                          variant={lead.creditScore >= 650 ? 'success' : 'warning'}
                          size="sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Income Estimate</label>
                      <p className="text-xl font-semibold text-white">
                        {lead.incomeEstimate ? 
                          `$${(lead.incomeEstimate / 100).toLocaleString()}` : 
                          '—'
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">No credit information available</div>
                    <NeonButton 
                      onClick={handleCreditPull}
                      loading={processingCredit}
                      disabled={processingCredit || !lead.consentGiven}
                    >
                      Pull Credit Report
                    </NeonButton>
                    {!lead.consentGiven && (
                      <p className="text-sm text-red-400 mt-2">
                        FCRA consent required before credit pull
                      </p>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Tags & Activity */}
          <div className="space-y-6">
            {/* Lead Tags */}
            <LeadTagManager
              leadId={lead.id}
              leadName={`${lead.firstName} ${lead.lastName}`}
              currentTags={lead.leadTags}
              onTagsUpdated={fetchLeadDetails}
            />

            {/* Credit Transactions */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-3">
                Transaction History
              </h3>
              
              <div className="space-y-3">
                {lead.creditTransactions.length > 0 ? (
                  <>
                    {lead.creditTransactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded">
                        <div>
                          <p className="text-sm text-white">Credit Pull</p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="default">
                          ${(transaction.costInCents / 100).toFixed(2)}
                        </Badge>
                      </div>
                    ))}
                    <div className="border-t border-white/10 pt-3 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">Total Cost</span>
                        <Badge variant="neon">
                          ${(calculateTotalCost() / 100).toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400 text-center py-4">No transactions</p>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LeadDetailsPage() {
  return (
    <ToastProvider>
      <LeadDetailPage />
    </ToastProvider>
  );
}