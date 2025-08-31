import { LoopsClient } from 'loops'

export const loops = new LoopsClient(process.env.LOOPS_API_KEY!)

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
    await loops.sendEvent({
      email,
      eventName,
      eventProperties: properties
    })
    console.log(`✅ Loops Event tracked: ${eventName} for ${email}`)
  } catch (error) {
    console.error(`❌ Loops Event failed: ${eventName}`, error)
    // Nicht blockierend - App funktioniert weiter
  }
}

// User-Properties Update Helper
export async function updateUserProperties(
  email: string,
  properties: Record<string, any>
) {
  try {
    await loops.updateContact({
      email,
      properties
    })
    console.log(`✅ Loops User updated: ${email}`)
  } catch (error) {
    console.error(`❌ Loops User update failed: ${email}`, error)
  }
}

// Event-Tracking mit Fallback
export async function trackEventWithFallback(
  email: string,
  eventName: string,
  properties: Record<string, any> = {}
) {
  try {
    await trackEvent(email, eventName, properties)
  } catch (error) {
    // Fallback: Event in lokaler Queue speichern
    await saveEventToQueue(email, eventName, properties)
    console.error(`Event saved to queue: ${eventName}`)
  }
}

// Queue für fehlgeschlagene Events (für spätere Implementierung)
async function saveEventToQueue(
  email: string,
  eventName: string,
  properties: Record<string, any>
) {
  // TODO: In Datenbank oder Redis speichern
  console.log(`Event queued: ${eventName} for ${email}`)
}

// Test-Modus für Development
export async function trackEventDev(
  email: string,
  eventName: string,
  properties: Record<string, any> = {}
) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 DEV: Loops Event: ${eventName}`, { email, properties })
    return
  }

  await trackEvent(email, eventName, properties)
}
