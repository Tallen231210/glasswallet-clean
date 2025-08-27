import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/middleware';
import { analyticsService } from '@/services/analytics';

const handler = async (context: any): Promise<NextResponse> => {
  const { req } = context;

  if (req.method === 'POST') {
    return handleExportAnalytics(req);
  }

  return NextResponse.json(
    { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } },
    { status: 405 }
  );
};

async function handleExportAnalytics(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { format, reportType, startDate, endDate, filters } = body;

    // Validate required parameters
    if (!format || !reportType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Format and report type are required'
          }
        },
        { status: 400 }
      );
    }

    // Validate format
    if (!['csv', 'excel', 'pdf'].includes(format)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Format must be csv, excel, or pdf'
          }
        },
        { status: 400 }
      );
    }

    // Validate report type
    if (!['lifecycle', 'roi', 'performance'].includes(reportType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Report type must be lifecycle, roi, or performance'
          }
        },
        { status: 400 }
      );
    }

    // Default to last 30 days if no dates provided
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const query = {
      startDate: startDate ? new Date(startDate) : defaultStartDate,
      endDate: endDate ? new Date(endDate) : defaultEndDate,
      filters: filters || {}
    };

    // In development mode, return mock export data
    if (process.env.NODE_ENV === 'development') {
      const mockExportData = await generateMockExport(format, reportType, query);
      
      return NextResponse.json({
        success: true,
        data: {
          downloadUrl: `/downloads/${mockExportData.filename}`,
          filename: mockExportData.filename,
          format: format,
          reportType: reportType,
          generated: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        },
        meta: {
          timestamp: new Date().toISOString(),
          query: {
            period: `${query.startDate.toISOString().split('T')[0]} to ${query.endDate.toISOString().split('T')[0]}`,
            filters: query.filters
          }
        }
      });
    }

    // Production implementation
    const exportData = await analyticsService.exportAnalytics(query, format as any, reportType as any);

    // In production, you would save the file and return a download URL
    // For now, return success with mock data
    return NextResponse.json({
      success: true,
      data: {
        downloadUrl: `/downloads/${exportData.filename}.${format}`,
        filename: exportData.filename,
        format: format,
        reportType: reportType,
        generated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error exporting analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EXPORT_ERROR',
          message: 'Failed to export analytics data'
        }
      },
      { status: 500 }
    );
  }
}

async function generateMockExport(
  format: string, 
  reportType: string, 
  query: any
): Promise<{ filename: string; size: number; recordCount: number }> {
  // Simulate export generation time
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `glasswallet-${reportType}-${format}-${timestamp}`;
  
  // Mock file size and record count based on report type
  const mockData = {
    lifecycle: { size: 245000, recordCount: 1250 },
    roi: { size: 128000, recordCount: 650 },
    performance: { size: 380000, recordCount: 1900 }
  };

  return {
    filename,
    size: mockData[reportType as keyof typeof mockData]?.size || 150000,
    recordCount: mockData[reportType as keyof typeof mockData]?.recordCount || 750
  };
}

export const POST = createApiHandler(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 5, // Limited exports per minute
    windowMs: 60000 // 1 minute
  }
});