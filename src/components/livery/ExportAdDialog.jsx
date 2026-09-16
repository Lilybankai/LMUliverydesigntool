import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Check, ExternalLink } from 'lucide-react';
import { APEX_AIO, apexAioUrl } from '@/lib/apexAio';

const PLACEMENT = 'export-dialog';

/**
 * Shown on every livery export. The download is the thing the user asked for
 * and always happens; the panel uses that moment to cross-promote Apex AIO,
 * which replaced the old rotating MOZA/Trophi affiliate ads.
 *
 * Both the headline CTA and the bottom bar run the same handler, so whichever
 * the user clicks they get their .tga *and* land on the Apex page — there is no
 * affordance here that costs someone their download.
 */
export default function ExportAdDialog({ open, onOpenChange, onDownload }) {
  const handleClick = () => {
    // Trigger the download FIRST while we're still in the user-gesture
    // context — opening a new tab afterwards can otherwise steal focus
    // and cause the browser to silently cancel the blob download.
    onDownload?.();
    // Small delay so the download has started before focus shifts.
    setTimeout(() => {
      window.open(apexAioUrl(PLACEMENT), '_blank', 'noopener,noreferrer');
    }, 150);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden border-border bg-card [&>button.absolute]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">
          Your livery is ready — you may also be interested in {APEX_AIO.name}
        </DialogTitle>

        <div className="p-7 pb-6">
          <p className="brand-eyebrow text-muted-foreground">You may also be interested in</p>

          <h2 className="mt-2 font-rajdhani text-4xl font-bold uppercase tracking-wide brand-gradient-text">
            {APEX_AIO.name}
          </h2>

          <p className="mt-1.5 text-sm text-muted-foreground">{APEX_AIO.tagline}</p>

          <ul className="mt-5 space-y-2">
            {APEX_AIO.bullets.map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm text-foreground">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={handleClick}
            className="clip-chamfer brand-gradient-bg mt-6 flex w-full items-center justify-center gap-2 px-5 py-3 font-rajdhani text-base font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-95"
          >
            Start your {APEX_AIO.trialDays}-day free trial
            <ExternalLink className="h-4 w-4" />
          </button>

          <p className="mt-2.5 text-center text-xs text-muted-foreground">
            Free for {APEX_AIO.trialDays} days, then{' '}
            <span className="font-semibold text-foreground">{APEX_AIO.price}</span>.{' '}
            {APEX_AIO.reassurance}
          </p>
        </div>

        <button
          type="button"
          onClick={handleClick}
          className="block w-full bg-primary py-3 text-center font-rajdhani font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
          title="Click to download your livery design"
        >
          Click to Download your Livery Design
        </button>
      </DialogContent>
    </Dialog>
  );
}
