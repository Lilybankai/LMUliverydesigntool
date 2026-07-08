import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone } from 'lucide-react';

// Tailwind's `md` breakpoint is 768px — anything below that we treat as phone/tablet.
const MOBILE_BREAKPOINT = 1024;

export default function MobileWarningDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isSmallScreen || isTouch) {
      setOpen(true);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Smartphone className="w-6 h-6 text-muted-foreground" />
            <span className="text-muted-foreground">→</span>
            <Monitor className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-center font-geom uppercase tracking-wide">
            Desktop Recommended
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            LMU Livery Studio is designed for desktop use. For the best experience — including precise canvas controls, panning, and zooming — please open this site on a desktop or laptop computer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} className="w-full">
            Continue anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}