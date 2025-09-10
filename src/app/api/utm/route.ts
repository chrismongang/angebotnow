import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const res = NextResponse.json({ ok: true });

    const utm = {
      utm_source: typeof data.utm_source === 'string' ? data.utm_source : undefined,
      utm_medium: typeof data.utm_medium === 'string' ? data.utm_medium : undefined,
      utm_campaign: typeof data.utm_campaign === 'string' ? data.utm_campaign : undefined,
      utm_term: typeof data.utm_term === 'string' ? data.utm_term : undefined,
      utm_content: typeof data.utm_content === 'string' ? data.utm_content : undefined,
      timestamp: new Date().toISOString(),
    } as const;

    res.cookies.set('utm_data', JSON.stringify(utm), {
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res;
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}



