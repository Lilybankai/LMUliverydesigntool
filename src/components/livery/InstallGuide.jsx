import { useState } from 'react';
import { FolderOpen, Copy, CheckCheck, ChevronDown, ChevronUp } from 'lucide-react';

const INSTALL_PATH = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Le Mans Ultimate\\UserData\\Liveries';

export default function InstallGuide() {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTALL_PATH);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border rounded-md bg-card/50 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-secondary/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FolderOpen className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="text-[11px] font-rajdhani font-semibold uppercase tracking-widest text-muted-foreground">
            How to Install
          </span>
        </div>
        {open
          ? <ChevronUp className="w-3 h-3 text-muted-foreground" />
          : <ChevronDown className="w-3 h-3 text-muted-foreground" />
        }
      </button>

      {open && (
        <div className="px-3 pb-3 flex flex-col gap-2.5 border-t border-border">
          <ol className="flex flex-col gap-1.5 mt-2">
            {[
              'Export the TGA using the button above',
              'Open the folder below in Windows Explorer',
              'Drop customskin.tga into that folder',
              'Launch LMU — your livery will appear in-game',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[10px] font-mono text-primary mt-0.5 flex-shrink-0">{i + 1}.</span>
                <span className="text-[11px] text-muted-foreground leading-snug">{step}</span>
              </li>
            ))}
          </ol>

          <div className="flex items-center gap-1.5 bg-secondary rounded px-2 py-1.5 mt-1">
            <span className="text-[10px] font-mono text-foreground break-all flex-1 leading-relaxed select-all">
              {INSTALL_PATH}
            </span>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
              title="Copy path"
            >
              {copied
                ? <CheckCheck className="w-3.5 h-3.5 text-primary" />
                : <Copy className="w-3.5 h-3.5" />
              }
            </button>
          </div>

          <p className="text-[10px] text-muted-foreground/60 leading-snug">
            If LMU is installed elsewhere, navigate to your game's <span className="font-mono">UserData\Liveries</span> folder instead.
          </p>
        </div>
      )}
    </div>
  );
}