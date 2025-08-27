import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { feedback, userEmail, userName } = await request.json()

    if (!feedback || typeof feedback !== 'string') {
      return NextResponse.json({ error: 'Invalid feedback' }, { status: 400 })
    }

    // Send email with feedback
    await sendFeedbackEmail({
      feedback,
      userEmail: userEmail || session.user.email || 'Unknown',
      userName: userName || session.user.name || 'Unknown',
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function sendFeedbackEmail({ 
  feedback, 
  userEmail, 
  userName, 
  timestamp 
}: {
  feedback: string
  userEmail: string
  userName: string
  timestamp: string
}) {
  // Log feedback to console for development
  console.log('=== FEEDBACK RECEIVED ===')
  console.log('From:', userName, `(${userEmail})`)
  console.log('Time:', new Date(timestamp).toLocaleString('de-DE'))
  console.log('Feedback:', feedback)
  console.log('========================')

  // Send email if RESEND_API_KEY is configured
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      await resend.emails.send({
        from: 'feedback@angebotnow.de',
        to: 'chris@angebotnow.de',
        subject: `Neues Feedback von ${userName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #F89813; border-bottom: 2px solid #F89813; padding-bottom: 10px;">
              Neues Feedback erhalten
            </h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Von:</strong> ${userName} (${userEmail})</p>
              <p><strong>Zeitpunkt:</strong> ${new Date(timestamp).toLocaleString('de-DE')}</p>
            </div>
            
            <div style="background: #ffffff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #404040; margin-top: 0;">Feedback:</h3>
              <div style="white-space: pre-wrap; line-height: 1.6; color: #404040;">
                ${feedback.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #676767; font-size: 14px;">
              <p>Dieses Feedback wurde über die AngebotNow App gesendet.</p>
            </div>
          </div>
        `
      })
      
      console.log('Feedback email sent successfully')
    } catch (error) {
      console.error('Error sending feedback email:', error)
      // Don't throw error - feedback is still logged to console
    }
  } else {
    console.log('RESEND_API_KEY not configured - email not sent')
  }
}
