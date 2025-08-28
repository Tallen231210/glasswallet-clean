import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MockAuthProvider } from '@/components/auth/MockAuthProvider';
import { UserProvider } from '@/contexts/UserContext';
import "./globals.css";

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
  // Temporarily use MockAuthProvider everywhere to fix deployments
  // TODO: Add proper Clerk integration back after deployment pipeline works
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
