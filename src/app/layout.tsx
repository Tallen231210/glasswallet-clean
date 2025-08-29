import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { UserProvider } from '@/contexts/UserContext';
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "GlassWallet - Credit Data API Integration Platform",
  description: "Enable real-time credit qualification with advanced pixel optimization for ad targeting",
  keywords: ["credit data", "API integration", "pixel optimization", "lead qualification", "advertising"],
  authors: [{ name: "GlassWallet Team" }],
  creator: "GlassWallet",
  publisher: "GlassWallet",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: { colorPrimary: '#00ff88' }
      }}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
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
