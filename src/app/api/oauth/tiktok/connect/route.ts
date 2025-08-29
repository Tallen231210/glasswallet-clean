import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { formatSuccessResponse, ValidationError } from '@/lib/errors';

// TikTok OAuth configuration
const TIKTOK_APP_ID = process.env.TIKTOK_APP_ID || 'demo_tiktok_app_id';
const TIKTOK_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/tiktok/callback`
  : 'http://localhost:3000/api/oauth/tiktok/callback';

const connectTikTokHandler = withMiddleware(
  async (context) => {
    const { userId, requestId } = context as any;
    
    // Generate state parameter for security
    const state = `${userId}_${requestId}_${Date.now()}`;
    
    // TikTok Marketing API OAuth scopes
    const scopes = [
      'user_info.basic',
      'video.list',
      'business.get',
      'tt_user.basic.read'
    ].join(',');
    
    // Build TikTok OAuth URL
    const oauthUrl = new URL('https://www.tiktok.com/auth/authorize/');
    oauthUrl.searchParams.set('client_key', TIKTOK_APP_ID);
    oauthUrl.searchParams.set('redirect_uri', TIKTOK_REDIRECT_URI);
    oauthUrl.searchParams.set('scope', scopes);
    oauthUrl.searchParams.set('response_type', 'code');
    oauthUrl.searchParams.set('state', state);
    
    return NextResponse.json(
      formatSuccessResponse({
        authUrl: oauthUrl.toString(),
        state: state,
        platform: 'tiktok'
      }, 'TikTok OAuth URL generated successfully')
    );
  },
  {
    requireAuth: true,
    rateLimit: { requests: 10, windowMs: 60000 }
  }
);

export const GET = connectTikTokHandler;