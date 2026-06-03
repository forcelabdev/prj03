import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || 
                  request.headers.get('x-auth-token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token gerekli' },
        { status: 401 }
      );
    }

    // Return mock user data
    return NextResponse.json({
      success: true,
      user: {
        _id: '1',
        username: 'demo',
        email: 'demo@velobet.com',
        balance: 1000,
        bonusBalance: 500,
        xp: 0,
        level: 1,
        avatar: 'https://via.placeholder.com/40',
      },
    });
  } catch (error) {
    console.error('[v0] Get user error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
