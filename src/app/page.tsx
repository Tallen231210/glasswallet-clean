'use client';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard, NeonButton, Badge, Input, FormField, InteractiveCard, AnimatedCounter } from '@/components/ui';
import { SignedIn as MockSignedIn, SignedOut as MockSignedOut, UserButton as MockUserButton } from '@/components/auth/MockAuthProvider';
import Link from 'next/link';

// Only import Clerk components in production
let ClerkSignedIn: any = null;
let ClerkSignedOut: any = null;
let ClerkUserButton: any = null;

if (process.env.NODE_ENV === 'production') {
  const clerk = require('@clerk/nextjs');
  ClerkSignedIn = clerk.SignedIn;
  ClerkSignedOut = clerk.SignedOut;
  ClerkUserButton = clerk.UserButton;
}

export default function Home() {
  const router = useRouter();
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isBuilding = process.env.NODE_ENV === 'production' && !process.env.VERCEL;
  
  // Use Mock components during development AND during build process
  const SignedIn = (isDevelopment || isBuilding) ? MockSignedIn : ClerkSignedIn;
  const SignedOut = (isDevelopment || isBuilding) ? MockSignedOut : ClerkSignedOut;
  const UserButton = (isDevelopment || isBuilding) ? MockUserButton : ClerkUserButton;
  
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  });

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send lead to CRM/database
    alert('Thanks! We\'ll contact you within 24 hours to schedule your demo.');
    setLeadFormData({ name: '', email: '', company: '', phone: '' });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="relative z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img 
                src="/glasswallet-logo.svg" 
                alt="GlassWallet" 
                className="h-8 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <SignedIn>
                <Link href="/dashboard">
                  <NeonButton variant="secondary" size="sm">Dashboard</NeonButton>
                </Link>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <Link href="/roi-calculator">
                  <NeonButton variant="secondary" size="sm">ROI Calculator</NeonButton>
                </Link>
                <Link href="/onboarding">
                  <NeonButton variant="primary" size="sm">Get Started</NeonButton>
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/20 mb-8">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              <span className="text-neon-green text-sm font-medium">AI-Powered Credit Intelligence</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Transform Lead 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-electric-green"> Qualification</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Get instant credit reports, optimize ad targeting, and increase conversions with AI-powered lead scoring. 
              FCRA compliant and enterprise ready.
            </p>

            {/* Value Proposition */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-neon-green mb-1">
                  <AnimatedCounter value={67} />%
                </div>
                <p className="text-gray-400 text-sm">Higher Conversion Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-neon-green mb-1">
                  <AnimatedCounter value={15} />min
                </div>
                <p className="text-gray-400 text-sm">Saved Per Lead</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-neon-green mb-1">
                  $<AnimatedCounter value={847} />K
                </div>
                <p className="text-gray-400 text-sm">Average Annual ROI</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignedOut>
                <NeonButton size="lg" className="px-8 py-4" onClick={() => router.push('/onboarding')}>
                  🚀 Start Free Trial
                </NeonButton>
                <NeonButton variant="secondary" size="lg" className="px-8 py-4" onClick={() => router.push('/roi-calculator')}>
                  📊 Calculate Your ROI
                </NeonButton>
              </SignedOut>
              <SignedIn>
                <NeonButton size="lg" className="px-8 py-4" onClick={() => router.push('/dashboard')}>
                  Go to Dashboard →
                </NeonButton>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Everything You Need to Scale</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Complete credit data platform with advanced pixel optimization and AI-powered automation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Instant Credit Reports',
                description: 'Pull credit reports in under 30 seconds with CRS API integration. FCRA compliant and bank-grade security.',
                badge: 'Real-time'
              },
              {
                icon: '🎯',
                title: 'Pixel Optimization',
                description: 'Automatically sync qualified leads to Meta, Google Ads, and TikTok for 3x better ad targeting.',
                badge: 'AI-Powered'
              },
              {
                icon: '🤖',
                title: 'Smart Lead Scoring',
                description: 'AI analyzes 50+ data points to score lead quality and predict conversion probability.',
                badge: 'Machine Learning'
              },
              {
                icon: '📊',
                title: 'Advanced Analytics',
                description: 'Real-time dashboards with conversion tracking, ROI analysis, and performance insights.',
                badge: 'Live Data'
              },
              {
                icon: '🔗',
                title: 'CRM Integration',
                description: 'Seamlessly connect with Salesforce, HubSpot, Pipedrive, and 20+ other platforms.',
                badge: 'No-Code'
              },
              {
                icon: '⚙️',
                title: 'Auto-Tagging Rules',
                description: 'Set up intelligent rules to automatically tag, route, and prioritize leads based on criteria.',
                badge: 'Automation'
              }
            ].map((feature, index) => (
              <InteractiveCard key={index} hoverEffect="lift" clickEffect="glow">
                <GlassCard className="p-6 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{feature.icon}</div>
                    <Badge variant="neon" size="sm">{feature.badge}</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                </GlassCard>
              </InteractiveCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Choose Your Plan</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Flexible pricing for individuals and teams. Start free, scale as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Sales Rep Plan */}
            <InteractiveCard hoverEffect="glow">
              <GlassCard className="p-8 relative">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">👤</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Sales Rep</h3>
                  <p className="text-gray-400">Perfect for individual sales professionals</p>
                </div>
                
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    Pay-per-credit
                  </div>
                  <p className="text-gray-400">No monthly fee • $19 per credit pull</p>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    'Personal dashboard & metrics',
                    'Lead qualification tools', 
                    'Basic export features',
                    'Mobile-optimized interface',
                    'Credit-based pricing',
                    'Email support'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <NeonButton variant="secondary" className="w-full" onClick={() => router.push('/onboarding')}>
                  Start as Sales Rep
                </NeonButton>
              </GlassCard>
            </InteractiveCard>

            {/* Business Owner Plan */}
            <InteractiveCard hoverEffect="glow">
              <GlassCard className="p-8 relative border-2 border-neon-green/30">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="neon" className="px-4 py-1">Most Popular</Badge>
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">🏢</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Business Owner</h3>
                  <p className="text-gray-400">Complete platform for teams & organizations</p>
                </div>
                
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-neon-green mb-2">
                    $179<span className="text-lg text-gray-400">/mo</span>
                  </div>
                  <p className="text-gray-400">+ $17 per credit pull</p>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    'Everything in Sales Rep',
                    'AI-powered lead scoring',
                    'Pixel optimization tools', 
                    'CRM integrations',
                    'Team management',
                    'Advanced analytics',
                    'API access & webhooks',
                    'Priority support'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <NeonButton className="w-full" onClick={() => router.push('/onboarding')}>
                  Start Business Plan
                </NeonButton>
              </GlassCard>
            </InteractiveCard>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm mb-4">
              Not sure which plan is right for you?
            </p>
            <NeonButton variant="secondary" onClick={() => router.push('/roi-calculator')}>
              📊 Calculate Your ROI
            </NeonButton>
          </div>
        </div>
      </section>

      {/* Lead Capture Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <GlassCard className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to 3x Your Conversions?
                </h2>
                <p className="text-gray-300 mb-6">
                  Join 500+ businesses using GlassWallet to qualify leads faster and optimize ad spend. 
                  Get a personalized demo and see your potential ROI.
                </p>
                <div className="space-y-4">
                  {[
                    '✅ Free 30-day trial with full access',
                    '✅ Personal onboarding & setup assistance', 
                    '✅ No long-term contracts or hidden fees',
                    '✅ FCRA compliant & bank-grade security'
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <FormField label="Full Name" required>
                    <Input
                      value={leadFormData.name}
                      onChange={(e) => setLeadFormData({...leadFormData, name: e.target.value})}
                      placeholder="John Smith"
                      required
                    />
                  </FormField>
                  
                  <FormField label="Business Email" required>
                    <Input
                      type="email"
                      value={leadFormData.email}
                      onChange={(e) => setLeadFormData({...leadFormData, email: e.target.value})}
                      placeholder="john@company.com"
                      required
                    />
                  </FormField>
                  
                  <FormField label="Company Name" required>
                    <Input
                      value={leadFormData.company}
                      onChange={(e) => setLeadFormData({...leadFormData, company: e.target.value})}
                      placeholder="Acme Financial"
                      required
                    />
                  </FormField>
                  
                  <FormField label="Phone Number">
                    <Input
                      type="tel"
                      value={leadFormData.phone}
                      onChange={(e) => setLeadFormData({...leadFormData, phone: e.target.value})}
                      placeholder="(555) 123-4567"
                    />
                  </FormField>

                  <NeonButton type="submit" className="w-full py-3">
                    🚀 Get Free Demo & ROI Analysis
                  </NeonButton>
                  
                  <p className="text-xs text-gray-400 text-center">
                    We'll contact you within 24 hours to schedule your personalized demo
                  </p>
                </form>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: '🛡️', title: 'FCRA Compliant', desc: 'Fully regulated' },
              { icon: '🔒', title: 'Bank-Grade Security', desc: 'SOC 2 certified' },  
              { icon: '⚡', title: '99.9% Uptime SLA', desc: 'Enterprise reliable' },
              { icon: '🚀', title: '< 30s Processing', desc: 'Lightning fast' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl mb-2">{item.icon}</div>
                <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
