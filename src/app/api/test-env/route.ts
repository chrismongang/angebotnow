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

  return NextResponse.json(envStatus)
}

