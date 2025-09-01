import { prisma } from '@/lib/db';
import { randomBytes } from 'crypto';
import { WhatsAppService } from './whatsapp';

export class ReferralSystem {
  // Generiert eindeutigen Referral-Code
  static generateReferralCode(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  // Erstellt Referral-Code für User
  static async createReferralCode(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true }
    });

    if (user?.referralCode) {
      return user.referralCode;
    }

    let referralCode: string = '';
    let isUnique = false;

    // Generiere eindeutigen Code
    while (!isUnique) {
      referralCode = this.generateReferralCode();
      const existing = await prisma.user.findUnique({
        where: { referralCode }
      });
      if (!existing) isUnique = true;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { referralCode: referralCode }
    });

    return referralCode;
  }

  // Verarbeitet erfolgreichen Referral
  static async processSuccessfulReferral(
    inviterId: string, 
    inviteeId: string
  ): Promise<void> {
    const [inviter, invitee] = await Promise.all([
      prisma.user.findUnique({ where: { id: inviterId } }),
      prisma.user.findUnique({ where: { id: inviteeId } })
    ]);

    if (!inviter || !invitee) return;

    // Beide User bekommen 2 Gratis-Credits
    await Promise.all([
      prisma.user.update({
        where: { id: inviterId },
        data: { 
          referralCredits: { increment: 2 },
          referralCount: { increment: 1 }
        }
      }),
      prisma.user.update({
        where: { id: inviteeId },
        data: { 
          referralCredits: { increment: 2 },
          referredBy: inviterId
        }
      })
    ]);

    // Referral-Status aktualisieren
    await prisma.referralInvite.updateMany({
      where: { 
        inviterId, 
        inviteeEmail: invitee.email,
        status: 'PENDING'
      },
      data: { 
        status: 'ACCEPTED',
        acceptedAt: new Date()
      }
    });
  }

  // Prüft ob User Referral-Credits hat
  static async hasReferralCredits(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCredits: true }
    });
    return (user?.referralCredits || 0) > 0;
  }

  // Verwendet Referral-Credit
  static async consumeReferralCredit(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCredits: true }
    });

    if ((user?.referralCredits || 0) <= 0) return false;

    await prisma.user.update({
      where: { id: userId },
      data: { referralCredits: { decrement: 1 } }
    });

    return true;
  }

  // Holt alle Referral-Informationen für einen User
  static async getUserReferralInfo(userId: string): Promise<{
    referralCode: string | null;
    referralCount: number;
    referralCredits: number;
    referredBy: string | null;
    referrals: Array<{ id: string; email: string; createdAt: Date }>;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        referralCount: true,
        referralCredits: true,
        referredBy: true,
        referrals: {
          select: {
            id: true,
            email: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return {
        referralCode: null,
        referralCount: 0,
        referralCredits: 0,
        referredBy: null,
        referrals: []
      };
    }

    return {
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      referralCredits: user.referralCredits,
      referredBy: user.referredBy,
      referrals: user.referrals
    };
  }

  // Erstellt eine neue Einladung
  static async createInvite(
    inviterId: string,
    inviteeEmail: string
  ): Promise<{ success: boolean; inviteCode?: string; error?: string }> {
    try {
      // Prüfe ob User sich selbst einlädt
      const inviter = await prisma.user.findUnique({
        where: { id: inviterId },
        select: { email: true }
      });

      if (inviter?.email === inviteeEmail) {
        return { success: false, error: 'Cannot invite yourself' };
      }

      // Prüfe ob E-Mail bereits existiert
      const existingUser = await prisma.user.findUnique({
        where: { email: inviteeEmail }
      });

      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }

      // Prüfe ob bereits eine Einladung existiert
      const existingInvite = await prisma.referralInvite.findFirst({
        where: {
          inviterId,
          inviteeEmail,
          status: 'PENDING'
        }
      });

      if (existingInvite) {
        return { success: false, error: 'Invite already sent' };
      }

      // Erstelle Einladung
      const inviteCode = this.generateReferralCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Läuft in 7 Tagen ab

      await prisma.referralInvite.create({
        data: {
          inviterId,
          inviteeEmail,
          inviteCode,
          expiresAt
        }
      });

      return { success: true, inviteCode };
    } catch (error) {
      console.error('Error creating invite:', error);
      return { success: false, error: 'Failed to create invite' };
    }
  }

  // NEU: Erstellt Multi-Channel Einladung
  static async createMultiChannelInvite(data: {
    inviterId: string;
    channel: 'whatsapp' | 'sms' | 'email' | 'share';
    contact: string; // E-Mail, Telefonnummer oder Username
    inviterName: string;
    inviterEmail: string;
  }): Promise<{
    success: boolean;
    inviteCode?: string;
    shareLinks?: {
      whatsapp?: string;
      sms?: string;
      telegram?: string;
      shareData?: ShareData;
    };
    error?: string;
  }> {
    try {
      // Generiere Referral-Code
      const inviteCode = await this.createReferralCode(data.inviterId);
      
      // Erstelle Einladung in der Datenbank (nur für E-Mail)
      if (data.channel === 'email') {
        const inviteResult = await this.createInvite(data.inviterId, data.contact);
        if (!inviteResult.success) {
          return inviteResult;
        }
      }

      // Generiere Share-Links basierend auf Kanal
      const shareLinks: {
        whatsapp?: string;
        sms?: string;
        telegram?: string;
        shareData?: ShareData;
      } = {};

      if (data.channel === 'whatsapp' && WhatsAppService.validatePhoneNumber(data.contact)) {
        const message = WhatsAppService.generateReferralMessage({
          inviterName: data.inviterName,
          inviterEmail: data.inviterEmail,
          inviteCode
        });
        shareLinks.whatsapp = WhatsAppService.generateWhatsAppLink(data.contact, message);
      }

      if (data.channel === 'sms' && WhatsAppService.validatePhoneNumber(data.contact)) {
        const message = WhatsAppService.generateShortReferralMessage({
          inviterName: data.inviterName,
          inviteCode
        });
        shareLinks.sms = WhatsAppService.generateSMSLink(data.contact, message);
      }

      if (data.channel === 'share') {
        shareLinks.shareData = WhatsAppService.generateShareData({
          inviterName: data.inviterName,
          inviteCode
        });
      }

      return {
        success: true,
        inviteCode,
        shareLinks
      };
    } catch (error) {
      console.error('Error creating multi-channel invite:', error);
      return { success: false, error: 'Failed to create invite' };
    }
  }

  // Validiert einen Einladungscode
  static async validateInviteCode(inviteCode: string): Promise<{
    valid: boolean;
    inviterId?: string;
    error?: string;
  }> {
    try {
      const invite = await prisma.referralInvite.findFirst({
        where: {
          inviteCode,
          status: 'PENDING',
          expiresAt: { gt: new Date() }
        },
        include: { inviter: true }
      });

      if (!invite) {
        return { valid: false, error: 'Invalid or expired invite code' };
      }

      return { valid: true, inviterId: invite.inviterId };
    } catch (error) {
      console.error('Error validating invite code:', error);
      return { valid: false, error: 'Failed to validate invite code' };
    }
  }

  // Bereinigt abgelaufene Einladungen
  static async cleanupExpiredInvites(): Promise<void> {
    try {
      await prisma.referralInvite.updateMany({
        where: {
          expiresAt: { lt: new Date() },
          status: 'PENDING'
        },
        data: { status: 'EXPIRED' }
      });
    } catch (error) {
      console.error('Error cleaning up expired invites:', error);
    }
  }

  // NEU: Generiert QR-Code für Referral (für Offline-Sharing)
  static generateReferralQRCode(referralCode: string): string {
    const url = `${process.env.NEXTAUTH_URL || 'https://angebotnow.de'}/auth/signin?referral=${referralCode}`;
    // Hier könnte ein QR-Code Generator integriert werden
    // Für jetzt geben wir die URL zurück
    return url;
  }

  // NEU: Generiert Referral-Link für Social Media
  static generateSocialMediaLink(referralCode: string, platform: 'twitter' | 'facebook' | 'linkedin'): string {
    const baseUrl = `${process.env.NEXTAUTH_URL || 'https://angebotnow.de'}/auth/signin?referral=${referralCode}`;
    const message = encodeURIComponent(`🎁 Ich lade dich zu AngebotNow ein! Du bekommst 2 GRATIS-Angebote! Registriere dich hier: ${baseUrl}`);
    
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${message}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}`;
      default:
        return baseUrl;
    }
  }
}
