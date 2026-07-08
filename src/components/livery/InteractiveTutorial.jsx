import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  { sel: '[data-tutorial="logo"]', title: 'LMU Livery Studio', text: 'Design custom liveries for Le Mans Ultimate, right in your browser. Let\'s take a quick tour.', placement: 'bottom' },
  { sel: '[data-tutorial="vehicle"]', title: 'Vehicle Selector', text: 'Choose which car you want to design a livery for. Each car has its own UV map and template.', placement: 'bottom' },
  { sel: '[data-tutorial="base-colour"]', title: 'Base Colour', text: 'Pick the base paint colour of your car. You can choose a preset or use any custom hex colour.', placement: 'bottom' },
  { sel: '[data-tutorial="install"]', title: 'Install Guide', text: 'Once exported, follow these steps to drop your livery into your LMU install folder.', placement: 'bottom' },
  { sel: '[data-tutorial="export"]', title: 'Export 4K TGA', text: 'Export your finished design as a 4K TGA file — ready to drop straight into the game.', placement: 'bottom' },
  { sel: '[data-tutorial-group="shapes"]', title: 'Shapes', text: 'Build up your livery using rectangles, stripes, triangles, stars and more. Click a shape to add it to the canvas.', placement: 'right', group: 'shapes' },
  { sel: '[data-tutorial-group="patterns"]', title: 'Patterns', text: 'Apply racing stripes, checkers, polka dots, carbon fibre and other repeating patterns — each uses two colours.', placement: 'right', group: 'patterns' },
  { sel: '[data-tutorial-group="textures"]', title: 'Textures', text: 'Add organic textures like waves, camo, brushed metal or splatter effects for extra detail.', placement: 'right', group: 'textures' },
  { sel: '[data-tutorial="image-import"]', title: 'Image Import', text: 'Drag and drop an image here (or click) to add logos, sponsors or custom artwork to your livery.', placement: 'right' },
  { sel: '[data-tutorial="base-controls"]', title: 'Base Colour & Toggles', text: 'Fine-tune the base colour, toggle the UV guide, and show or hide class stickers.', placement: 'right' },
  { sel: '[data-tutorial="canvas"]', title: 'Design Canvas', text: 'Your livery preview. Click layers to select, drag to move, and use handles to resize or rotate.', placement: 'left' },
  { sel: '[data-tutorial="layers"]', title: 'Layer Panel', text: 'All your shapes appear here. Reorder, duplicate, hide or delete them — the top layer renders last.', placement: 'left' },
  { sel: '[data-tutorial="properties"]', title: 'Properties Panel', text: 'Edit the selected layer\'s colour, opacity, position, rotation and distortion in detail.', placement: 'left' },
];

const PAD = 8;
const BUBBLE_W = 320;
const BUBBLE_GAP = 14;

