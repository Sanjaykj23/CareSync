import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json();
    const response = NextResponse.json({ success: true, session: sessionData });

    const json = encodeURIComponent(JSON.stringify(sessionData));
    response.cookies.set('caresync_session', json, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: 'lax',
      httpOnly: false, // Accessible to both client components and Next.js middleware
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to set session' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('caresync_session', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    sameSite: 'lax',
    httpOnly: false,
  });
  return response;
}
