import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailVerificationData {
  firstName: string
  email: string
  token: string
}

export interface PasswordResetData {
  firstName: string
  email: string
  token: string
}

export interface WelcomeData {
  firstName: string
  email: string
}

// Email-Verifikation Template
const createVerificationEmail = (data: EmailVerificationData) => ({
  from: 'AngebotNow <info@angebotnow.de>',
  to: data.email,
  subject: 'Verifiziere deine Email-Adresse - AngebotNow',
  html: `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email-Verifikation - AngebotNow</title>
      <style>
        body { font-family: 'Manrope', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #F89813 0%, #FFB366 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
        .button { display: inline-block; background: linear-gradient(135deg, #F89813 0%, #FFB366 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #F89813; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Willkommen bei AngebotNow!</h1>
        </div>
        <div class="content">
          <h2>Hallo ${data.firstName},</h2>
          <p>vielen Dank für deine Registrierung bei AngebotNow! Um dein Konto zu aktivieren und professionelle Angebote erstellen zu können, verifiziere bitte deine Email-Adresse.</p>
          
          <div class="highlight">
            <strong>Wichtig:</strong> Ohne Email-Verifikation kannst du keine Angebote erstellen.
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/auth/verify?token=${data.token}" class="button">
              Email-Adresse verifizieren
            </a>
          </p>
          
          <p><strong>Was dich erwartet:</strong></p>
          <ul>
            <li>🤖 KI-gestützte Angebotserstellung</li>
            <li>📄 Professionelle PDF-Generierung</li>
            <li>☁️ Sichere Cloud-Speicherung</li>
            <li>📱 Mobile-optimierte Benutzeroberfläche</li>
          </ul>
          
          <p>Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">
            ${process.env.NEXTAUTH_URL}/auth/verify?token=${data.token}
          </p>
          
          <p>Der Link ist 24 Stunden gültig.</p>
        </div>
        <div class="footer">
          <p>Falls du dich nicht bei AngebotNow registriert hast, kannst du diese Email ignorieren.</p>
          <p>&copy; 2025 AngebotNow. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </body>
    </html>
  `
})

// Passwort-Reset Template
const createPasswordResetEmail = (data: PasswordResetData) => ({
  from: 'AngebotNow <info@angebotnow.de>',
  to: data.email,
  subject: 'Passwort zurücksetzen - AngebotNow',
  html: `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Passwort zurücksetzen - AngebotNow</title>
      <style>
        body { font-family: 'Manrope', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #F89813 0%, #FFB366 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
        .button { display: inline-block; background: linear-gradient(135deg, #F89813 0%, #FFB366 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #F89813; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Passwort zurücksetzen</h1>
        </div>
        <div class="content">
          <h2>Hallo ${data.firstName},</h2>
          <p>wir haben eine Anfrage zum Zurücksetzen deines Passworts für dein AngebotNow-Konto erhalten.</p>
          
          <div class="warning">
            <strong>Sicherheitshinweis:</strong> Falls du diese Anfrage nicht gestellt hast, kannst du diese Email ignorieren.
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/auth/reset-password?token=${data.token}" class="button">
              Neues Passwort festlegen
            </a>
          </p>
          
          <p>Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">
            ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${data.token}
          </p>
          
          <p><strong>Wichtige Hinweise:</strong></p>
          <ul>
            <li>Der Link ist 1 Stunde gültig</li>
            <li>Nach der Passwort-Änderung wird dein altes Passwort ungültig</li>
            <li>Falls du Probleme hast, kontaktiere unseren Support</li>
          </ul>
        </div>
        <div class="footer">
          <p>Falls du diese Anfrage nicht gestellt hast, ist dein Konto sicher.</p>
          <p>&copy; 2025 AngebotNow. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </body>
    </html>
  `
})

// Willkommens-Email Template
const createWelcomeEmail = (data: WelcomeData) => ({
  from: 'AngebotNow <info@angebotnow.de>',
  to: data.email,
  subject: 'Willkommen bei AngebotNow! 🎉',
  html: `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Willkommen - AngebotNow</title>
      <style>
        body { font-family: 'Manrope', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #F89813 0%, #FFB366 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
        .button { display: inline-block; background: linear-gradient(135deg, #F89813 0%, #FFB366 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .feature { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #F89813; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Willkommen bei AngebotNow!</h1>
        </div>
        <div class="content">
          <h2>Hallo ${data.firstName},</h2>
          <p>herzlich willkommen bei AngebotNow! Deine Email-Adresse wurde erfolgreich verifiziert und dein Konto ist jetzt vollständig aktiviert.</p>
          
          <p style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">
              Zum Dashboard
            </a>
          </p>
          
          <h3>🚀 Was du jetzt machen kannst:</h3>
          
          <div class="feature">
            <strong>📸 Angebot erstellen:</strong> Lade ein Foto hoch und beschreibe dein Projekt
          </div>
          
          <div class="feature">
            <strong>🤖 KI-Unterstützung:</strong> Unsere KI erstellt einen professionellen Angebotsentwurf
          </div>
          
          <div class="feature">
            <strong>📄 PDF generieren:</strong> Erstelle sofort eine druckbare PDF-Version
          </div>
          
          <div class="feature">
            <strong>☁️ Speichern & Verwalten:</strong> Alle Angebote werden sicher in der Cloud gespeichert
          </div>
          
          <h3>💡 Tipps für den Start:</h3>
          <ul>
            <li>Nutze hochauflösende Fotos für bessere Ergebnisse</li>
            <li>Beschreibe dein Projekt so detailliert wie möglich</li>
            <li>Passe die KI-Vorschläge nach deinen Bedürfnissen an</li>
            <li>Speichere deine Angebote regelmäßig</li>
          </ul>
          
          <p><strong>Hast du Fragen?</strong> Unser Support-Team hilft dir gerne weiter!</p>
        </div>
        <div class="footer">
          <p>Viel Erfolg mit AngebotNow! 🚀</p>
          <p>&copy; 2025 AngebotNow. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </body>
    </html>
  `
})

