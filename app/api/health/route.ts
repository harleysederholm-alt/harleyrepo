import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Test environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing Supabase environment variables',
          env: {
            hasUrl: !!supabaseUrl,
            hasAnonKey: !!supabaseAnonKey,
          },
        },
        { status: 500 }
      );
    }

    // Test Supabase connection
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.from('profiles').select('count').limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Supabase query failed',
          error: error.message,
          env: {
            url: supabaseUrl,
            hasAnonKey: true,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      message: 'All systems operational',
      supabase: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Unexpected error',
        error: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
