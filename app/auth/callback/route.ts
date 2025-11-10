import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const proto = request.headers.get('x-forwarded-proto');
      const host = forwardedHost || request.nextUrl.host;
      const protocol = proto === 'http' ? 'http' : 'https';
      return NextResponse.redirect(`${protocol}://${host}${next}`);
    }
  }

  return NextResponse.redirect(
    new URL('/auth/auth-code-error', request.url)
  );
}
