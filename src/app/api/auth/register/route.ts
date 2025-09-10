import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { emailService } from '@/lib/email'
import { createTokenRecord } from '@/lib/tokens'
import { trackEvent, updateUserProperties } from '@/lib/loops'

const registerSchema = z.object({
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen lang sein'),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Ungültige Email-Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password } = registerSchema.parse(body)

    // Prüfen ob User bereits existiert (ohne password Feld)
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ein Benutzer mit dieser Email-Adresse existiert bereits' },
        { status: 400 }
      )
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 12)

    // User erstellen (ohne Email-Verifikation)
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`, // Temporär für Kompatibilität
        email,
        password: hashedPassword,
        emailVerified: null, // Email noch nicht verifiziert
      },
    })

    // Loops Event: signed_up
    await trackEvent(email, 'signed_up', {
      userId: user.id,
      firstName,
      lastName,
      plan: 'free',
      quotesCount: 0,
      createdAt: user.createdAt.toISOString(),
      source: 'email_password' // oder 'google_oauth', 'microsoft_oauth'
    })

    // Meta Pixel Event: CompleteRegistration
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/analytics/meta-pixel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'CompleteRegistration',
          userData: {
            email,
            firstName,
            lastName,
            userId: user.id,
          },
          eventData: {
            plan: 'free',
            source: 'email_password',
            registration_time: user.createdAt.toISOString(),
          }
        }),
      });
    } catch (error) {
      console.error('Meta Pixel CompleteRegistration tracking failed:', error);
      // Don't fail registration if tracking fails
    }

    // User Properties in Loops setzen
    await updateUserProperties(email, {
      userId: user.id,
      firstName,
      lastName,
      plan: 'free',
      quotesCount: 0,
      createdAt: user.createdAt.toISOString(),
      emailVerified: false,
      subscriptionStatus: 'FREE',
      subscriptionTier: 'FREE'
    })

    // Email-Verifikation Token erstellen
    const tokenRecord = createTokenRecord(email, 'email-verification')
    const verificationToken = await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: tokenRecord.token,
        expires: tokenRecord.expires,
        type: 'email-verification'
      }
    })

    // Verifikations-Email senden
    const emailResult = await emailService.sendVerificationEmail({
      firstName,
      email,
      token: verificationToken.token // Wir verwenden den gehashten Token für den Link
    })

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      // User trotzdem erstellen, aber Email-Versand fehlgeschlagen
    }

    return NextResponse.json(
      { 
        message: 'Benutzer erfolgreich erstellt. Bitte verifiziere deine Email-Adresse.',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        emailSent: emailResult.success
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Eingabedaten', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}