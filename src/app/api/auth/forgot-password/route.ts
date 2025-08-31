import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { emailService } from '@/lib/email'
import { createTokenRecord } from '@/lib/tokens'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Ungültige Email-Adresse'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // User finden
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true, // Nur Email/Password User haben ein Passwort
        emailVerified: true
      }
    })

    if (!user) {
      // Aus Sicherheitsgründen geben wir keine Information über existierende User
      return NextResponse.json(
        { message: 'Falls ein Konto mit dieser Email-Adresse existiert, wurde eine Passwort-Reset-Email gesendet.' },
        { status: 200 }
      )
    }

    // Prüfen ob User Email/Password Auth verwendet (hat ein Passwort)
    if (!user.password) {
      // User hat sich über OAuth angemeldet (Google, etc.)
      return NextResponse.json(
        { error: 'Dieses Konto wurde über Google angemeldet. Bitte verwende die Google-Anmeldung.' },
        { status: 400 }
      )
    }

    // Prüfen ob Email verifiziert ist
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Bitte verifiziere zuerst deine Email-Adresse, bevor du dein Passwort zurücksetzen kannst.' },
        { status: 400 }
      )
    }

    // Alte Passwort-Reset-Tokens löschen
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
        type: 'password-reset'
      }
    })

    // Neuen Passwort-Reset-Token erstellen
    const tokenRecord = createTokenRecord(email, 'password-reset')
    const resetToken = await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: tokenRecord.token,
        expires: tokenRecord.expires,
        type: 'password-reset'
      }
    })

    // Passwort-Reset-Email senden
    const emailResult = await emailService.sendPasswordResetEmail({
      firstName: user.firstName || 'Benutzer',
      email,
      token: resetToken.token
    })

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error)
      return NextResponse.json(
        { error: 'Fehler beim Senden der Passwort-Reset-Email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Falls ein Konto mit dieser Email-Adresse existiert, wurde eine Passwort-Reset-Email gesendet.',
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

    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