// Email-Service Funktionen
export const emailService = {
  // Email-Verifikation senden
  async sendVerificationEmail(data: EmailVerificationData) {
    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured - verification email not sent')
      return { success: false, error: 'Email service not configured' }
    }

    try {
      const emailData = createVerificationEmail(data)
      const result = await resend.emails.send(emailData)
      
      console.log('Verification email sent:', result)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error sending verification email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  // Passwort-Reset Email senden
  async sendPasswordResetEmail(data: PasswordResetData) {
    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured - password reset email not sent')
      return { success: false, error: 'Email service not configured' }
    }

    try {
      const emailData = createPasswordResetEmail(data)
      const result = await resend.emails.send(emailData)
      
      console.log('Password reset email sent:', result)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error sending password reset email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  // Willkommens-Email senden
  async sendWelcomeEmail(data: WelcomeData) {
    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured - welcome email not sent')
      return { success: false, error: 'Email service not configured' }
    }

    try {
      const emailData = createWelcomeEmail(data)
      const result = await resend.emails.send(emailData)
      
      console.log('Welcome email sent:', result)
      return { success: true, data: result }
    } catch (error) {
      console.error('Error sending welcome email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  async sendReferralInvite(
    inviteeEmail: string, 
    inviteCode: string, 
    inviterEmail: string
  ): Promise<void> {
    const subject = `${inviterEmail} lädt dich zu AngebotNow ein!`;
    
    const html = `
      <div style="font-family: 'Manrope', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">AngebotNow</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
            Dein Freund ${inviterEmail} lädt dich ein!
          </p>
        </div>
        
        <div style="padding: 40px 20px; background: white;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">
            🎁 Du bekommst 2 Gratis-Angebote!
          </h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            ${inviterEmail} hat dich zu AngebotNow eingeladen - der KI-gestützten Plattform 
            für professionelle Angebotserstellung. Wenn du dich registrierst, bekommt ihr 
            beide 2 zusätzliche Gratis-Angebote!
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Was du bekommst:</h3>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
              <li>2 Gratis-Angebote (zusätzlich zu den 5 monatlichen)</li>
              <li>KI-gestützte Angebotserstellung</li>
              <li>Professionelle PDF-Exporte</li>
              <li>Einfache Bedienung</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/auth/signin?referral=${inviteCode}" 
               style="display: inline-block; background: #f97316; color: white; padding: 16px 32px; 
                      text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Jetzt registrieren & 2 Gratis-Angebote sichern
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
            Diese Einladung läuft in 7 Tagen ab.
          </p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'AngebotNow <info@angebotnow.de>',
      to: inviteeEmail,
      subject: subject,
      html: html,
    });
  }
}

// NEU: Multi-Channel Referral Service
export class MultiChannelReferralService {
  // Sendet Referral-Einladung über den gewählten Kanal
  static async sendReferralInvite(data: {
    channel: 'whatsapp' | 'sms' | 'email' | 'share';
    contact: string;
    inviteCode: string;
    inviterName: string;
    inviterEmail: string;
  }): Promise<{
    success: boolean;
    shareLinks?: any;
    error?: string;
  }> {
    try {
      switch (data.channel) {
        case 'email':
          await emailService.sendReferralInvite(data.contact, data.inviteCode, data.inviterEmail);
          return { success: true };
          
        case 'whatsapp':
        case 'sms':
        case 'share':
          // Diese Kanäle generieren nur Links, keine E-Mails
          return { success: true };
          
        default:
          return { success: false, error: 'Unsupported channel' };
      }
    } catch (error) {
      console.error('Error sending referral invite:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Generiert alle verfügbaren Share-Links für einen Referral
  static generateAllShareLinks(data: {
    inviteCode: string;
    inviterName: string;
    inviterEmail: string;
  }): {
    whatsapp?: string;
    sms?: string;
    email?: string;
    social: {
      twitter: string;
      facebook: string;
      linkedin: string;
    };
    qrCode: string;
    directLink: string;
  } {
    const { WhatsAppService } = require('./whatsapp');
    
    const baseUrl = `${process.env.NEXTAUTH_URL || 'https://angebotnow.de'}/auth/signin?referral=${data.inviteCode}`;
    
    return {
      social: {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎁 ${data.inviterName} lädt dich zu AngebotNow ein! Du bekommst 2 GRATIS-Angebote! ${baseUrl}`)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}`
      },
      qrCode: baseUrl, // Für QR-Code Generator
      directLink: baseUrl
    };
  }
}
