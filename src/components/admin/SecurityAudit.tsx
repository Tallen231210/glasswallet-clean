'use client';

import React, { memo, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

// Mock security audit data
const securityAuditData = {
  overallScore: 92,
  lastAudit: '2024-08-29T10:00:00Z',
  categories: [
    {
      name: 'Authentication & Authorization',
      score: 95,
      status: 'excellent' as const,
      checks: [
        { name: 'Multi-factor Authentication', passed: true, critical: true },
        { name: 'Password Policy Enforcement', passed: true, critical: true },
        { name: 'Session Management', passed: true, critical: false },
        { name: 'JWT Token Security', passed: true, critical: true },
        { name: 'API Key Rotation', passed: false, critical: false },
      ]
    },
    {
      name: 'Data Protection & FCRA Compliance',
      score: 98,
      status: 'excellent' as const,
      checks: [
        { name: 'Data Encryption at Rest', passed: true, critical: true },
        { name: 'Data Encryption in Transit', passed: true, critical: true },
        { name: 'PII Detection & Masking', passed: true, critical: true },
        { name: 'FCRA Audit Logging', passed: true, critical: true },
        { name: 'Data Retention Policies', passed: true, critical: true },
      ]
    },
    {
      name: 'Network Security',
      score: 88,
      status: 'good' as const,
      checks: [
        { name: 'HTTPS Enforcement', passed: true, critical: true },
        { name: 'Security Headers', passed: true, critical: true },
        { name: 'CORS Configuration', passed: true, critical: false },
        { name: 'Rate Limiting', passed: true, critical: false },
        { name: 'DDoS Protection', passed: false, critical: false },
        { name: 'WAF Rules', passed: false, critical: false },
      ]
    },
    {
      name: 'Input Validation & XSS Prevention',
      score: 90,
      status: 'excellent' as const,
      checks: [
        { name: 'Input Sanitization', passed: true, critical: true },
        { name: 'SQL Injection Prevention', passed: true, critical: true },
        { name: 'XSS Protection', passed: true, critical: true },
        { name: 'CSRF Protection', passed: true, critical: true },
        { name: 'File Upload Security', passed: false, critical: false },
      ]
    },
    {
      name: 'Infrastructure Security',
      score: 85,
      status: 'good' as const,
      checks: [
        { name: 'Environment Variables Security', passed: true, critical: true },
        { name: 'Secrets Management', passed: true, critical: true },
        { name: 'Database Security', passed: true, critical: true },
        { name: 'Container Security', passed: false, critical: false },
        { name: 'Vulnerability Scanning', passed: false, critical: false },
      ]
    }
  ],
  vulnerabilities: [
    {
      id: 'VULN-001',
      severity: 'medium' as const,
      category: 'Infrastructure',
      title: 'Missing Container Security Scanning',
      description: 'Container images are not being scanned for vulnerabilities in the CI/CD pipeline',
      impact: 'Potential security vulnerabilities in dependencies',
      remediation: 'Implement container scanning tools like Trivy or Snyk in deployment pipeline',
      status: 'open' as const,
      discoveredAt: '2024-08-28T14:30:00Z'
    },
    {
      id: 'VULN-002',
      severity: 'low' as const,
      category: 'Network Security',
      title: 'Missing DDoS Protection',
      description: 'No dedicated DDoS protection service configured',
      impact: 'Potential service disruption from volumetric attacks',
      remediation: 'Configure Cloudflare or AWS Shield Advanced for DDoS protection',
      status: 'open' as const,
      discoveredAt: '2024-08-27T09:15:00Z'
    },
    {
      id: 'VULN-003',
      severity: 'low' as const,
      category: 'Authentication',
      title: 'API Key Rotation Not Automated',
      description: 'API keys are not automatically rotated on a schedule',
      impact: 'Increased risk from compromised API keys',
      remediation: 'Implement automated API key rotation every 90 days',
      status: 'in_progress' as const,
      discoveredAt: '2024-08-25T11:20:00Z'
    }
  ],
  complianceStatus: {
    fcra: {
      score: 98,
      status: 'compliant' as const,
      lastAudit: '2024-08-15T00:00:00Z',
      nextAudit: '2024-11-15T00:00:00Z',
      issues: []
    },
    pci: {
      score: 0,
      status: 'not_applicable' as const,
      note: 'Credit card processing handled by Stripe - PCI compliance delegated'
    },
    gdpr: {
      score: 85,
      status: 'mostly_compliant' as const,
      lastAudit: '2024-08-10T00:00:00Z',
      issues: [
        'Data subject access request automation needs improvement',
        'Cookie consent management requires updates'
      ]
    }
  }
};

const SecurityAuditComponent: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showVulnerabilities, setShowVulnerabilities] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-400';
    if (score >= 85) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'neon';
      case 'needs_improvement': return 'warning';
      case 'critical': return 'error';
      case 'compliant': return 'success';
      case 'mostly_compliant': return 'warning';
      case 'non_compliant': return 'error';
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-8">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Overall Security Score"
          value={`${securityAuditData.overallScore}/100`}
          description="Security rating"
          icon="🛡️"
          variant="success"
          trend="Excellent"
        />
        <StatCard
          title="Critical Issues"
          value={securityAuditData.vulnerabilities.filter(v => v.severity === 'critical').length}
          description="Require immediate attention"
          icon="🚨"
          variant={securityAuditData.vulnerabilities.filter(v => v.severity === 'critical').length === 0 ? "success" : "error"}
          trend="0 critical"
        />
        <StatCard
          title="FCRA Compliance"
          value={`${securityAuditData.complianceStatus.fcra.score}%`}
          description="Credit data compliance"
          icon="📋"
          variant="success"
          trend="Fully compliant"
        />
        <StatCard
          title="Last Audit"
          value={new Date(securityAuditData.lastAudit).toLocaleDateString()}
          description="Security assessment"
          icon="🔍"
          variant="default"
          trend="Recent"
        />
      </div>

      {/* Security Categories */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Security Categories</h3>
          <NeonButton size="sm" variant="secondary">
            Run New Audit
          </NeonButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {securityAuditData.categories.map((category) => (
            <div
              key={category.name}
              className="bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">{category.name}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(category.status) as any} size="sm">
                    {category.status}
                  </Badge>
                  <span className={`font-semibold ${getScoreColor(category.score)}`}>
                    {category.score}/100
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full ${
                    category.score >= 95 ? 'bg-green-500' :
                    category.score >= 85 ? 'bg-yellow-500' :
                    category.score >= 70 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${category.score}%` }}
                />
              </div>

              <div className="text-sm text-gray-400">
                {category.checks.filter(c => c.passed).length}/{category.checks.length} checks passed
              </div>

              {/* Expanded checks */}
              {selectedCategory === category.name && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  {category.checks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={check.passed ? 'text-green-400' : 'text-red-400'}>
                          {check.passed ? '✓' : '✗'}
                        </span>
                        <span className="text-sm text-white">{check.name}</span>
                        {check.critical && (
                          <Badge variant="error" size="sm">Critical</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Compliance Status */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Compliance Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FCRA Compliance */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">FCRA Compliance</h4>
              <Badge variant={getStatusColor(securityAuditData.complianceStatus.fcra.status) as any} size="sm">
                {securityAuditData.complianceStatus.fcra.status}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-2">
              {securityAuditData.complianceStatus.fcra.score}%
            </div>
            <div className="text-sm text-gray-400">
              Next audit: {new Date(securityAuditData.complianceStatus.fcra.nextAudit).toLocaleDateString()}
            </div>
          </div>

          {/* GDPR Compliance */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">GDPR Compliance</h4>
              <Badge variant={getStatusColor(securityAuditData.complianceStatus.gdpr.status) as any} size="sm">
                {securityAuditData.complianceStatus.gdpr.status}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {securityAuditData.complianceStatus.gdpr.score}%
            </div>
            <div className="text-sm text-gray-400">
              {securityAuditData.complianceStatus.gdpr.issues?.length || 0} issues to address
            </div>
          </div>

          {/* PCI Compliance */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">PCI DSS</h4>
              <Badge variant="default" size="sm">
                N/A
              </Badge>
            </div>
            <div className="text-sm text-gray-400">
              {securityAuditData.complianceStatus.pci.note}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Vulnerabilities */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Security Vulnerabilities</h3>
          <div className="flex gap-2">
            <NeonButton 
              size="sm" 
              variant="secondary"
              onClick={() => setShowVulnerabilities(!showVulnerabilities)}
            >
              {showVulnerabilities ? 'Hide Details' : 'Show Details'}
            </NeonButton>
            <NeonButton size="sm" variant="secondary">
              Export Report
            </NeonButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">
              {securityAuditData.vulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high').length}
            </div>
            <div className="text-sm text-gray-400">High/Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {securityAuditData.vulnerabilities.filter(v => v.severity === 'medium').length}
            </div>
            <div className="text-sm text-gray-400">Medium</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {securityAuditData.vulnerabilities.filter(v => v.severity === 'low').length}
            </div>
            <div className="text-sm text-gray-400">Low</div>
          </div>
        </div>

        {showVulnerabilities && (
          <div className="space-y-4">
            {securityAuditData.vulnerabilities.map((vuln) => (
              <div key={vuln.id} className="border border-white/10 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={getSeverityColor(vuln.severity) as any} size="sm">
                      {vuln.severity}
                    </Badge>
                    <Badge variant={getStatusColor(vuln.status) as any} size="sm">
                      {vuln.status}
                    </Badge>
                    <span className="text-sm text-gray-400">{vuln.category}</span>
                  </div>
                  <span className="text-xs text-gray-500">{vuln.id}</span>
                </div>
                
                <h4 className="font-medium text-white mb-2">{vuln.title}</h4>
                <p className="text-sm text-gray-400 mb-3">{vuln.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">Impact:</div>
                    <div className="text-white">{vuln.impact}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Remediation:</div>
                    <div className="text-white">{vuln.remediation}</div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  Discovered: {new Date(vuln.discoveredAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Recommendations */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Security Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
            <span className="text-blue-400 text-lg">💡</span>
            <div>
              <div className="font-medium text-white">Implement Automated Vulnerability Scanning</div>
              <div className="text-sm text-gray-400">Set up automated security scanning in your CI/CD pipeline to catch vulnerabilities early.</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded">
            <span className="text-green-400 text-lg">🔒</span>
            <div>
              <div className="font-medium text-white">Enable Web Application Firewall</div>
              <div className="text-sm text-gray-400">Configure WAF rules to protect against common web attacks and bot traffic.</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
            <span className="text-yellow-400 text-lg">⚡</span>
            <div>
              <div className="font-medium text-white">Improve GDPR Compliance</div>
              <div className="text-sm text-gray-400">Automate data subject access requests and update cookie consent management.</div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export const SecurityAudit = memo(SecurityAuditComponent);
SecurityAudit.displayName = 'SecurityAudit';