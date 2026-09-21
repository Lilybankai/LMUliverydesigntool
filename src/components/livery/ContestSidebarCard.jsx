import { useState } from 'react';
import { ExternalLink, Flag, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { loadImageFromUrl } from '@/lib/importImage';
import {
  ELMS_CONTEST,
  ELMS_COLOURS,
  ELMS_LOGOS,
  LMU_LOGOS,
  contestPageUrl,
  isContestOpen,
  timeLeftLabel,
  trackContest,
} from '@/lib/elmsContest';

const PLACEMENT = 'sidebar-card';

/**
 * Contest card pinned above the Apex promo in the 176px sidebar. While the
 * contest car is selected it doubles as the entrant's toolkit: one-click ELMS
 * and LMU logos (the only brands the rules allow) and the official ELMS palette.
 */
export default function ContestSidebarCard({ isContestCar, onContestCar, onImageLayer, onBaseColour }) {
  const { toast } = useToast();
  const [loadingLogo, setLoadingLogo] = useState(null);

  if (!isContestOpen()) return null;

  const addLogo = async (logo) => {
    if (loadingLogo) return;
    setLoadingLogo(logo.id);
    trackContest('elms_contest_logo_added', { logo: logo.id });
    try {
      await loadImageFromUrl(logo.src, (...args) => {
        onImageLayer?.(...args);
        setLoadingLogo(null);
      });
    } catch {
      setLoadingLogo(null);
      toast({ title: 'Could not add the logo', description: 'Check your connection and try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="clip-chamfer border border-[#FF5F00]/50 bg-[#0A0032] p-2.5 text-white">
      <p className="brand-eyebrow text-[#FF5F00]">ELMS × LMU contest</p>

      <p className="mt-1 font-rajdhani text-base font-bold uppercase leading-tight tracking-wide">
        Design the ELMS 2026 {ELMS_CONTEST.carShort}
      </p>

      <p className="mt-1 text-[10px] leading-snug text-white/75">
        Win your livery on the No.26 car in the game. {timeLeftLabel()}.
      </p>

      {isContestCar ? (
        <>
          <p className="mt-2 flex items-center gap-1 font-rajdhani text-[11px] font-semibold uppercase tracking-wider text-[#FF5F00]">
            <Check className="h-3 w-3" />
            Contest car selected
          </p>

          <p className="mt-2 text-[9px] uppercase tracking-widest text-white/60">Add a logo</p>
          <div className="mt-1 grid grid-cols-3 gap-1">
            {[...ELMS_LOGOS, ...LMU_LOGOS].map((logo) => (
              <button
                key={logo.id}
                type="button"
                title={`Add ${logo.label} logo`}
                disabled={!!loadingLogo}
                onClick={() => addLogo(logo)}
                className={`flex h-7 items-center justify-center rounded border border-white/15 px-1 transition-opacity hover:opacity-80 disabled:opacity-50 ${logo.onDark ? 'bg-[#0A0032]' : 'bg-white'}`}
              >
                {loadingLogo === logo.id
                  ? <Loader2 className={`h-3 w-3 animate-spin ${logo.onDark ? 'text-white' : 'text-[#0A0032]'}`} />
                  : <img src={logo.src} alt={logo.label} className="max-h-4 w-auto max-w-full" />}
              </button>
            ))}
          </div>

          <p className="mt-2 text-[9px] uppercase tracking-widest text-white/60">ELMS colours</p>
          <div className="mt-1 flex gap-1">
            {ELMS_COLOURS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={`${c.label} ${c.value} — set as base colour`}
                onClick={() => { onBaseColour?.(c.value); trackContest('elms_contest_colour_picked', { colour: c.value }); }}
                className="h-5 flex-1 rounded border border-white/25 transition-transform hover:scale-105"
                style={{ background: c.value }}
              />
            ))}
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => onContestCar?.(PLACEMENT)}
          className="clip-chamfer mt-2 flex w-full items-center justify-center gap-1 bg-[#FF5F00] px-2 py-1.5 font-rajdhani text-[11px] font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
        >
          <Flag className="h-3 w-3" />
          Use the contest car
        </button>
      )}

      <a
        href={contestPageUrl(PLACEMENT)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackContest('elms_contest_rules_clicked', { placement: PLACEMENT })}
        className="mt-2 flex items-center justify-center gap-1 text-[10px] text-white/70 underline-offset-2 hover:text-white hover:underline"
      >
        Rules, prize &amp; how to enter
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
