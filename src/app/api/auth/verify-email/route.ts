import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateToken, isTokenExpired } from '@/lib/tokens'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token ist erforderlich' },
        { status: 400 }
      )
    }

    // Token in der Datenbank suchen
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Ungültiger oder abgelaufener Token' },
        { status: 400 }
      )
    }

    // Token-Typ prüfen
    if (verificationToken.type !== 'email-verification') {
      return NextResponse.json(
        { error: 'Ungültiger Token-Typ' },
        { status: 400 }
      )
    }

    // Token-Expiration prüfen
    if (isTokenExpired(verificationToken.expires, 'email-verification')) {
      // Token löschen
      await prisma.verificationToken.delete({
        where: { token }
      })
      
      return NextResponse.json(
        { error: 'Token ist abgelaufen. Bitte fordere eine neue Verifikations-Email an.' },
        { status: 400 }
      )
    }

    // User über Email-Adresse finden
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      )
    }

    // Email als verifiziert markieren
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    })

    // Token löschen
    await prisma.verificationToken.delete({
      where: { token }
    })

    // Willkommens-Email senden
    const welcomeEmailResult = await emailService.sendWelcomeEmail({
      firstName: user.firstName || 'Benutzer',
      email: user.email
    })

    if (!welcomeEmailResult.success) {
      console.error('Failed to send welcome email:', welcomeEmailResult.error)
      // Verifikation trotzdem erfolgreich, nur Email-Versand fehlgeschlagen
    }

    return NextResponse.json(
      { 
        message: 'Email-Adresse erfolgreich verifiziert!',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          emailVerified: new Date()
        },
        welcomeEmailSent: welcomeEmailResult.success
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// GET-Endpoint für Token-Validierung (ohne Verifikation)
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
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { valid: false, error: 'Ungültiger Token' },
        { status: 200 }
      )
    }

    // Token-Typ prüfen
    if (verificationToken.type !== 'email-verification') {
      return NextResponse.json(
        { valid: false, error: 'Ungültiger Token-Typ' },
        { status: 200 }
      )
    }

    // Token-Expiration prüfen
    if (isTokenExpired(verificationToken.expires, 'email-verification')) {
      return NextResponse.json(
        { valid: false, error: 'Token ist abgelaufen' },
        { status: 200 }
      )
    }

    // User-Daten für die Verifikationsseite
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    })

    return NextResponse.json(
      { 
        valid: true,
        user: user ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        } : null
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
