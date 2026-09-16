import { ExternalLink } from 'lucide-react';
import { APEX_AIO, openApexAio } from '@/lib/apexAio';

const PLACEMENT = 'sidebar-card';

/**
 * Persistent in-family cross-promo for the Apex AIO System, pinned to the
 * bottom of the shape toolbar. Sized for the 176px (w-44) sidebar, so the copy
 * is deliberately terse — the export dialog carries the full pitch.
 */
export default function ApexAioPromo() {
  return (
    <div className="clip-chamfer border border-border bg-background/60 p-2.5">
      <p className="brand-eyebrow text-muted-foreground">Also from Apex</p>

      <p className="mt-1 font-rajdhani text-base font-bold uppercase leading-tight tracking-wide brand-gradient-text">
        Apex AIO System
      </p>

      <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
        Live telemetry overlays for LMU &amp; rFactor 2, in OBS or in game.
      </p>

      <button
        type="button"
        onClick={() => openApexAio(PLACEMENT)}
        className="clip-chamfer brand-gradient-bg mt-2 flex w-full items-center justify-center gap-1 px-2 py-1.5 font-rajdhani text-[11px] font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
      >
        {APEX_AIO.trialDays} days free
        <ExternalLink className="h-3 w-3" />
      </button>

      <p className="mt-1 text-center text-[9px] text-muted-foreground">
        then {APEX_AIO.price}
      </p>
    </div>
  );
}
