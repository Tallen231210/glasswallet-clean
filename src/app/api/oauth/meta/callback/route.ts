import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { formatSuccessResponse, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

// Meta OAuth configuration
const META_APP_ID = process.env.META_APP_ID || 'demo_meta_app_id';
const META_APP_SECRET = process.env.META_APP_SECRET || 'demo_meta_app_secret';
const META_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/meta/callback`
  : 'http://localhost:3000/api/oauth/meta/callback';

const metaCallbackHandler = async (request: NextRequest) => {
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
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        redirect_uri: META_REDIRECT_URI,
        code: code,
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Meta token exchange failed:', errorData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pixels?error=${encodeURIComponent('Failed to exchange authorization code')}`
      );
    }
    
    const tokenData = await tokenResponse.json();
    const { access_token, token_type, expires_in } = tokenData;
    
    if (!access_token) {
      throw new ValidationError('No access token received from Meta');
    }
    
    // Get user's ad accounts and pixels
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_status&access_token=${access_token}`
    );
    
    const accountsData = await accountsResponse.json();
    const adAccounts = accountsData.data || [];
    
    // Get user info for connection name
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${access_token}`
    );
    const userData = await userResponse.json();
    
    // Find user in database
    const user = await prisma.user.findFirst({
      where: { clerkUserId: userId }
    });
    
    if (!user) {
      throw new ValidationError('User not found');
    }
    
    // Calculate token expiry
    const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : null;
    
    // Store the connection (we'll let user select specific pixels in the UI)
    const pixelConnection = await prisma.pixelConnection.create({
      data: {
        userId: user.id,
        platformType: 'META',
        connectionName: `Meta - ${userData.name || 'Account'}`,
        connectionStatus: 'active',
        oauthTokens: {
          access_token: access_token,
          token_type: token_type || 'Bearer',
          expires_in: expires_in,
          expires_at: expiresAt?.toISOString(),
          user_id: userData.id,
          user_name: userData.name,
          ad_accounts: adAccounts,
          scopes: ['ads_management', 'business_management']
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
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pixels?connected=meta&connection_id=${pixelConnection.id}`
    );
    
  } catch (error) {
    console.error('Meta OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pixels?error=${encodeURIComponent('OAuth connection failed')}`
    );
  }
};

export const GET = metaCallbackHandler;