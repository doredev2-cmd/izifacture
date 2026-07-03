import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') ?? '/';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Handle email confirmation with token_hash (newer Supabase flow)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'signup' | 'recovery' | 'email',
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // Handle OAuth / magic link with code (PKCE flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // If something went wrong, redirect to home anyway
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
