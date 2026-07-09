import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Layers, Mail, Loader2, LogIn, MailCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
  </svg>
);

export default function LoginGate() {
  const { signInWithGoogle, signInWithPassword, signUp } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const isSignup = mode === 'signup';

  const rememberConsent = () => {
    if (!consent) return;
    try { localStorage.setItem('lmu_pending_marketing_optin', '1'); } catch { /* ignore */ }
  };

  const handleGoogle = async () => {
    setError(null);
    setBusy(true);
    rememberConsent();
    try {
      await signInWithGoogle();
      // Redirects away; nothing else to do.
    } catch (e) {
      setError(e?.message || 'Could not start Google sign-in.');
      setBusy(false);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    if (isSignup && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setBusy(true);
    try {
      if (isSignup) {
        rememberConsent();
        const data = await signUp(email, password);
        if (!data?.session) {
          // Email confirmation is enabled — no session yet.
          setInfo('Check your inbox to confirm your email, then sign in.');
          setMode('signin');
          setBusy(false);
          return;
        }
        // Session present — the auth listener will unlock the app.
      } else {
        await signInWithPassword(email, password);
        // The auth listener will unlock the app.
      }
    } catch (err) {
      const msg = err?.message || 'Something went wrong. Please try again.';
      setError(/invalid login credentials/i.test(msg) ? 'Incorrect email or password.' : msg);
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(isSignup ? 'signin' : 'signup');
    setError(null);
    setInfo(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="brand-gradient-bg clip-chamfer flex items-center justify-center w-11 h-11 shadow-[0_0_22px_-4px_hsl(var(--brand-purple)/0.8)]">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-geom text-2xl tracking-wide uppercase leading-none">
              <span className="text-foreground">LMU </span>
              <span className="brand-gradient-text">Livery Studio</span>
            </span>
            <span className="brand-eyebrow text-muted-foreground mt-1">by XILE GT Simracing</span>
          </div>
        </div>

        {/* Card */}
        <div className="relative bg-card/80 backdrop-blur-sm border border-border rounded-lg p-7 shadow-2xl overflow-hidden">
          {/* top accent line */}
          <div className="absolute inset-x-0 top-0 h-px brand-gradient-bg" />

          <h1 className="font-rajdhani text-2xl font-bold uppercase tracking-wide text-foreground">
            {isSignup ? 'Create your account' : 'Sign in to continue'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            {isSignup
              ? 'Sign up to design and download custom liveries for Le Mans Ultimate.'
              : 'Log in to design and download custom liveries for Le Mans Ultimate.'}
          </p>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 mb-4 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
              <span>{error}</span>
            </div>
          )}
          {info && (
            <div className="flex items-start gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 mb-4 text-xs text-accent">
              <MailCheck className="w-4 h-4 flex-shrink-0 mt-px" />
              <span>{info}</span>
            </div>
          )}

          <form onSubmit={handleEmail} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="brand-eyebrow text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={busy}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="brand-eyebrow text-muted-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignup ? 'At least 6 characters' : '••••••••'}
                disabled={busy}
              />
            </div>

            {isSignup && (
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="marketing-consent"
                  checked={consent}
                  onCheckedChange={(v) => setConsent(!!v)}
                  className="mt-0.5"
                  disabled={busy}
                />
                <label htmlFor="marketing-consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  <Mail className="w-3.5 h-3.5 inline mr-1 text-accent" />
                  Send me marketing emails from <span className="font-semibold text-foreground">XILE GT Simracing</span> about
                  LMU Livery Studio and sim racing gear. Optional — unsubscribe anytime.
                </label>
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              disabled={busy}
              className="w-full h-10 font-rajdhani font-semibold uppercase tracking-wide gap-2"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {isSignup ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-border" />
            <span className="brand-eyebrow text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={busy}
            className="w-full h-10 gap-2 font-medium"
          >
            <GoogleIcon className="w-4 h-4" />
            Continue with Google
          </Button>

          {/* Mode toggle */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={switchMode}
              disabled={busy}
              className="text-accent hover:underline font-semibold"
            >
              {isSignup ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
