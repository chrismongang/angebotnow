import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PIXEL_ID = "1824927524761347";

// Enhanced Meta Conversions API Event Tracking
export async function POST(request: NextRequest) {
  try {
    const { event, userData, eventData, eventId, eventSourceUrl } = await request.json();

    if (!event || !userData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get client IP and user agent for better attribution
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Enhanced Meta Conversions API Event with all recommended parameters
    const pixelEvent = {
      data: [
        {
          event_name: event,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId || generateEventId(),
          event_source_url: eventSourceUrl || getEventSourceUrl(request),
          action_source: 'website',
          user_data: {
            // Hashed parameters (SHA-256) - as required by Meta
            em: userData.email ? hashEmail(userData.email) : undefined,
            fn: userData.firstName ? hashString(userData.firstName) : undefined,
            ln: userData.lastName ? hashString(userData.lastName) : undefined,
            ph: userData.phone ? hashPhone(userData.phone) : undefined,
            ct: userData.city ? hashString(userData.city) : undefined,
            st: userData.state ? hashString(userData.state) : undefined,
            zp: userData.zipCode ? hashString(userData.zipCode) : undefined,
            country: userData.country ? hashString(userData.country) : undefined,
            external_id: userData.userId ? hashString(userData.userId) : undefined,
            
            // Non-hashed parameters (as recommended by Meta)
            client_ip_address: clientIP,
            client_user_agent: userAgent,
            fbc: userData.fbc || undefined, // Facebook click ID cookie
            fbp: userData.fbp || undefined, // Facebook browser ID cookie
            subscription_id: userData.subscriptionId || undefined,
          },
          custom_data: {
            ...eventData,
            // Add standard Meta parameters for better optimization
            content_type: eventData?.content_type || 'product',
            content_category: eventData?.content_category || 'subscription',
            content_name: eventData?.content_name || event,
            content_ids: eventData?.content_ids || [userData.userId],
            num_items: eventData?.num_items || 1,
            search_string: eventData?.search_string || undefined,
            status: eventData?.status || 'completed',
          },
          // Enhanced event metadata
          opt_out: false,
          event_source: 'server',
        }
      ],
      test_event_code: process.env.META_PIXEL_TEST_EVENT_CODE || undefined,
      partner_agent: 'angebotnow-conversions-api-v1.0',
    };

    // Send to Meta Conversions API with retry logic
    const response = await sendToMetaAPI(pixelEvent);

    if (!response.success) {
      console.error('Meta Conversions API error:', response.error);
      return NextResponse.json({ 
        error: 'Failed to send event to Meta', 
        details: response.error 
      }, { status: 500 });
    }

    console.log(`Meta Conversions API event '${event}' sent successfully:`, response.result);

    return NextResponse.json({ 
      success: true, 
      result: response.result,
      eventId: pixelEvent.data[0].event_id 
    });
  } catch (error) {
    console.error('Meta Conversions API tracking error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Enhanced API call with retry logic
async function sendToMetaAPI(pixelEvent: any, retries = 3): Promise<{success: boolean, result?: any, error?: string}> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${PIXEL_ID}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
          'User-Agent': 'angebotnow-conversions-api/1.0',
        },
        body: JSON.stringify(pixelEvent),
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, result };
      }

      const errorData = await response.text();
      console.error(`Meta API attempt ${attempt} failed:`, errorData);

      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return { success: false, error: errorData };
      }

      // Retry on server errors (5xx) with exponential backoff
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`Meta API attempt ${attempt} error:`, error);
      if (attempt === retries) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}

// Enhanced hash functions for better data quality
function hashString(str: string): string {
  return crypto.createHash('sha256').update(str.toLowerCase().trim()).digest('hex');
}

function hashEmail(email: string): string {
  return hashString(email);
}

function hashPhone(phone: string): string {
  // Remove all non-digit characters and hash
  const cleanPhone = phone.replace(/\D/g, '');
  return hashString(cleanPhone);
}

// Utility functions for better attribution
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return '127.0.0.1'; // Fallback
}

function getEventSourceUrl(request: NextRequest): string {
  const referer = request.headers.get('referer');
  const origin = request.headers.get('origin');
  
  return referer || origin || `${process.env.NEXTAUTH_URL || 'https://angebotnow.com'}`;
}

function generateEventId(): string {
  return crypto.randomUUID();
}
