import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { formatSuccessResponse, ValidationError } from '@/lib/errors';

// Google Ads OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID || 'demo_google_client_id';
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/google/callback`
  : 'http://localhost:3000/api/oauth/google/callback';

const connectGoogleHandler = withMiddleware(
  async (context) => {
    const { userId, requestId } = context as any;
    
    // Generate state parameter for security
    const state = `${userId}_${requestId}_${Date.now()}`;
    
    // Google Ads OAuth scopes needed for Customer Match and Conversions
    const scopes = [
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' ');
    
    // Build Google OAuth URL
    const oauthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    oauthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    oauthUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
    oauthUrl.searchParams.set('scope', scopes);
    oauthUrl.searchParams.set('response_type', 'code');
    oauthUrl.searchParams.set('state', state);
    oauthUrl.searchParams.set('access_type', 'offline');
    oauthUrl.searchParams.set('prompt', 'consent');
    oauthUrl.searchParams.set('include_granted_scopes', 'true');
    
    return NextResponse.json(
      formatSuccessResponse({
        authUrl: oauthUrl.toString(),
        state: state,
        platform: 'google'
      }, 'Google Ads OAuth URL generated successfully')
    );
  },
  {
    requireAuth: true,
    rateLimit: { requests: 10, windowMs: 60000 }
  }
);

export const GET = connectGoogleHandler;