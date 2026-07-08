import { useState, useCallback, useRef } from 'react';

/**
 * Minimal undo/redo state manager.
 *
 * - `state` is the current value
 * - `set(next, { commit })` updates the value; if commit is false, it replaces the
 *   top of the history (used for live drag updates so we don't flood history)
 * - `commit()` snapshots the current value into history (call on drag end)
 * - `undo()` / `redo()` move through the stack
 */
export default function useHistory(initial) {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initial);
  const [future, setFuture] = useState([]);
  const presentRef = useRef(initial);
  presentRef.current = present;

  const set = useCallback((updater, { commit = true } = {}) => {
    const prev = presentRef.current;
    const next = typeof updater === 'function' ? updater(prev) : updater;
    if (next === prev) return;
    if (commit) {
      setPast((p) => [...p, prev]);
      setFuture([]);
    }
    setPresent(next);
  }, []);

  const commit = useCallback(() => {
    const prev = presentRef.current;
    setPast((p) => (p[p.length - 1] === prev ? p : [...p, prev]));
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const prev = p[p.length - 1];
      setFuture((f) => [presentRef.current, ...f]);
      setPresent(prev);
      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setPast((p) => [...p, presentRef.current]);
      setPresent(next);
      return f.slice(1);
    });
  }, []);

  const reset = useCallback((value) => {
    setPast([]);
    setFuture([]);
    setPresent(value);
  }, []);

  return {
    state: present,
    set,
    commit,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}