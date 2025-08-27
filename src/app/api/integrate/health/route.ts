import { NextRequest, NextResponse } from 'next/server';

// GET /api/integrate/health - Integration status check
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const api_key = searchParams.get('api_key');
    const client_id = searchParams.get('client_id');

    // Basic health check response
    const healthCheck = {
      service: 'GlassWallet Integration API',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      endpoints: {
        widget: '/api/integrate/widget',
        webhook: '/api/integrate/webhook',
        health: '/api/integrate/health'
      }
    };

    // If API key provided, check client-specific status
    if (api_key && client_id) {
      // TODO: Validate API key and get client info
      const clientStatus = {
        client_id,
        api_key_valid: true, // Placeholder
        credit_balance: 1250, // Placeholder
        integration_active: true,
        last_activity: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        webhook_configured: false, // Placeholder
        pixel_connections: {
          meta: false,
          google: false,
          tiktok: false
        },
        auto_tagging_rules: 2 // Placeholder
      };

      return NextResponse.json({
        ...healthCheck,
        client: clientStatus
      });
    }

    return NextResponse.json(healthCheck);

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        service: 'GlassWallet Integration API',
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}