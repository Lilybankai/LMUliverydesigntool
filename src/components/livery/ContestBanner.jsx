import { useState } from 'react';
import { X, ExternalLink, Flag } from 'lucide-react';
import {
  ELMS_CONTEST,
  ELMS_LOGOS,
  contestPageUrl,
  isContestOpen,
  timeLeftLabel,
  trackContest,
} from '@/lib/elmsContest';

const PLACEMENT = 'editor-banner';
const SESSION_KEY = 'lmu_elms_contest_banner_dismissed';

function readDismissed() {
  try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch { return false; }
}

/**
 * Contest strip under the top bar. Dismissable for the current tab only, so it
 * is back next visit but never nags within a session. Hides itself entirely
 * once the deadline has passed.
 */
export default function ContestBanner({ onContestCar, onContestCarAlready }) {
  const [dismissed, setDismissed] = useState(readDismissed);
  if (!isContestOpen() || dismissed) return null;

  const dismiss = () => {
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
    setDismissed(true);
  };

  const logo = ELMS_LOGOS.find((l) => l.id === 'white-orange');

  return (
    <div
      role="region"
      aria-label="ELMS livery contest"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#FF5F00]/50 bg-[#0A0032] px-4 py-2 text-sm text-white"
    >
      <img src={logo.src} alt="ELMS" className="h-5 w-auto flex-shrink-0" />

      <p className="min-w-0 flex-1 leading-snug">
        <span className="font-rajdhani text-base font-bold uppercase tracking-wide">
          {ELMS_CONTEST.name}
        </span>
        <span className="text-white/80">
          {' '}— design the official ELMS 2026 {ELMS_CONTEST.carShort} and win your livery in the game.
        </span>{' '}
        <span className="font-semibold text-[#FF5F00]">{timeLeftLabel()}.</span>
      </p>

      <div className="flex items-center gap-2">
        <a
          href={contestPageUrl(PLACEMENT)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackContest('elms_contest_rules_clicked', { placement: PLACEMENT })}
          className="inline-flex items-center gap-1 rounded border border-white/30 px-2.5 py-1 font-rajdhani text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
        >
          Rules &amp; entry
          <ExternalLink className="h-3 w-3" />
        </a>
        {onContestCarAlready ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 font-rajdhani text-xs font-semibold uppercase tracking-wider text-[#FF5F00]">
            <Flag className="h-3 w-3" />
            Contest car selected
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onContestCar?.(PLACEMENT)}
            className="clip-chamfer inline-flex items-center gap-1 bg-[#FF5F00] px-3 py-1 font-rajdhani text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
          >
            <Flag className="h-3 w-3" />
            Design the contest car
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Hide contest banner"
          className="ml-1 rounded p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
