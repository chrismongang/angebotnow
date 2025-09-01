import { LoopsClient } from 'loops'

// Server-side Loops client (nur verfügbar auf dem Server)
let loops: LoopsClient | null = null;

// Initialisiere Loops nur auf dem Server
if (typeof window === 'undefined' && process.env.LOOPS_API_KEY) {
  try {
    loops = new LoopsClient(process.env.LOOPS_API_KEY);
  } catch (error) {
    console.warn('Failed to initialize Loops client:', error);
  }
}

// Standard-Properties Interface für alle Events
export interface StandardEventProperties {
  userId: string
  email: string
  plan: 'free' | 'pro'
  quotesCount: number
  createdAt: string
  source?: string
  location?: string
}

// Event-Tracking Helper
export async function trackEvent(
  email: string,
  eventName: string,
  properties: Record<string, any> = {}
) {
  try {
    // Prüfe ob wir auf dem Server sind und Loops verfügbar ist
    if (typeof window === 'undefined' && loops) {
      await loops.sendEvent({
        email,
        eventName,
        eventProperties: properties
      });
      console.log(`✅ Loops Event tracked: ${eventName} for ${email}`);
    } else {
      // Client-side: Sende Event über API Route
      await fetch('/api/loops/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, eventName, properties })
      });
      console.log(`✅ Loops Event sent via API: ${eventName} for ${email}`);
    }
  } catch (error) {
    console.error(`❌ Loops Event failed: ${eventName}`, error);
    // Nicht blockierend - App funktioniert weiter
  }
}

// User-Properties Update Helper
export async function updateUserProperties(
  email: string,
  properties: Record<string, any>
) {
  try {
    if (typeof window === 'undefined' && loops) {
      await loops.updateContact({
        email,
        properties
      });
      console.log(`✅ Loops User updated: ${email}`);
    } else {
      // Client-side: Sende Update über API Route
      await fetch('/api/loops/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, properties })
      });
      console.log(`✅ Loops User update sent via API: ${email}`);
    }
  } catch (error) {
    console.error(`❌ Loops User update failed: ${email}`, error);
  }
}

// Event-Tracking mit Fallback
export async function trackEventWithFallback(
  email: string,
  eventName: string,
  properties: Record<string, any> = {}
) {
  try {
    await trackEvent(email, eventName, properties);
  } catch (error) {
    // Fallback: Event in lokaler Queue speichern
    await saveEventToQueue(email, eventName, properties);
    console.error(`Event saved to queue: ${eventName}`);
  }
}

// Queue für fehlgeschlagene Events (für spätere Implementierung)
async function saveEventToQueue(
  email: string,
  eventName: string,
  properties: Record<string, any>
) {
  // TODO: In Datenbank oder Redis speichern
  console.log(`Event queued: ${eventName} for ${email}`);
}

// Test-Modus für Development
export async function trackEventDev(
  email: string,
  eventName: string,
  properties: Record<string, any> = {}
) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 DEV: Loops Event: ${eventName}`, { email, properties });
    return;
  }

  await trackEvent(email, eventName, properties);
}

// Client-seitiger Event-Tracker (für Browser)
export async function trackEventClient(
  email: string,
  eventName: string,
  properties: Record<string, any> = {}
) {
  try {
    await fetch('/api/loops/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, eventName, properties })
    });
    console.log(`✅ Client Loops Event sent: ${eventName} for ${email}`);
  } catch (error) {
    console.error(`❌ Client Loops Event failed: ${eventName}`, error);
    // Fallback: Speichere in localStorage für späteren Versand
    saveEventToLocalStorage(email, eventName, properties);
  }
}

// Fallback: Speichere Events in localStorage
function saveEventToLocalStorage(
  email: string,
  eventName: string,
  properties: Record<string, any>
) {
  try {
    const events = JSON.parse(localStorage.getItem('loops-events') || '[]');
    events.push({
      email,
      eventName,
      properties,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('loops-events', JSON.stringify(events));
    console.log(`Event saved to localStorage: ${eventName}`);
  } catch (error) {
    console.error('Failed to save event to localStorage:', error);
  }
}
