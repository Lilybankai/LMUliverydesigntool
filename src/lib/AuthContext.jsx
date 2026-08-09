import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

import { base44 as db } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Load the current user profile from the active Supabase session.
  const loadUser = useCallback(async () => {
    try {
      const me = await db.auth.me();
      setUser(me);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      // Only a genuine "not authenticated" (no session / invalid token) should
      // log the user out. A transient network failure while loading the profile
      // must NOT wipe the session and kick the user out mid-edit — otherwise a
      // brief blip during a background token refresh destroys unsaved work.
      // Network/retryable errors from Supabase carry a non-401 (often 0/absent)
      // status, so we leave the existing auth state intact and let a later
      // refresh recover it.
      const isAuthFailure =
        error?.status === 401 ||
        error?.status === 403 ||
        error?.message === 'Authentication required';
      if (isAuthFailure) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Failsafe: never let the initial auth check leave the app stuck on the
    // loading spinner. Supabase's auth client serialises calls with the Web
    // Locks API, and a frozen/backgrounded tab (common when lots of tabs are
    // open, especially on mobile) can hold that lock so getSession() blocks
    // indefinitely. If the check hasn't settled in a few seconds, drop to the
    // unauthenticated state so the login screen shows instead of an endless
    // spinner; a real session then recovers via onAuthStateChange.
    const failsafe = setTimeout(() => {
      if (!mounted) return;
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }, 8000);

    // Initial session check on mount.
    db.auth.isAuthenticated()
      .then(async (hasSession) => {
        if (!mounted) return;
        if (hasSession) await loadUser();
      })
      .catch(() => { /* settled in finally */ })
      .finally(() => {
        if (!mounted) return;
        clearTimeout(failsafe);
        setIsLoadingAuth(false);
        setAuthChecked(true);
      });

    // React to sign-in / sign-out (incl. OAuth redirect-back and email login).
    // Branch on the event type — NOT just on `session` being truthy. Supabase
    // fires this for token refreshes and user updates too, and a transient
    // refresh hiccup can deliver a null session without the user actually
    // signing out. Treating that as a logout is exactly what was booting people
    // out mid-edit, so only an explicit SIGNED_OUT clears the session here.
    const unsubscribe = db.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      switch (event) {
        case 'SIGNED_OUT':
          setUser(null);
          setIsAuthenticated(false);
          break;
        case 'TOKEN_REFRESHED':
          // Still signed in — just a rotated token. Don't re-run the profile
          // load (a network call that could fail); keep the current session.
          if (session) setIsAuthenticated(true);
          break;
        case 'SIGNED_IN':
        case 'INITIAL_SESSION':
        case 'USER_UPDATED':
          if (session) loadUser();
          break;
        default:
          // Any other/unknown event: only act on a present session; never clear
          // auth on a null one (that is what SIGNED_OUT is for).
          if (session) loadUser();
          break;
      }
    });

    return () => { mounted = false; clearTimeout(failsafe); unsubscribe?.(); };
  }, [loadUser]);

  // Finalize a pending marketing opt-in once the user is authenticated
  // (set at the login gate before a Google redirect / email confirmation).
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    let pending = null;
    try { pending = localStorage.getItem('lmu_pending_marketing_optin'); } catch { /* ignore */ }
    if (pending !== '1') return;
    try { localStorage.removeItem('lmu_pending_marketing_optin'); } catch { /* ignore */ }
    if (user.marketing_opt_in) return;
    db.auth.updateMe({
      marketing_opt_in: true,
      marketing_opt_in_date: new Date().toISOString(),
    }).then(() => loadUser()).catch(() => { /* non-fatal */ });
  }, [isAuthenticated, user, loadUser]);

  const checkUserAuth = useCallback(() => loadUser(), [loadUser]);

  const logout = useCallback(async () => {
    try { await db.auth.logout(); } catch { /* ignore */ }
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const signInWithGoogle = useCallback(() => db.auth.redirectToLogin(), []);

  const signInWithPassword = useCallback(
    (email, password) => db.auth.signInWithPassword(email, password),
    []
  );

  const signUp = useCallback(
    (email, password) => db.auth.signUp(email, password),
    []
  );

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError,
      appPublicSettings: null,
      authChecked,
      logout,
      // navigateToLogin kept for back-compat (e.g. PaywallDialog).
      navigateToLogin: signInWithGoogle,
      signInWithGoogle,
      signInWithPassword,
      signUp,
      checkUserAuth,
      checkAppState: () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
