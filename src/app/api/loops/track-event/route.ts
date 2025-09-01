import { NextRequest, NextResponse } from 'next/server';
import { LoopsClient } from 'loops';

export async function POST(request: NextRequest) {
  try {
    const { email, eventName, properties } = await request.json();
    
    if (!email || !eventName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prüfe ob Loops API Key verfügbar ist
    if (!process.env.LOOPS_API_KEY) {
      console.warn('LOOPS_API_KEY not available');
      return NextResponse.json({ error: 'Loops not configured' }, { status: 500 });
    }

    // Erstelle Loops Client
    const loops = new LoopsClient(process.env.LOOPS_API_KEY);
    
    // Sende Event
    await loops.sendEvent({
      email,
      eventName,
      eventProperties: properties
    });

    console.log(`✅ Loops Event tracked via API: ${eventName} for ${email}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking Loops event:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}
