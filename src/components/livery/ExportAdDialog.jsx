import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function ExportAdDialog({ open, onOpenChange, ad, onDownload }) {
  const handleClick = () => {
    // Trigger the download FIRST while we're still in the user-gesture
    // context — opening a new tab afterwards can otherwise steal focus
    // and cause the browser to silently cancel the blob download.
    onDownload?.();
    if (ad?.linkUrl) {
      // Small delay so the download has started before focus shifts.
      setTimeout(() => {
        window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
      }, 150);
    }
    onOpenChange(false);
  };

  if (!ad) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl p-0 overflow-hidden border-border bg-card [&>button.absolute]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        aria-describedby={undefined}
      >
        <button
          type="button"
          onClick={handleClick}
          className="block group text-left w-full"
          title="Click to download your livery design"
        >
          <img
            src={ad.imageUrl}
            alt={ad.title || 'Partner ad'}
            className="w-full h-auto block"
          />
          <div className="bg-primary text-primary-foreground text-center py-3 font-rajdhani font-semibold tracking-wide uppercase group-hover:bg-primary/90 transition-colors">
            Click to Download your Livery Design
          </div>
        </button>
      </DialogContent>
    </Dialog>
  );
}