const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function PaywallDialog({ open, onOpenChange }) {
  const { isAuthenticated, navigateToLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribe = async () => {
    setError(null);
    if (!isAuthenticated) {
      // Send them through login; after return the paywall can be re-opened.
      navigateToLogin();
      return;
    }
    setLoading(true);
    try {
      const res = await db.functions.invoke('create-checkout', {});
      const url = res?.data?.redirectUrl;
      if (!url) throw new Error(res?.data?.error || 'Could not start checkout.');
      window.location.href = url;
    } catch (e) {
      setError(e?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-rajdhani text-2xl uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Unlock Unlimited Exports
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            {isAuthenticated
              ? "You've used your free livery export. Subscribe for unlimited exports across every car."
              : "Sign up to get 7 days of unlimited exports — free. No card required to start."}
          </p>

          <div className="rounded-lg border border-primary/50 bg-primary/5 p-4 text-center">
            {!isAuthenticated && (
              <div className="text-sm font-rajdhani uppercase tracking-widest text-primary mb-1">
                7-day free trial
              </div>
            )}
            <div className="text-4xl font-rajdhani font-bold text-primary">
              £2.99<span className="text-base text-muted-foreground font-normal">/month</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isAuthenticated ? 'Cancel anytime' : 'After your 7-day free trial • Cancel anytime'}
            </div>
          </div>

          <ul className="space-y-2 text-sm">
            {[
              ...(!isAuthenticated ? ['7 days of unlimited exports on signup'] : []),
              'Unlimited livery exports',
              'All current & future vehicles',
              'All shapes, textures, patterns & fonts',
              'Cancel anytime',
            ].map(item => (
              <li key={item} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full font-rajdhani uppercase tracking-widest"
            size="lg"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isAuthenticated ? 'Subscribe — £2.99/month' : 'Sign in to start free trial'}
          </Button>

          <p className="text-[10px] text-muted-foreground text-center">
            Secure payment by Base44 Payments. You&apos;ll be redirected to complete checkout.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}