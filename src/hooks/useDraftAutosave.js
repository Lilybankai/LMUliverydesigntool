import { useCallback, useEffect, useRef, useState } from 'react';

// Bumped only if the persisted draft shape changes in a breaking way.
const DRAFT_VERSION = 1;

// Scope the draft to the signed-in user so two people sharing a browser never
// see each other's in-progress work. Falls back to a shared key when we don't
// yet know who the user is.
const draftKey = (userId) => `lmu_livery_draft_v${DRAFT_VERSION}_${userId || 'anon'}`;

/**
 * Keeps a best-effort backup of the in-progress livery in localStorage so a
 * forced logout, tab crash, or accidental close can't destroy unsaved work.
 *
 * Returns:
 *   pendingDraft — a restorable draft found at mount (or null). Present only
 *                  when it actually holds layers, so the caller can offer to
 *                  restore it.
 *   saveDraft(snapshot) — debounced write of the current working state.
 *   keepDraft()  — accept/hide the pending draft banner without wiping storage
 *                  (autosave keeps backing the restored work up).
 *   clearDraft() — discard: wipe the stored draft and hide the banner. Also
 *                  used once work is safely saved server-side.
 */
export default function useDraftAutosave(userId) {
  const key = draftKey(userId);
  const [pendingDraft, setPendingDraft] = useState(null);
  const hydratedRef = useRef(false);
  const timerRef = useRef(null);

  // Read any existing draft once, as soon as we know which user we're scoped to.
  useEffect(() => {
    hydratedRef.current = false;
    setPendingDraft(null);
    let draft = null;
    try {
      const raw = localStorage.getItem(key);
      if (raw) draft = JSON.parse(raw);
    } catch {
      draft = null; // corrupt/unreadable — treat as no draft
    }
    // Only worth offering a restore if the draft actually holds work.
    if (draft && Array.isArray(draft.layers) && draft.layers.length > 0) {
      setPendingDraft(draft);
    }
    hydratedRef.current = true;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key]);

  // Debounced write of the current snapshot. No-ops until the mount read has
  // run so we never clobber a stored draft before the user decides on it.
  const saveDraft = useCallback((snapshot) => {
    if (!hydratedRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({ ...snapshot, savedAt: new Date().toISOString() })
        );
      } catch {
        // Storage full (large embedded images) or disabled — this is only a
        // best-effort backup, so silently keep the previous draft.
      }
    }, 800);
  }, [key]);

  const keepDraft = useCallback(() => setPendingDraft(null), []);

  const clearDraft = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    setPendingDraft(null);
  }, [key]);

  return { pendingDraft, saveDraft, keepDraft, clearDraft };
}
