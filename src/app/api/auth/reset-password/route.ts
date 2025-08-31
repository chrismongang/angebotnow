import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isTokenExpired } from '@/lib/tokens'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token ist erforderlich'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  confirmPassword: z.string().min(1, 'Passwort-Bestätigung ist erforderlich'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password, confirmPassword } = resetPasswordSchema.parse(body)

    // Token in der Datenbank suchen
    const resetToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Ungültiger oder abgelaufener Token' },
        { status: 400 }
      )
    }

    // Token-Typ prüfen
    if (resetToken.type !== 'password-reset') {
      return NextResponse.json(
        { error: 'Ungültiger Token-Typ' },
        { status: 400 }
      )
    }

    // Token-Expiration prüfen
    if (isTokenExpired(resetToken.expires, 'password-reset')) {
      // Token löschen
      await prisma.verificationToken.delete({
        where: { token }
      })
      
      return NextResponse.json(
        { error: 'Token ist abgelaufen. Bitte fordere eine neue Passwort-Reset-Email an.' },
        { status: 400 }
      )
    }

    // User über Email-Adresse finden
    const user = await prisma.user.findUnique({
      where: { email: resetToken.identifier },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      )
    }

    // Prüfen ob User Email/Password Auth verwendet
    if (!user.password) {
      return NextResponse.json(
        { error: 'Dieses Konto wurde über Google angemeldet. Passwort-Reset ist nicht verfügbar.' },
        { status: 400 }
      )
    }

    // Neues Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 12)

    // Passwort aktualisieren
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    // Token löschen
    await prisma.verificationToken.delete({
      where: { token }
    })

    return NextResponse.json(
      { 
        message: 'Passwort erfolgreich zurückgesetzt!',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Eingabedaten', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// GET-Endpoint für Token-Validierung (ohne Passwort-Reset)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token ist erforderlich' },
        { status: 400 }
      )
    }

    // Token in der Datenbank suchen
    const resetToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!resetToken) {
      return NextResponse.json(
        { valid: false, error: 'Ungültiger Token' },
        { status: 200 }
      )
    }

    // Token-Typ prüfen
    if (resetToken.type !== 'password-reset') {
      return NextResponse.json(
        { valid: false, error: 'Ungültiger Token-Typ' },
        { status: 200 }
      )
    }

    // Token-Expiration prüfen
    if (isTokenExpired(resetToken.expires, 'password-reset')) {
      return NextResponse.json(
        { valid: false, error: 'Token ist abgelaufen' },
        { status: 200 }
      )
    }

    // User-Daten für die Reset-Seite
    const user = await prisma.user.findUnique({
      where: { email: resetToken.identifier },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { valid: false, error: 'Benutzer nicht gefunden' },
        { status: 200 }
      )
    }

    // Prüfen ob User Email/Password Auth verwendet
    if (!user.password) {
      return NextResponse.json(
        { valid: false, error: 'Dieses Konto wurde über Google angemeldet' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { 
        valid: true,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
