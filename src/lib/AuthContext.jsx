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
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Initial session check on mount.
    db.auth.isAuthenticated()
      .then(async (hasSession) => {
        if (!mounted) return;
        if (hasSession) {
          await loadUser();
        } else {
          setIsLoadingAuth(false);
          setAuthChecked(true);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setIsLoadingAuth(false);
        setAuthChecked(true);
      });

    // React to sign-in / sign-out (incl. OAuth redirect-back and email login).
    const unsubscribe = db.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        loadUser();
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => { mounted = false; unsubscribe?.(); };
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
