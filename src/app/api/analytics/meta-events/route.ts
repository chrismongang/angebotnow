import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  trackMetaEvent, 
  trackUpgrade, 
  trackLead, 
  trackInitiateCheckout,
  MetaEventType,
  UserData,
  EventData 
} from '@/lib/meta-conversions';

// Enhanced Meta Events API for custom tracking
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      event, 
      eventData = {}, 
      options = {} 
    } = await request.json();

    if (!event) {
      return NextResponse.json({ error: 'Event type required' }, { status: 400 });
    }

    // Build user data from session
    const userData: UserData = {
      email: session.user.email!,
      firstName: (session.user as any).firstName || session.user.name?.split(' ')[0] || '',
      lastName: (session.user as any).lastName || session.user.name?.split(' ').slice(1).join(' ') || '',
      userId: session.user.id || '',
    };

    // Track the event
    const result = await trackMetaEvent(
      event as MetaEventType,
      userData,
      eventData,
      options
    );

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        eventId: result.eventId,
        message: `Event '${event}' tracked successfully`
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to track event',
        details: 'Meta Conversions API error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Meta Events API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Specific endpoints for common events
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await request.json();

    const userData: UserData = {
      email: session.user.email!,
      firstName: (session.user as any).firstName || session.user.name?.split(' ')[0] || '',
      lastName: (session.user as any).lastName || session.user.name?.split(' ').slice(1).join(' ') || '',
      userId: session.user.id || '',
    };

    let result;

    switch (action) {
      case 'upgrade':
        result = await trackUpgrade(userData, data);
        break;
      
      case 'lead':
        result = await trackLead(userData, data);
        break;
      
      case 'initiate_checkout':
        result = await trackInitiateCheckout(userData, data);
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        eventId: result.eventId,
        message: `${action} event tracked successfully`
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to track event',
        details: 'Meta Conversions API error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Meta Events API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
