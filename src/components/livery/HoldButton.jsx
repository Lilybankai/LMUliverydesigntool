import { useRef, useCallback, useEffect } from 'react';

/**
 * A button that fires `onAction` once on press, then repeatedly while held.
 * Uses a ref to the latest callback so consumers can pass inline closures
 * without re-creating timers.
 */
export default function HoldButton({ onAction, className, title, children, initialDelay = 300, repeatInterval = 50 }) {
  const actionRef = useRef(onAction);
  actionRef.current = onAction;

  const startTimeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const stop = useCallback(() => {
    if (startTimeoutRef.current) {
      clearTimeout(startTimeoutRef.current);
      startTimeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback((e) => {
    if (e && e.button !== undefined && e.button !== 0) return;
    e?.preventDefault();
    actionRef.current?.();
    startTimeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        actionRef.current?.();
      }, repeatInterval);
    }, initialDelay);
  }, [initialDelay, repeatInterval]);

  useEffect(() => stop, [stop]);

  return (
    <button
      type="button"
      className={className}
      title={title}
      onMouseDown={start}
      onMouseUp={stop}
      onMouseLeave={stop}
      onTouchStart={start}
      onTouchEnd={stop}
      onTouchCancel={stop}
    >
      {children}
    </button>
  );
}