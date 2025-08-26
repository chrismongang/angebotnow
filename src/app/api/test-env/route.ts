import { NextResponse } from 'next/server'

export async function GET() {
  // Test environment variables without exposing their values
  const envStatus = {
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    DATABASE_URL: !!process.env.DATABASE_URL,
  }

  // Additional validation for Google OAuth
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

  // Check if Google OAuth is properly configured
  const googleOAuthValid = googleClientId && 
                          googleClientSecret && 
                          googleClientId.length > 0 && 
                          googleClientSecret.length > 0 &&
                          googleClientId !== '""' && 
                          googleClientSecret !== '""'

  return NextResponse.json({
    ...envStatus,
    GOOGLE_CLIENT_ID: googleOAuthValid,
    GOOGLE_CLIENT_SECRET: googleOAuthValid,
    googleOAuthValid
  })
}

