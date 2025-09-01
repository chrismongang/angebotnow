// Type definitions
interface ShareData {
  title: string;
  text: string;
  url: string;
}

export class WhatsAppService {
  // Generiert WhatsApp-Link mit vorgefertigter Nachricht
  static generateWhatsAppLink(phoneNumber: string, message: string): string {
    // Entferne alle nicht-numerischen Zeichen außer +
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    
    // Stelle sicher, dass die Nummer mit + beginnt
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
    
    // URL-encode die Nachricht
    const encodedMessage = encodeURIComponent(message);
    
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  }

  // Generiert Referral-Nachricht für WhatsApp
  static generateReferralMessage(data: {
    inviterName: string;
    inviterEmail: string;
    inviteCode: string;
    appName?: string;
  }): string {
    const appName = data.appName || 'AngebotNow';
    
    return `👋 Hallo! 

${data.inviterName} lädt dich zu ${appName} ein!

🎁 Du bekommst 2 GRATIS-Angebote wenn du dich registrierst!

${appName} ist eine KI-gestützte Plattform für professionelle Angebotserstellung. Perfekt für Handwerker, Dienstleister und alle, die Angebote erstellen müssen.

📱 Registriere dich hier:
${process.env.NEXTAUTH_URL || 'https://angebotnow.de'}/auth/signin?referral=${data.inviteCode}

💡 Dein persönlicher Einladungscode: ${data.inviteCode}

Nach der Registrierung bekommt ihr beide 2 zusätzliche Gratis-Angebote!

Viele Grüße
${data.inviterName}`;
  }

  // Generiert kurze Referral-Nachricht für Social Media
  static generateShortReferralMessage(data: {
    inviterName: string;
    inviteCode: string;
    appName?: string;
  }): string {
    const appName = data.appName || 'AngebotNow';
    
    return `🎁 ${data.inviterName} lädt dich zu ${appName} ein! 

Du bekommst 2 GRATIS-Angebote! 

Registriere dich mit Code: ${data.inviteCode}

${process.env.NEXTAUTH_URL || 'https://angebotnow.de'}/auth/signin?referral=${data.inviteCode}`;
  }

  // Generiert SMS-Link (für iOS/Android)
  static generateSMSLink(phoneNumber: string, message: string): string {
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    const encodedMessage = encodeURIComponent(message);
    
    return `sms:${cleanPhone}?body=${encodedMessage}`;
  }

  // Generiert Telegram-Link
  static generateTelegramLink(username: string, message: string): string {
    const encodedMessage = encodeURIComponent(message);
    return `https://t.me/${username}?text=${encodedMessage}`;
  }

  // Generiert allgemeinen Share-Link (für Web Share API)
  static generateShareData(data: {
    inviterName: string;
    inviteCode: string;
    appName?: string;
  }): ShareData {
    const appName = data.appName || 'AngebotNow';
    const url = `${process.env.NEXTAUTH_URL || 'https://angebotnow.de'}/auth/signin?referral=${data.inviteCode}`;
    
    return {
      title: `${data.inviterName} lädt dich zu ${appName} ein!`,
      text: `Du bekommst 2 GRATIS-Angebote! Registriere dich mit Code: ${data.inviteCode}`,
      url: url
    };
  }

  // Validiert Telefonnummer
  static validatePhoneNumber(phone: string): boolean {
    // Entferne alle nicht-numerischen Zeichen außer +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // Mindestens 10 Ziffern (mit Ländervorwahl)
    return cleanPhone.length >= 10;
  }

  // Formatiert Telefonnummer für Anzeige
  static formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    if (cleanPhone.startsWith('49')) {
      // Deutsche Nummer
      return `+${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7)}`;
    } else if (cleanPhone.startsWith('+')) {
      return cleanPhone;
    } else {
      return `+${cleanPhone}`;
    }
  }
}
