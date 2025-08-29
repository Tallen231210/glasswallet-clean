import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { formatSuccessResponse, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

// Google Ads OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID || 'demo_google_client_id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET || 'demo_google_client_secret';
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/google/callback`
  : 'http://localhost:3000/api/oauth/google/callback';

const googleCallbackHandler = async (request: NextRequest) => {
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
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
        code: code,
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Google token exchange failed:', errorData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pixels?error=${encodeURIComponent('Failed to exchange authorization code')}`
      );
    }
    
    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, token_type, expires_in } = tokenData;
    
    if (!access_token) {
      throw new ValidationError('No access token received from Google');
    }
    
    // Get user info
    const userResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`
    );
    const userData = await userResponse.json();
    
    // Get accessible customers (ad accounts)
    const customersResponse = await fetch(
      'https://googleads.googleapis.com/v14/customers:listAccessibleCustomers',
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || 'demo_developer_token'
        }
      }
    );
    
    let customersData = { resourceNames: [] };
    if (customersResponse.ok) {
      customersData = await customersResponse.json();
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
        platformType: 'GOOGLE_ADS',
        connectionName: `Google Ads - ${userData.name || userData.email}`,
        connectionStatus: 'active',
        oauthTokens: {
          access_token: access_token,
          refresh_token: refresh_token,
          token_type: token_type || 'Bearer',
          expires_in: expires_in,
          expires_at: expiresAt?.toISOString(),
          user_id: userData.id,
          user_name: userData.name,
          user_email: userData.email,
          accessible_customers: customersData.resourceNames || [],
          scopes: ['adwords', 'userinfo.email', 'userinfo.profile']
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
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pixels?connected=google&connection_id=${pixelConnection.id}`
    );
    
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pixels?error=${encodeURIComponent('OAuth connection failed')}`
    );
  }
};

export const GET = googleCallbackHandler;