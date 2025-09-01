import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ReferralSystem } from '@/lib/referral';
import { MultiChannelReferralService } from '@/lib/email';
import { trackEvent } from '@/lib/loops';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      channel, 
      contact, 
      inviterName = session.user.name || session.user.email?.split('@')[0] || 'Ein Freund'
    } = await request.json();
    
    if (!channel || !contact) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validiere Kanal
    if (!['whatsapp', 'sms', 'email', 'share'].includes(channel)) {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 });
    }

    // Hole User-Informationen
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        email: true, 
        name: true,
        referralCode: true 
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Erstelle Multi-Channel Einladung
    const result = await ReferralSystem.createMultiChannelInvite({
      inviterId: session.user.id,
      channel: channel as 'whatsapp' | 'sms' | 'email' | 'share',
      contact,
      inviterName: inviterName,
      inviterEmail: user.email!
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Sende Einladung über den gewählten Kanal
    if (channel === 'email') {
      await MultiChannelReferralService.sendReferralInvite({
        channel: 'email',
        contact,
        inviteCode: result.inviteCode!,
        inviterName: inviterName,
        inviterEmail: user.email!
      });
    }

    // Generiere alle verfügbaren Share-Links
    const allShareLinks = MultiChannelReferralService.generateAllShareLinks({
      inviteCode: result.inviteCode!,
      inviterName: inviterName,
      inviterEmail: user.email!
    });

    // Loops Event: referral_invite_sent
    await trackEvent(session.user.email!, 'referral_invite_sent', {
      userId: session.user.id,
      channel,
      contact: channel === 'email' ? contact : undefined, // Nur E-Mail für Tracking
      inviteCode: result.inviteCode,
      source: 'api_referral_invite'
    });

    return NextResponse.json({ 
      success: true, 
      inviteCode: result.inviteCode,
      shareLinks: {
        ...result.shareLinks,
        ...allShareLinks
      }
    });
  } catch (error) {
    console.error('Referral invite error:', error);
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 });
  }
}