export default function InteractiveTutorial({ open, onClose, onStepChange }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState(null);
  const bubbleRef = useRef(null);
  const [bubblePos, setBubblePos] = useState({ top: 0, left: 0 });

  const step = STEPS[stepIdx];

  // Notify parent on step change so it can prep the UI (e.g. open the right shape group)
  useEffect(() => {
    if (open && step) onStepChange?.(step);
  }, [open, stepIdx, step, onStepChange]);

  // Locate target and update its rect (with resize/scroll listeners)
  useLayoutEffect(() => {
    if (!open || !step) return;
    let raf;

    const measure = () => {
      const el = document.querySelector(step.sel);
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    measure();
    // Re-measure shortly after to catch layout transitions
    raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [open, stepIdx, step]);

  // Position the bubble next to the highlighted rect
  useLayoutEffect(() => {
    if (!rect) return;
    const bubbleH = bubbleRef.current?.offsetHeight || 180;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top, left;

    switch (step.placement) {
      case 'right':
        left = rect.left + rect.width + BUBBLE_GAP;
        top = rect.top + rect.height / 2 - bubbleH / 2;
        break;
      case 'left':
        left = rect.left - BUBBLE_W - BUBBLE_GAP;
        top = rect.top + rect.height / 2 - bubbleH / 2;
        break;
      case 'top':
        left = rect.left + rect.width / 2 - BUBBLE_W / 2;
        top = rect.top - bubbleH - BUBBLE_GAP;
        break;
      case 'bottom':
      default:
        left = rect.left + rect.width / 2 - BUBBLE_W / 2;
        top = rect.top + rect.height + BUBBLE_GAP;
        break;
    }
    left = Math.max(8, Math.min(left, vw - BUBBLE_W - 8));
    top = Math.max(8, Math.min(top, vh - bubbleH - 8));
    setBubblePos({ top, left });
  }, [rect, step, stepIdx]);

  // Reset to first step whenever opened
  useEffect(() => {
    if (open) setStepIdx(0);
  }, [open]);

  if (!open) return null;

  const finish = () => {
    localStorage.setItem('lmu_tutorial_seen', '1');
    onClose();
  };

  const next = () => {
    if (stepIdx >= STEPS.length - 1) finish();
    else setStepIdx(i => i + 1);
  };

  const isLast = stepIdx === STEPS.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Spotlight overlay using 4 dim rectangles around the highlighted rect */}
      {rect && (
        <>
          {/* Top */}
          <div className="absolute bg-black/70 pointer-events-auto" style={{ top: 0, left: 0, right: 0, height: Math.max(0, rect.top - PAD) }} onClick={finish} />
          {/* Bottom */}
          <div className="absolute bg-black/70 pointer-events-auto" style={{ top: rect.top + rect.height + PAD, left: 0, right: 0, bottom: 0 }} onClick={finish} />
          {/* Left */}
          <div className="absolute bg-black/70 pointer-events-auto" style={{ top: Math.max(0, rect.top - PAD), left: 0, width: Math.max(0, rect.left - PAD), height: rect.height + PAD * 2 }} onClick={finish} />
          {/* Right */}
          <div className="absolute bg-black/70 pointer-events-auto" style={{ top: Math.max(0, rect.top - PAD), left: rect.left + rect.width + PAD, right: 0, height: rect.height + PAD * 2 }} onClick={finish} />

          {/* Highlight ring */}
          <div
            className="absolute rounded-md ring-2 ring-primary ring-offset-2 ring-offset-background pointer-events-none transition-all duration-200"
            style={{
              top: rect.top - PAD,
              left: rect.left - PAD,
              width: rect.width + PAD * 2,
              height: rect.height + PAD * 2,
              boxShadow: '0 0 0 9999px transparent, 0 0 24px 4px hsl(var(--primary) / 0.5)',
            }}
          />
        </>
      )}

      {/* Fallback dim if target missing */}
      {!rect && (
        <div className="absolute inset-0 bg-black/70 pointer-events-auto" onClick={finish} />
      )}

      {/* Speech bubble */}
      <div
        ref={bubbleRef}
        className="absolute pointer-events-auto bg-card border border-border rounded-md shadow-2xl p-4 flex flex-col gap-3"
        style={{ top: bubblePos.top, left: bubblePos.left, width: BUBBLE_W }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-primary uppercase tracking-widest font-rajdhani">
              Tip {stepIdx + 1} / {STEPS.length}
            </span>
            <h3 className="font-geom text-base text-foreground uppercase tracking-wide leading-tight mt-0.5">
              {step.title}
            </h3>
          </div>
          <button
            onClick={finish}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            title="Skip tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{step.text}</p>

        {/* Progress dots */}
        <div className="flex items-center gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${i === stepIdx ? 'bg-primary w-4' : 'bg-border w-1.5'}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={finish}
          >
            Skip & Start Designing
          </Button>
          <Button
            size="sm"
            onClick={next}
            className="h-7 gap-1 bg-primary text-primary-foreground hover:bg-primary/90 font-rajdhani font-semibold tracking-wide"
          >
            {isLast ? 'Finish' : 'Next Tip'}
            {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function TutorialButton({ onStart }) {
  return (
    <Button
      onClick={onStart}
      variant="outline"
      size="sm"
      className="h-8 gap-2 text-xs"
      title="Replay tutorial"
    >
      <GraduationCap className="w-4 h-4" />
      Tutorial
    </Button>
  );
}