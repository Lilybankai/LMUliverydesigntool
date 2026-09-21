import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Check, ExternalLink, Flag } from 'lucide-react';
import {
  ELMS_CONTEST,
  ELMS_LOGOS,
  CONTEST_ASSETS,
  contestPageUrl,
  timeLeftLabel,
  trackContest,
} from '@/lib/elmsContest';

const PLACEMENT = 'announce-dialog';
export const CONTEST_SEEN_KEY = 'lmu_elms_contest_seen';

export function markContestSeen() {
  try { localStorage.setItem(CONTEST_SEEN_KEY, '1'); } catch { /* ignore */ }
}

export function hasSeenContest() {
  try { return localStorage.getItem(CONTEST_SEEN_KEY) === '1'; } catch { return false; }
}

/**
 * One-time announcement shown to returning users the first time they open the
 * editor while the contest is running. Whatever they click (or dismissing it)
 * marks it seen; the banner strip and sidebar card carry it from there.
 */
export default function ContestAnnounceDialog({ open, onOpenChange, onContestCar }) {
  const close = () => {
    markContestSeen();
    onOpenChange(false);
  };

  const design = () => {
    close();
    onContestCar?.(PLACEMENT);
  };

  const logo = ELMS_LOGOS.find((l) => l.id === 'white-orange');

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); }}>
      <DialogContent
        className="max-w-2xl overflow-hidden border-[#FF5F00]/40 bg-[#0A0032] p-0 text-white"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{ELMS_CONTEST.name}</DialogTitle>

        <div className="relative h-40 overflow-hidden sm:h-48">
          <img
            src={CONTEST_ASSETS.hero}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0032] via-[#0A0032]/40 to-transparent" />
          <img src={logo.src} alt="ELMS" className="absolute left-6 top-6 h-8 w-auto sm:h-10" />
        </div>

        <div className="px-7 pb-7">
          <p className="brand-eyebrow text-[#FF5F00]">{ELMS_CONTEST.organisers}</p>

          <h2 className="mt-1.5 font-rajdhani text-3xl font-bold uppercase leading-none tracking-wide sm:text-4xl">
            Design the official ELMS 2026 livery
          </h2>

          <p className="mt-2 text-sm text-white/80">
            Paint the {ELMS_CONTEST.car}. If a panel of experts picks your design it ships in Le Mans Ultimate for everyone to drive.
          </p>

          <ul className="mt-4 space-y-1.5">
            {ELMS_CONTEST.prize.map((p) => (
              <li key={p.title} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#FF5F00]" />
                <span>{p.title}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs text-white/70">
            Deadline <span className="font-semibold text-white">{ELMS_CONTEST.deadlineLabel}</span>
            {' · '}
            <span className="font-semibold text-[#FF5F00]">{timeLeftLabel()}</span>
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={design}
              className="clip-chamfer flex flex-1 items-center justify-center gap-2 bg-[#FF5F00] px-5 py-3 font-rajdhani text-base font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
            >
              <Flag className="h-4 w-4" />
              Design the contest car
            </button>
            <a
              href={contestPageUrl(PLACEMENT)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackContest('elms_contest_rules_clicked', { placement: PLACEMENT })}
              className="flex flex-1 items-center justify-center gap-2 rounded border border-white/30 px-5 py-3 font-rajdhani text-base font-semibold uppercase tracking-widest text-white transition-colors hover:bg-white/10"
            >
              Rules &amp; how to enter
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <button
            type="button"
            onClick={close}
            className="mt-3 w-full text-center text-xs text-white/60 hover:text-white"
          >
            Not now
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
