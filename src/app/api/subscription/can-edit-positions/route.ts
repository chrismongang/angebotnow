import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { canEditPositions } from '@/lib/subscription';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canEdit = await canEditPositions(session.user.id);
    
    return NextResponse.json({ canEdit });
  } catch (error) {
    console.error('Error checking edit permissions:', error);
    return NextResponse.json({
      error: 'Failed to check edit permissions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
