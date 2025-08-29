import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { formatSuccessResponse, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

// TikTok OAuth configuration
const TIKTOK_APP_ID = process.env.TIKTOK_APP_ID || 'demo_tiktok_app_id';
const TIKTOK_APP_SECRET = process.env.TIKTOK_APP_SECRET || 'demo_tiktok_app_secret';
const TIKTOK_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/tiktok/callback`
  : 'http://localhost:3000/api/oauth/tiktok/callback';

const tiktokCallbackHandler = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // Handle OAuth error
    if (error) {
      const errorDescription = searchParams.get('error_description') || 'OAuth authorization failed';
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pixels?error=${encodeURIComponent(errorDescription)}`
      );
    }
    
    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pixels?error=${encodeURIComponent('Missing authorization code or state')}`
      );
    }
    
    // Extract user ID from state
    const [userId] = state.split('_');
    if (!userId) {
      throw new ValidationError('Invalid state parameter');
    }
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: TIKTOK_APP_ID,
        client_secret: TIKTOK_APP_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: TIKTOK_REDIRECT_URI,
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('TikTok token exchange failed:', errorData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pixels?error=${encodeURIComponent('Failed to exchange authorization code')}`
      );
    }
    
    const tokenData = await tokenResponse.json();
    const { access_token, expires_in, refresh_token, token_type } = tokenData.data || tokenData;
    
    if (!access_token) {
      throw new ValidationError('No access token received from TikTok');
    }
    
    // Get user info
    const userResponse = await fetch('https://open-api.tiktok.com/user/info/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    let userData = { display_name: 'TikTok User', open_id: 'unknown' };
    if (userResponse.ok) {
      const userResult = await userResponse.json();
      userData = userResult.data?.user || userData;
    }
    
    // Find user in database
    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId }
    });
    
    if (!user) {
      throw new ValidationError('User not found');
    }
    
    // Calculate token expiry
    const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : null;
    
    // Store the connection
    const pixelConnection = await prisma.pixelConnection.create({
      data: {
        userId: user.id,
        platformType: 'TIKTOK',
        connectionName: `TikTok - ${userData.display_name || 'Account'}`,
        connectionStatus: 'active',
        oauthTokens: {
          access_token: access_token,
          refresh_token: refresh_token,
          token_type: token_type || 'Bearer',
          expires_in: expires_in,
          expires_at: expiresAt?.toISOString(),
          user_id: userData.open_id,
          user_name: userData.display_name,
          scopes: ['user_info.basic', 'video.list', 'business.get']
        },
        syncSettings: {
          autoSync: true,
          syncQualifiedOnly: true,
          syncWhitelisted: true,
          excludeBlacklisted: true,
          syncFrequency: 'realtime'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    
    // Redirect back to pixels page with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pixels?connected=tiktok&connection_id=${pixelConnection.id}`
    );
    
  } catch (error) {
    console.error('TikTok OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pixels?error=${encodeURIComponent('OAuth connection failed')}`
    );
  }
};

export const GET = tiktokCallbackHandler;