import { NextRequest, NextResponse } from 'next/server';

const PIXEL_ID = "1824927524761347";

// Server-side Meta Pixel Event Tracking
export async function POST(request: NextRequest) {
  try {
    const { event, userData, eventData } = await request.json();

    if (!event || !userData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Meta Pixel Conversions API Event
    const pixelEvent = {
      data: [
        {
          event_name: event,
          event_time: Math.floor(Date.now() / 1000),
          user_data: {
            em: userData.email ? hashEmail(userData.email) : undefined,
            fn: userData.firstName ? hashString(userData.firstName) : undefined,
            ln: userData.lastName ? hashString(userData.lastName) : undefined,
            external_id: userData.userId ? hashString(userData.userId) : undefined,
          },
          custom_data: eventData || {},
          action_source: 'website',
        }
      ],
      test_event_code: process.env.META_PIXEL_TEST_EVENT_CODE || undefined,
    };

    // Send to Meta Conversions API
    const response = await fetch(`https://graph.facebook.com/v18.0/${PIXEL_ID}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(pixelEvent),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Meta Pixel API error:', errorData);
      return NextResponse.json({ error: 'Failed to send event to Meta' }, { status: 500 });
    }

    const result = await response.json();
    console.log(`Meta Pixel event '${event}' sent successfully:`, result);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Meta Pixel tracking error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Hash functions for Meta Pixel (required for PII)
function hashString(str: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(str.toLowerCase().trim()).digest('hex');
}

function hashEmail(email: string): string {
  return hashString(email);
}
