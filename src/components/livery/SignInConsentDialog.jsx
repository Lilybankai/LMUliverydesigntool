const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import { LogIn, Mail } from 'lucide-react';

export default function SignInConsentDialog({ open, onOpenChange }) {
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSignIn = async () => {
    if (!agreed) return;
    setBusy(true);
    // Persist intent so we can finalize opt-in after redirect-back.
    try {
      localStorage.setItem('lmu_pending_marketing_optin', '1');
    } catch (e) { /* ignore */ }
    await db.auth.redirectToLogin();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-rajdhani text-xl uppercase tracking-wide flex items-center gap-2">
            <LogIn className="w-5 h-5 text-primary" />
            Sign in to save your design
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            To save and recall your liveries (up to 10), please sign in with your Google account.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 p-3 rounded bg-secondary border border-border">
          <Checkbox
            id="marketing-consent"
            checked={agreed}
            onCheckedChange={(v) => setAgreed(!!v)}
            className="mt-0.5"
          />
          <label htmlFor="marketing-consent" className="text-xs text-foreground leading-relaxed cursor-pointer">
            <Mail className="w-3.5 h-3.5 inline mr-1 text-primary" />
            I agree to receive marketing emails from <span className="font-semibold">XILE GT Simracing</span> with
            updates about LMU Livery Studio and sim racing equipment. You can unsubscribe at any time.
          </label>
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSignIn}
            disabled={!agreed || busy}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-rajdhani font-semibold tracking-wide gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign in with Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}