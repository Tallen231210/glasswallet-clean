'use client';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

import { SignIn } from '@clerk/nextjs';
import { GlassCard } from '@/components/ui';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background with glassmorphic gradient */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-green/5 via-transparent to-transparent" />
      
      <GlassCard className="w-full max-w-md p-8 neon-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-neon-green bg-clip-text text-transparent">
            Welcome to GlassWallet
          </h1>
          <p className="text-gray-400 mt-2">
            Sign in to access your credit data platform
          </p>
        </div>
        
        <div className="flex justify-center">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-0",
                headerTitle: "text-white",
                headerSubtitle: "text-gray-400",
                socialButtonsBlockButton: "glass-card glass-card-hover",
                formButtonPrimary: "neon-button",
                formFieldInput: "glass-card text-white placeholder-gray-400 border-white/20",
                identityPreviewEditButton: "text-neon-green hover:text-neon-green/80",
                formFieldLabel: "text-gray-300",
                dividerLine: "bg-white/20",
                dividerText: "text-gray-400",
                footerActionLink: "text-neon-green hover:text-neon-green/80",
              }
            }}
            redirectUrl="/dashboard"
          />
        </div>
      </GlassCard>
    </div>
  );
}