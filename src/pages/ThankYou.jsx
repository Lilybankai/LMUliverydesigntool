const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';

// Poll the user's Subscription record until the webhook flips it to active.
// The webhook is the source of truth — polling just improves UX so the user
// isn't stuck on "confirming" when they return.
export default function ThankYou() {
  const { isAuthenticated, user } = useAuth();
  const [status, setStatus] = useState('pending'); // 'pending' | 'active' | 'timeout'

  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;
    let cancelled = false;
    let tries = 0;
    const maxTries = 20; // 20 * 3s = 60s

    const check = async () => {
      if (cancelled) return;
      tries += 1;
      try {
        const rows = await db.entities.Subscription.filter(
          { user_email: user.email, status: 'active' },
          '-created_date',
          1
        );
        if (rows && rows.length > 0) {
          if (!cancelled) setStatus('active');
          return;
        }
      } catch (e) {
        // ignore transient errors, keep polling
      }
      if (tries >= maxTries) {
        if (!cancelled) setStatus('timeout');
        return;
      }
      setTimeout(check, 3000);
    };

    check();
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.email]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'pending' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-rajdhani font-bold uppercase tracking-wider">Confirming your payment…</h1>
            <p className="text-sm text-muted-foreground">
              Hang tight — we&apos;re activating your subscription. This usually takes just a few seconds.
            </p>
          </>
        )}

        {status === 'active' && (
          <>
            <CheckCircle2 className="w-14 h-14 text-primary mx-auto" />
            <h1 className="text-2xl font-rajdhani font-bold uppercase tracking-wider flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              You&apos;re in!
            </h1>
            <p className="text-sm text-muted-foreground">
              Your LMU Livery Studio Pro subscription is active. Unlimited exports unlocked.
            </p>
            <Button asChild className="font-rajdhani uppercase tracking-widest" size="lg">
              <Link to="/">Back to Livery Studio</Link>
            </Button>
          </>
        )}

        {status === 'timeout' && (
          <>
            <h1 className="text-2xl font-rajdhani font-bold uppercase tracking-wider">Almost there…</h1>
            <p className="text-sm text-muted-foreground">
              Payment received. Your subscription is being activated — it can take a minute. Head back to the studio and try exporting shortly.
            </p>
            <Button asChild className="font-rajdhani uppercase tracking-widest" size="lg">
              <Link to="/">Back to Livery Studio</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}