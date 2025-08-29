// Comprehensive mock data for GlassWallet demo

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  creditScore?: number;
  status: 'new' | 'qualified' | 'processing' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  source: 'website' | 'referral' | 'facebook' | 'google' | 'direct';
  tags: string[];
  notes?: string;
  qualificationNotes?: string;
  pixelSyncStatus?: {
    synced: boolean;
    lastSyncAt?: string;
    syncedPlatforms?: ('META' | 'GOOGLE_ADS' | 'TIKTOK')[];
    failedPlatforms?: ('META' | 'GOOGLE_ADS' | 'TIKTOK')[];
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'sales_rep';
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
  leadsProcessed: number;
  conversionRate: number;
  teamId?: string;
}

export interface TeamStats {
  teamId: string;
  teamName: string;
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  avgCreditScore: number;
  topPerformer: string;
  monthlyGrowth: number;
}

export interface SystemMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: string;
  description: string;
  lastCheck: string;
  uptime?: string;
  responseTime?: string;
}

// Mock Leads Data - 50 realistic entries
export const mockLeads: Lead[] = [
  {
    id: 'lead-001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    creditScore: 742,
    status: 'qualified',
    createdAt: '2024-08-28T10:30:00Z',
    updatedAt: '2024-08-28T11:15:00Z',
    source: 'website',
    tags: ['high-value', 'premium', 'whitelist'],
    notes: 'Interested in premium package, excellent credit history',
    qualificationNotes: 'Pre-approved for highest tier',
    pixelSyncStatus: {
      synced: true,
      lastSyncAt: '2024-08-28T11:20:00Z',
      syncedPlatforms: ['META', 'GOOGLE_ADS'],
      failedPlatforms: []
    }
  },
  {
    id: 'lead-002',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@techcorp.com',
    phone: '(555) 987-6543',
    creditScore: 685,
    status: 'processing',
    createdAt: '2024-08-28T09:15:00Z',
    updatedAt: '2024-08-28T10:45:00Z',
    source: 'referral',
    tags: ['business-owner', 'tech', 'qualified'],
    notes: 'CEO of tech startup, looking for business credit solutions',
    pixelSyncStatus: {
      synced: false,
      lastSyncAt: undefined,
      syncedPlatforms: [],
      failedPlatforms: []
    }
  },
  {
    id: 'lead-003',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@gmail.com',
    phone: '(555) 456-7890',
    status: 'new',
    createdAt: '2024-08-28T08:45:00Z',
    updatedAt: '2024-08-28T08:45:00Z',
    source: 'facebook',
    tags: ['first-time-buyer'],
    notes: 'New to credit, needs guidance',
    pixelSyncStatus: {
      synced: false,
      lastSyncAt: undefined,
      syncedPlatforms: [],
      failedPlatforms: []
    }
  },
  {
    id: 'lead-004',
    firstName: 'David',
    lastName: 'Thompson',
    email: 'david.t@construction.com',
    phone: '(555) 321-0987',
    creditScore: 698,
    status: 'qualified',
    createdAt: '2024-08-27T16:20:00Z',
    updatedAt: '2024-08-28T09:30:00Z',
    source: 'google',
    tags: ['construction', 'good-credit', 'qualified'],
    qualificationNotes: 'Approved for standard tier',
    pixelSyncStatus: {
      synced: true,
      lastSyncAt: '2024-08-28T10:15:00Z',
      syncedPlatforms: ['META', 'TIKTOK'],
      failedPlatforms: ['GOOGLE_ADS']
    }
  },
  {
    id: 'lead-005',
    firstName: 'Jessica',
    lastName: 'Martinez',
    email: 'j.martinez@healthcare.org',
    phone: '(555) 654-3210',
    creditScore: 756,
    status: 'completed',
    createdAt: '2024-08-27T14:10:00Z',
    updatedAt: '2024-08-28T08:20:00Z',
    source: 'referral',
    tags: ['healthcare', 'excellent-credit', 'vip', 'whitelist'],
    notes: 'Healthcare professional, excellent payment history',
    pixelSyncStatus: {
      synced: true,
      lastSyncAt: '2024-08-28T08:30:00Z',
      syncedPlatforms: ['META', 'GOOGLE_ADS', 'TIKTOK'],
      failedPlatforms: []
    }
  },
  // Adding 45 more realistic leads...
  ...Array.from({ length: 45 }, (_, i) => ({
    id: `lead-${String(i + 6).padStart(3, '0')}`,
    firstName: ['James', 'Maria', 'Robert', 'Jennifer', 'William', 'Linda', 'Christopher', 'Barbara', 'Daniel', 'Susan'][i % 10],
    lastName: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore'][i % 10],
    email: `${['james', 'maria', 'robert', 'jennifer', 'william', 'linda', 'christopher', 'barbara', 'daniel', 'susan'][i % 10]}.${['smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis', 'wilson', 'moore'][i % 10]}@email.com`,
    phone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    creditScore: Math.floor(Math.random() * 300) + 500, // 500-800 range
    status: ['new', 'qualified', 'processing', 'completed', 'rejected'][i % 5] as Lead['status'],
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
    updatedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
    source: ['website', 'referral', 'facebook', 'google', 'direct'][i % 5] as Lead['source'],
    tags: [
      ['new-customer'], 
      ['high-value', 'qualified'], 
      ['business-owner', 'whitelist'], 
      ['returning'], 
      ['premium', 'qualified']
    ][i % 5],
    pixelSyncStatus: {
      synced: Math.random() > 0.3,
      lastSyncAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString() : undefined,
      syncedPlatforms: Math.random() > 0.3 ? 
        [['META'], ['GOOGLE_ADS'], ['TIKTOK'], ['META', 'GOOGLE_ADS'], ['META', 'TIKTOK'], ['GOOGLE_ADS', 'TIKTOK'], ['META', 'GOOGLE_ADS', 'TIKTOK']][Math.floor(Math.random() * 7)] as any : [],
      failedPlatforms: Math.random() > 0.7 ? 
        [['META'], ['GOOGLE_ADS'], ['TIKTOK']][Math.floor(Math.random() * 3)] as any : []
    },
    notes: i % 3 === 0 ? `Note for lead ${i + 6}` : undefined
  }))
];

