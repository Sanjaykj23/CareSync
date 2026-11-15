import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const role = requestUrl.searchParams.get('role') || 'CHILD';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (code && supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const googleUser = data.user;
      // Extract Google Profile Metadata
      const googleName = googleUser.user_metadata?.full_name || googleUser.user_metadata?.name || googleUser.email?.split('@')[0] || 'Google User';
      const googleEmail = googleUser.email || '';
      const googleAvatar = googleUser.user_metadata?.avatar_url || googleUser.user_metadata?.picture || null;
      const googleId = googleUser.id;

      // Determine target patient profile or create one
      let patientId = 'a1111111-1111-1111-1111-111111111111';
      const { data: existingPatients } = await supabase.from('patient_profiles').select('id').limit(1);
      if (existingPatients && existingPatients.length > 0) {
        patientId = existingPatients[0].id;
      } else {
        const { data: newPatient } = await supabase
          .from('patient_profiles')
          .insert([{
            name: role === 'ELDER' ? googleName : 'Elder Patient',
            phone: '9840123456',
            age: 74,
            preferred_language: 'en',
          }])
          .select('id')
          .single();
        if (newPatient?.id) patientId = newPatient.id;
      }

      await supabase
        .from('care_role_access')
        .upsert({
          patient_id: patientId,
          role: role as any,
          name: googleName,
          email: googleEmail,
          google_id: googleId,
          auth_provider: 'google',
          is_verified: true,
        }, { onConflict: 'email' });

      // Determine redirect path
      let redirectPath = '/dashboard/child';
      if (role === 'ELDER') redirectPath = '/dashboard/elder';
      else if (role === 'CARETAKER') redirectPath = '/dashboard/caretaker';
      else if (role === 'DOCTOR') redirectPath = '/dashboard/doctor';

      const response = NextResponse.redirect(new URL(redirectPath, requestUrl.origin));

      // Set session cookie in response
      const sessionData = {
        user_id: googleId,
        patient_id: patientId,
        role,
        name: googleName,
        phone: '',
        email: googleEmail,
        avatar_url: googleAvatar,
      };

      response.cookies.set('caresync_session', encodeURIComponent(JSON.stringify(sessionData)), {
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'lax',
      });

      return response;
    }
  }

  // Fallback redirect if no code or error
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
