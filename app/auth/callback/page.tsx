'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { setAuthCookie } from '@/lib/auth-cookie';
import { CareRole } from '@/lib/types';
import Link from 'next/link';
import { ShieldCheck, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusText, setStatusText] = useState('Verifying Google authentication credentials...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      try {
        // 1. Determine intended role from searchParams or localStorage fallback
        const roleParam = searchParams.get('role');
        const storedRole = typeof window !== 'undefined' ? localStorage.getItem('caresync_oauth_role') : null;
        const finalRole: CareRole = (roleParam as CareRole) || (storedRole as CareRole) || 'CHILD';

        if (!isSupabaseConfigured || !supabase) {
          throw new Error('Supabase is not configured.');
        }

        // 2. Check for PKCE Authorization Code in query params
        const code = searchParams.get('code');
        if (code) {
          setStatusText('Exchanging authorization code with Supabase...');
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn('PKCE exchange error, checking session fallback:', exchangeError.message);
          }
        }

        // 3. Check for Implicit Flow token in URL hash (#access_token=...)
        if (typeof window !== 'undefined' && window.location.hash) {
          const hash = window.location.hash.substring(1);
          const hashParams = new URLSearchParams(hash);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken) {
            setStatusText('Parsing authentication token from Google...');
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
          }
        }

        // 4. Retrieve verified active session
        setStatusText('Retrieving verified profile details...');
        let { data: { session } } = await supabase.auth.getSession();

        // If session is still propagating, wait briefly and retry
        if (!session) {
          await new Promise(resolve => setTimeout(resolve, 800));
          const retryResult = await supabase.auth.getSession();
          session = retryResult.data.session;
        }

        if (!session || !session.user) {
          throw new Error('Could not establish an authenticated session. Please try signing in again.');
        }

        const user = session.user;
        const googleName = 
          user.user_metadata?.full_name || 
          user.user_metadata?.name || 
          user.email?.split('@')[0] || 
          'CareSync User';
        const googleEmail = user.email || '';
        const googleAvatar = 
          user.user_metadata?.avatar_url || 
          user.user_metadata?.picture || 
          null;
        const googleId = user.id;

        setStatusText(`Setting up ${finalRole} portal for ${googleName}...`);

        // 5. Find or initialize patient profile in Supabase
        let targetPatientId = 'a1111111-1111-1111-1111-111111111111';
        try {
          const { data: existingPatients } = await supabase
            .from('patient_profiles')
            .select('id')
            .limit(1);

          if (existingPatients && existingPatients.length > 0) {
            targetPatientId = existingPatients[0].id;
          } else {
            const { data: newPatient } = await supabase
              .from('patient_profiles')
              .insert([{
                name: finalRole === 'ELDER' ? googleName : 'Sundaram Iyer',
                phone: '9840123456',
                age: 74,
                preferred_language: 'en',
              }])
              .select('id')
              .single();
            if (newPatient?.id) targetPatientId = newPatient.id;
          }

          // 6. Upsert user into care_role_access table
          await supabase
            .from('care_role_access')
            .upsert({
              patient_id: targetPatientId,
              role: finalRole,
              name: googleName,
              email: googleEmail,
              google_id: googleId,
              auth_provider: 'google',
              is_verified: true,
            }, { onConflict: 'email' });

        } catch (dbErr) {
          console.warn('Database upsert warning (using fallback session):', dbErr);
        }

        // 7. Construct session data object
        const sessionPayload = {
          user_id: googleId,
          patient_id: targetPatientId,
          role: finalRole,
          name: googleName,
          phone: '',
          email: googleEmail,
          avatar_url: googleAvatar,
        };

        // 8. Set session cookie on both Client and Server API
        setAuthCookie(sessionPayload);
        try {
          await fetch('/api/auth/set-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessionPayload),
          });
        } catch (cookieErr) {
          console.warn('Server cookie sync error:', cookieErr);
        }

        // Clean up storage flag
        if (typeof window !== 'undefined') {
          localStorage.removeItem('caresync_oauth_role');
        }

        // 9. Redirect to the target dashboard
        let targetRoute = '/dashboard/child';
        if (finalRole === 'ELDER') targetRoute = '/dashboard/elder';
        else if (finalRole === 'CARETAKER') targetRoute = '/dashboard/caretaker';
        else if (finalRole === 'DOCTOR') targetRoute = '/dashboard/doctor';

        setStatusText('Verification complete! Launching dashboard...');
        setTimeout(() => {
          if (isMounted) {
            if (typeof window !== 'undefined') {
              window.location.href = targetRoute;
            } else {
              router.replace(targetRoute);
            }
          }
        }, 300);

      } catch (err: any) {
        console.error('Authentication callback error:', err);
        if (isMounted) {
          setErrorMsg(err?.message || 'Authentication failed. Please try again.');
        }
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [searchParams, router]);

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Authentication Could Not Complete
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {errorMsg}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all text-center flex items-center justify-center gap-1.5"
            >
              Return to Login <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all text-center"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-slate-200 text-center space-y-5 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Verifying Google Account
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {statusText}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-400 py-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-xs font-mono font-medium">Connecting CareSync Security Gateway...</span>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
          <div className="text-center text-slate-500 text-xs font-mono">
            Loading authentication handler...
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
