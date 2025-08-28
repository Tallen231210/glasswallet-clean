import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MockAuthProvider } from '@/components/auth/MockAuthProvider';
import { UserProvider } from '@/contexts/UserContext';
import "./globals.css";

// Only import ClerkProvider in production
let ClerkProvider: any = null;
if (process.env.NODE_ENV === 'production') {
  ClerkProvider = require('@clerk/nextjs').ClerkProvider;
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GlassWallet - Credit Data API Integration Platform",
  description: "Enable real-time credit qualification with advanced pixel optimization for ad targeting",
  keywords: ["credit data", "API integration", "pixel optimization", "lead qualification", "advertising"],
  authors: [{ name: "GlassWallet Team" }],
  creator: "GlassWallet",
  publisher: "GlassWallet",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const hasValidClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder');
  
  // Use MockAuthProvider during development OR when Clerk keys are not configured
  if (isDevelopment || !hasValidClerkKeys) {
    return (
      <MockAuthProvider>
        <html lang="en" className="h-full">
          <body className={`${inter.variable} font-sans h-full antialiased`}>
            <UserProvider>
              <div id="root" className="h-full">
                {children}
              </div>
            </UserProvider>
          </body>
        </html>
      </MockAuthProvider>
    );
  }

  // Production with Clerk (only when actually deployed)
  if (ClerkProvider && process.env.VERCEL) {
    return (
      <ClerkProvider>
        <html lang="en" className="h-full">
          <body className={`${inter.variable} font-sans h-full antialiased`}>
            <UserProvider>
              <div id="root" className="h-full">
                {children}
              </div>
            </UserProvider>
          </body>
        </html>
      </ClerkProvider>
    );
  }

  // Fallback if Clerk not available
  return (
    <MockAuthProvider>
      <html lang="en" className="h-full">
        <body className={`${inter.variable} font-sans h-full antialiased`}>
          <UserProvider>
            <div id="root" className="h-full">
              {children}
            </div>
          </UserProvider>
        </body>
      </html>
    </MockAuthProvider>
  );
}
