import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { emailService } from '@/lib/email'
import { createTokenRecord } from '@/lib/tokens'
import { z } from 'zod'

const resendSchema = z.object({
  email: z.string().email('Ungültige Email-Adresse'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = resendSchema.parse(body)

    // User finden
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer mit dieser Email-Adresse nicht gefunden' },
        { status: 404 }
      )
    }

    // Prüfen ob Email bereits verifiziert ist
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email-Adresse ist bereits verifiziert' },
        { status: 400 }
      )
    }

    // Alte Verifikations-Tokens löschen
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
        type: 'email-verification'
      }
    })

    // Neuen Verifikations-Token erstellen
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
      firstName: user.firstName || 'Benutzer',
      email,
      token: verificationToken.token
    })

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      return NextResponse.json(
        { error: 'Fehler beim Senden der Verifikations-Email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Verifikations-Email wurde erfolgreich gesendet',
        emailSent: true
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Email-Adresse' },
        { status: 400 }
      )
    }

    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
