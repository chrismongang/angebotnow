import { NextRequest, NextResponse } from 'next/server';
import { LoopsClient } from 'loops';

export async function POST(request: NextRequest) {
  try {
    const { email, properties } = await request.json();
    
    if (!email || !properties) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prüfe ob Loops API Key verfügbar ist
    if (!process.env.LOOPS_API_KEY) {
      console.warn('LOOPS_API_KEY not available');
      return NextResponse.json({ error: 'Loops not configured' }, { status: 500 });
    }

    // Erstelle Loops Client
    const loops = new LoopsClient(process.env.LOOPS_API_KEY);
    
    // Update User Properties
    await loops.updateContact({
      email,
      properties
    });

    console.log(`✅ Loops User updated via API: ${email}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating Loops user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
