'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GlassCard, 
  NeonButton, 
  Badge, 
  StatCard,
  ToastProvider,
  useToast,
  Select,
  FormField,
  Input
} from '@/components/ui';
import { AppShell } from '@/components/layout/AppShell';

interface LeadScore {
  overallScore: number;
  conversionProbability: number;
  qualificationConfidence: number;
  fraudRiskScore: number;
  recommendedAction: 'auto_approve' | 'manual_review' | 'reject' | 'priority_review';
  scoringFactors: Array<{
    factor: string;
    weight: number;
    impact: 'positive' | 'negative' | 'neutral';
    contribution: number;
    description: string;
  }>;
  modelVersion: string;
  timestamp: string;
}

interface AnomalyDetection {
  isAnomalous: boolean;
  anomalyScore: number;
  anomalyType: 'fraud_risk' | 'data_quality' | 'behavioral' | 'volume_spike' | 'duplicate_risk';
  confidence: number;
  explanation: string;
  recommendations: string[];
  flagged: boolean;
}

interface OptimizationRecommendation {
  type: 'campaign' | 'pixel' | 'lead_flow' | 'qualification_criteria' | 'follow_up_timing';
  priority: 'high' | 'medium' | 'low';
  impact: 'increase_conversions' | 'reduce_costs' | 'improve_quality' | 'prevent_fraud';
  recommendation: string;
  expectedImpact: {
    metric: string;
    currentValue: number;
    projectedValue: number;
    confidence: number;
  };
  implementationEffort: 'low' | 'medium' | 'high';
  timeline: string;
  reasoning: string;
}