// Mock Users Data
export const mockUsers: User[] = [
  {
    id: 'user-001',
    firstName: 'John',
    lastName: 'Admin',
    email: 'john.admin@glasswallet.com',
    role: 'admin',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    createdAt: '2024-01-15T10:00:00Z',
    leadsProcessed: 1250,
    conversionRate: 0.73,
  },
  {
    id: 'user-002',
    firstName: 'Sarah',
    lastName: 'Manager',
    email: 'sarah.manager@glasswallet.com',
    role: 'manager',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    createdAt: '2024-02-01T10:00:00Z',
    leadsProcessed: 875,
    conversionRate: 0.68,
    teamId: 'team-001'
  },
  {
    id: 'user-003',
    firstName: 'Mike',
    lastName: 'Sales',
    email: 'mike.sales@glasswallet.com',
    role: 'sales_rep',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
    createdAt: '2024-03-01T10:00:00Z',
    leadsProcessed: 324,
    conversionRate: 0.71,
    teamId: 'team-001'
  }
];

// Mock Team Stats
export const mockTeamStats: TeamStats[] = [
  {
    teamId: 'team-001',
    teamName: 'Alpha Team',
    totalLeads: 1247,
    qualifiedLeads: 856,
    conversionRate: 0.69,
    avgCreditScore: 698,
    topPerformer: 'Mike Sales',
    monthlyGrowth: 0.23
  },
  {
    teamId: 'team-002',
    teamName: 'Beta Team',
    teamName: 'Beta Team',
    totalLeads: 892,
    qualifiedLeads: 634,
    conversionRate: 0.71,
    avgCreditScore: 712,
    topPerformer: 'Lisa Johnson',
    monthlyGrowth: 0.18
  }
];

// Mock System Metrics
export const mockSystemMetrics: SystemMetric[] = [
  {
    name: 'Credit API Response Time',
    status: 'healthy',
    value: '245ms',
    description: 'Average response time from credit bureaus',
    lastCheck: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 min ago
    responseTime: '245ms'
  },
  {
    name: 'Database Performance',
    status: 'healthy',
    value: '99.9%',
    description: 'Database availability and performance',
    lastCheck: new Date(Date.now() - 1000 * 60 * 1).toISOString(), // 1 min ago
    uptime: '99.9%'
  },
  {
    name: 'Lead Processing Queue',
    status: 'warning',
    value: '23',
    description: 'Leads pending credit check processing',
    lastCheck: new Date(Date.now() - 1000 * 60 * 1).toISOString(), // 1 min ago
  },
  {
    name: 'System Memory Usage',
    status: 'healthy',
    value: '67%',
    description: 'Server memory utilization',
    lastCheck: new Date(Date.now() - 1000 * 30).toISOString(), // 30 sec ago
  }
];

// Mock Performance Data
export const mockPerformanceData = {
  dailyStats: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    leads: Math.floor(Math.random() * 50) + 20,
    qualified: Math.floor(Math.random() * 30) + 10,
    conversions: Math.floor(Math.random() * 15) + 5
  })),
  
  monthlyGoals: {
    leadsGoal: 1500,
    leadsActual: 1247,
    qualificationGoal: 0.70,
    qualificationActual: 0.69,
    revenueGoal: 125000,
    revenueActual: 98650
  },
  
  topPerformers: [
    { name: 'Mike Sales', leads: 324, conversionRate: 0.71, revenue: 28500 },
    { name: 'Sarah Johnson', leads: 298, conversionRate: 0.68, revenue: 26200 },
    { name: 'Tom Wilson', leads: 245, conversionRate: 0.73, revenue: 24100 },
    { name: 'Lisa Chen', leads: 234, conversionRate: 0.66, revenue: 22800 }
  ]
};

// Utility functions for mock data
export const getLeadsByStatus = (status: Lead['status']) => 
  mockLeads.filter(lead => lead.status === status);

export const getRecentLeads = (count: number = 10) => 
  mockLeads
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, count);

export const getLeadStats = () => ({
  total: mockLeads.length,
  new: getLeadsByStatus('new').length,
  qualified: getLeadsByStatus('qualified').length,
  processing: getLeadsByStatus('processing').length,
  completed: getLeadsByStatus('completed').length,
  rejected: getLeadsByStatus('rejected').length,
  avgCreditScore: Math.round(
    mockLeads.filter(l => l.creditScore).reduce((acc, l) => acc + (l.creditScore || 0), 0) / 
    mockLeads.filter(l => l.creditScore).length
  ),
  conversionRate: Math.round((getLeadsByStatus('qualified').length / mockLeads.length) * 100)
});