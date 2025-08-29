import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { formatSuccessResponse, ValidationError } from '@/lib/errors';

// Meta OAuth configuration
const META_APP_ID = process.env.META_APP_ID || 'demo_meta_app_id';
const META_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/meta/callback`
  : 'http://localhost:3000/api/oauth/meta/callback';

const connectMetaHandler = withMiddleware(
  async (context) => {
    const { userId, requestId } = context as any;
    
    // Generate state parameter for security
    const state = `${userId}_${requestId}_${Date.now()}`;
    
    // Meta OAuth scopes needed for Conversions API
    const scopes = [
      'ads_management',
      'business_management',
      'pages_read_engagement',
      'pages_manage_metadata'
    ].join(',');
    
    // Build Meta OAuth URL
    const oauthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    oauthUrl.searchParams.set('client_id', META_APP_ID);
    oauthUrl.searchParams.set('redirect_uri', META_REDIRECT_URI);
    oauthUrl.searchParams.set('scope', scopes);
    oauthUrl.searchParams.set('response_type', 'code');
    oauthUrl.searchParams.set('state', state);
    oauthUrl.searchParams.set('display', 'popup');
    
    return NextResponse.json(
      formatSuccessResponse({
        authUrl: oauthUrl.toString(),
        state: state,
        platform: 'meta'
      }, 'Meta OAuth URL generated successfully')
    );
  },
  {
    requireAuth: true,
    rateLimit: { requests: 10, windowMs: 60000 }
  }
);

export const GET = connectMetaHandler;