const AIIntelligencePage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [leadScore, setLeadScore] = useState<LeadScore | null>(null);
  const [anomalyDetection, setAnomalyDetection] = useState<AnomalyDetection | null>(null);
  const [optimizationRecommendations, setOptimizationRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'scoring' | 'anomalies' | 'optimization'>('scoring');

  // Lead scoring form state
  const [scoringForm, setScoringForm] = useState({
    leadId: 'lead_demo_001',
    creditScore: 720,
    income: 65000,
    sourceChannel: 'organic_search',
    formCompletionTime: 180,
    pageViews: 5,
    timeOfDay: 14,
    dayOfWeek: 2
  });

  useEffect(() => {
    fetchOptimizationRecommendations();
  }, []);

  const fetchOptimizationRecommendations = async () => {
    try {
      const response = await fetch('/api/ai/optimization-recommendations');
      const result = await response.json();
      
      if (result.success) {
        setOptimizationRecommendations(result.data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching optimization recommendations:', error);
    }
  };

  const handleScoreLead = async () => {
    try {
      setLoading(true);

      const features = {
        creditScore: scoringForm.creditScore,
        income: scoringForm.income,
        sourceChannel: scoringForm.sourceChannel,
        formCompletionTime: scoringForm.formCompletionTime,
        pageViews: scoringForm.pageViews,
        sessionDuration: scoringForm.formCompletionTime * 2,
        timeOfDay: scoringForm.timeOfDay,
        dayOfWeek: scoringForm.dayOfWeek,
        formFieldsCompleted: 8,
        requiredFieldsCompleted: 6,
        optionalFieldsCompleted: 2
      };

      const [scoreResponse, anomalyResponse] = await Promise.all([
        fetch('/api/ai/lead-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: scoringForm.leadId, features })
        }),
        fetch('/api/ai/anomaly-detection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: scoringForm.leadId, features })
        })
      ]);

      const [scoreResult, anomalyResult] = await Promise.all([
        scoreResponse.json(),
        anomalyResponse.json()
      ]);

      if (scoreResult.success) {
        setLeadScore(scoreResult.data.leadScore);
        showToast({
          title: 'AI Analysis Complete',
          message: `Lead scored ${scoreResult.data.leadScore.overallScore}/100`,
          variant: 'success'
        });
      }

      if (anomalyResult.success) {
        setAnomalyDetection(anomalyResult.data.anomalyDetection);
        if (anomalyResult.data.anomalyDetection.flagged) {
          showToast({
            title: 'Anomaly Detected',
            message: 'Lead flagged for manual review',
            variant: 'warning'
          });
        }
      }

    } catch (error) {
      console.error('Error analyzing lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'auto_approve': return 'success';
      case 'manual_review': return 'neon';
      case 'priority_review': return 'warning';
      case 'reject': return 'error';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '💡';
      default: return '📋';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'increase_conversions': return '📈';
      case 'reduce_costs': return '💰';
      case 'improve_quality': return '⭐';
      case 'prevent_fraud': return '🛡️';
      default: return '🎯';
    }
  };

  return (
    <AppShell 
      headerActions={
        <div className="flex gap-2">
          <NeonButton onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </NeonButton>
        </div>
      }
    >
      <div className="p-6 space-y-8 max-w-7xl mx-auto">

        {/* AI Status Banner */}
        <GlassCard className="p-6 mb-8 border border-neon-green/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-neon-green rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-xl">🤖</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">AI Intelligence System Active</h3>
              <p className="text-gray-300">
                Machine learning models are analyzing lead patterns and generating real-time insights
              </p>
            </div>
            <div className="ml-auto flex gap-3">
              <Badge variant="success" dot>ML Models Online</Badge>
              <Badge variant="neon" dot>Real-time Analysis</Badge>
              <Badge variant="default">Model v2.6.0</Badge>
            </div>
          </div>
        </GlassCard>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('scoring')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'scoring'
                ? 'bg-neon-green text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Lead Scoring
          </button>
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'anomalies'
                ? 'bg-neon-green text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Anomaly Detection
          </button>
          <button
            onClick={() => setActiveTab('optimization')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'optimization'
                ? 'bg-neon-green text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            AI Optimization
          </button>
        </div>

        {/* Lead Scoring Tab */}
        {activeTab === 'scoring' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scoring Input Form */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">AI Lead Scoring Demo</h3>
              
              <div className="space-y-4">
                <FormField label="Lead ID">
                  <Input
                    value={scoringForm.leadId}
                    onChange={(e) => setScoringForm({...scoringForm, leadId: e.target.value})}
                    placeholder="Enter lead ID"
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Credit Score">
                    <Input
                      type="number"
                      value={scoringForm.creditScore}
                      onChange={(e) => setScoringForm({...scoringForm, creditScore: parseInt(e.target.value) || 0})}
                      min="300"
                      max="850"
                    />
                  </FormField>
                  
                  <FormField label="Income">
                    <Input
                      type="number"
                      value={scoringForm.income}
                      onChange={(e) => setScoringForm({...scoringForm, income: parseInt(e.target.value) || 0})}
                      placeholder="Annual income"
                    />
                  </FormField>
                </div>

                <FormField label="Source Channel">
                  <Select
                    value={scoringForm.sourceChannel}
                    onChange={(e) => setScoringForm({...scoringForm, sourceChannel: e.target.value})}
                    options={[
                      { value: 'organic_search', label: 'Organic Search' },
                      { value: 'paid_search', label: 'Paid Search' },
                      { value: 'social_organic', label: 'Social Organic' },
                      { value: 'social_paid', label: 'Social Paid' },
                      { value: 'direct', label: 'Direct Traffic' },
                      { value: 'referral', label: 'Referral' }
                    ]}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Form Completion Time (seconds)">
                    <Input
                      type="number"
                      value={scoringForm.formCompletionTime}
                      onChange={(e) => setScoringForm({...scoringForm, formCompletionTime: parseInt(e.target.value) || 0})}
                    />
                  </FormField>
                  
                  <FormField label="Page Views">
                    <Input
                      type="number"
                      value={scoringForm.pageViews}
                      onChange={(e) => setScoringForm({...scoringForm, pageViews: parseInt(e.target.value) || 0})}
                    />
                  </FormField>
                </div>

                <NeonButton 
                  onClick={handleScoreLead}
                  loading={loading}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Analyzing with AI...' : 'Score Lead with AI'}
                </NeonButton>
              </div>
            </GlassCard>

            {/* Scoring Results */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">AI Scoring Results</h3>
              
              {leadScore ? (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center p-6 bg-white/5 rounded-lg">
                    <div className={`text-4xl font-bold mb-2 ${getScoreColor(leadScore.overallScore)}`}>
                      {leadScore.overallScore}/100
                    </div>
                    <p className="text-gray-300 mb-3">AI Lead Score</p>
                    <Badge variant={getActionBadgeVariant(leadScore.recommendedAction) as any}>
                      {leadScore.recommendedAction.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Conversion Probability</p>
                      <p className="text-xl font-bold text-neon-green">
                        {(leadScore.conversionProbability * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Fraud Risk</p>
                      <p className={`text-xl font-bold ${leadScore.fraudRiskScore > 0.5 ? 'text-red-400' : 'text-green-400'}`}>
                        {(leadScore.fraudRiskScore * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Scoring Factors */}
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">Key Scoring Factors</h4>
                    <div className="space-y-3">
                      {leadScore.scoringFactors.map((factor, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded">
                          <div>
                            <p className="font-medium text-white">{factor.factor}</p>
                            <p className="text-sm text-gray-400">{factor.description}</p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={factor.impact === 'positive' ? 'success' : factor.impact === 'negative' ? 'error' : 'default'}
                              size="sm"
                            >
                              {factor.impact}
                            </Badge>
                            <p className="text-sm text-gray-300 mt-1">
                              +{factor.contribution.toFixed(1)} pts
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <p>Use the form to analyze a lead with AI</p>
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* Anomaly Detection Tab */}
        {activeTab === 'anomalies' && (
          <div className="space-y-8">
            {anomalyDetection ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Anomaly Analysis</h3>
                  
                  <div className="space-y-6">
                    {/* Anomaly Status */}
                    <div className="text-center p-6 bg-white/5 rounded-lg">
                      <div className={`text-3xl mb-2 ${anomalyDetection.isAnomalous ? '🚨' : '✅'}`}>
                        {anomalyDetection.isAnomalous ? '🚨' : '✅'}
                      </div>
                      <p className="text-lg font-semibold text-white mb-2">
                        {anomalyDetection.isAnomalous ? 'Anomaly Detected' : 'Normal Pattern'}
                      </p>
                      <Badge 
                        variant={anomalyDetection.flagged ? 'error' : anomalyDetection.isAnomalous ? 'warning' : 'success'}
                      >
                        {anomalyDetection.flagged ? 'FLAGGED' : anomalyDetection.isAnomalous ? 'SUSPICIOUS' : 'SAFE'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Anomaly Score</p>
                        <p className="text-xl font-bold text-orange-400">
                          {(anomalyDetection.anomalyScore * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Confidence</p>
                        <p className="text-xl font-bold text-white">
                          {(anomalyDetection.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-300 mb-2">Type</p>
                      <Badge variant="default">
                        {anomalyDetection.anomalyType.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Analysis & Recommendations</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Explanation</h4>
                      <p className="text-gray-300 p-3 bg-white/5 rounded">
                        {anomalyDetection.explanation}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {anomalyDetection.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded">
                            <span className="text-neon-green">•</span>
                            <span className="text-gray-300">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            ) : (
              <GlassCard className="p-12 text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Anomaly Detection Ready</h3>
                <p className="text-gray-400 mb-6">
                  Analyze a lead in the Scoring tab to view anomaly detection results
                </p>
                <NeonButton onClick={() => setActiveTab('scoring')}>
                  Go to Lead Scoring
                </NeonButton>
              </GlassCard>
            )}
          </div>
        )}

        {/* Optimization Tab */}
        {activeTab === 'optimization' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Active Recommendations"
                value={optimizationRecommendations.length}
                icon="🎯"
                variant="neon"
                description="AI-generated insights"
              />
              <StatCard
                title="High Priority"
                value={optimizationRecommendations.filter(r => r.priority === 'high').length}
                icon="🔥"
                variant="warning"
                description="Immediate action needed"
              />
              <StatCard
                title="Avg Confidence"
                value={`${(optimizationRecommendations.reduce((sum, r) => sum + r.expectedImpact.confidence, 0) / optimizationRecommendations.length * 100).toFixed(0)}%`}
                icon="🎯"
                variant="success"
                description="AI prediction accuracy"
              />
            </div>

            <div className="space-y-6">
              {optimizationRecommendations.map((rec, index) => (
                <GlassCard key={index} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getPriorityIcon(rec.priority)}</div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{rec.recommendation}</h4>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'default'}>
                            {rec.priority.toUpperCase()} PRIORITY
                          </Badge>
                          <Badge variant="neon">
                            {rec.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-2xl">{getImpactIcon(rec.impact)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="success" size="sm">
                      {(rec.expectedImpact.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Current Value</p>
                      <p className="text-lg font-semibold text-white">
                        {typeof rec.expectedImpact.currentValue === 'number' && rec.expectedImpact.currentValue < 1 
                          ? (rec.expectedImpact.currentValue * 100).toFixed(1) + '%'
                          : rec.expectedImpact.currentValue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Projected Value</p>
                      <p className="text-lg font-semibold text-neon-green">
                        {typeof rec.expectedImpact.projectedValue === 'number' && rec.expectedImpact.projectedValue < 1 
                          ? (rec.expectedImpact.projectedValue * 100).toFixed(1) + '%'
                          : rec.expectedImpact.projectedValue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Implementation</p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={rec.implementationEffort === 'low' ? 'success' : rec.implementationEffort === 'medium' ? 'warning' : 'error'}
                          size="sm"
                        >
                          {rec.implementationEffort}
                        </Badge>
                        <span className="text-sm text-gray-300">{rec.timeline}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm font-medium text-gray-300 mb-2">AI Reasoning</p>
                    <p className="text-gray-400">{rec.reasoning}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
};

export default function AIIntelligencePageWrapper() {
  return (
    <ToastProvider>
      <AIIntelligencePage />
    </ToastProvider>
  );
}