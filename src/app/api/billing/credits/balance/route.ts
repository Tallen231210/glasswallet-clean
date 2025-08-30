import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { creditService } from '@/lib/services/creditService';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const balance = creditService.getUserBalance(userId);
    const transactions = creditService.getUserTransactions(userId, 10);
    const usageStats = creditService.getUsageStats(userId);
    const isLowBalance = creditService.checkLowBalanceAlert(userId);

    return NextResponse.json({
      balance,
      transactions,
      usageStats,
      isLowBalance
    });

  } catch (error) {
    console.error('Credit balance fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { alertThreshold } = body;

    if (typeof alertThreshold !== 'number' || alertThreshold < 0) {
      return NextResponse.json(
        { error: 'Invalid alert threshold' },
        { status: 400 }
      );
    }

    const updatedBalance = creditService.updateAlertThreshold(userId, alertThreshold);

    return NextResponse.json({
      success: true,
      balance: updatedBalance
    });

  } catch (error) {
    console.error('Credit balance update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}