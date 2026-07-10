import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Layers, FolderOpen, Copy, CheckCheck, ChevronDown, Undo2, Redo2, Save, LogOut, User as UserIcon, Lightbulb, LayoutDashboard } from 'lucide-react';
import { VEHICLES, BASE_COLOURS } from '@/lib/vehicles';
import { TutorialButton } from './InteractiveTutorial';

const INSTALL_PATH = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Le Mans Ultimate\\UserData\\Liveries';

export default function TopBar({ vehicleId, onVehicleChange, baseColour, onBaseColourChange, customColour, onCustomColourChange, onExport, onStartTutorial, onUndo, onRedo, canUndo, canRedo, onSaveDesign, onOpenMyDesigns, onOpenSuggestions, isAdmin, isAuthenticated, user, onLogout }) {
  const [installOpen, setInstallOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [designsOpen, setDesignsOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTALL_PATH);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="flex items-center gap-3 px-4 h-14 bg-card border-b border-border flex-shrink-0">
      {/* Logo */}
      <div data-tutorial="logo" className="flex items-center gap-2.5 mr-2">
        <div className="brand-gradient-bg clip-chamfer flex items-center justify-center w-8 h-8 shadow-[0_0_16px_-4px_hsl(var(--brand-purple)/0.8)]">
          <Layers className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-geom text-lg tracking-wide uppercase leading-none">
            <span className="text-foreground">LMU </span>
            <span className="brand-gradient-text">Livery Studio</span>
          </span>
          <span className="brand-eyebrow text-muted-foreground mt-1">by XILE GT Simracing</span>
        </div>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Vehicle selector */}
      <div data-tutorial="vehicle" className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Vehicle</span>
        <Select value={vehicleId} onValueChange={onVehicleChange}>
          <SelectTrigger className="h-8 text-xs w-52 bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VEHICLES.map((v) =>
            <SelectItem key={v.id} value={v.id} className="text-xs">{v.name}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Base colour */}
      <div data-tutorial="base-colour" className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Base Colour</span>
        <Select value={baseColour} onValueChange={onBaseColourChange}>
          <SelectTrigger className="h-8 text-xs w-44 bg-secondary border-border">
            <SelectValue>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm border border-border flex-shrink-0"
                  style={{ background: baseColour === 'custom' ? customColour : baseColour }} />
                
                {BASE_COLOURS.find((c) => c.value === baseColour)?.label || 'Custom'}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {BASE_COLOURS.map((c) =>
            <SelectItem key={c.value} value={c.value} className="text-xs">
                <div className="flex items-center gap-2">
                  {c.value !== 'custom' &&
                <div className="w-3 h-3 rounded-sm border border-border flex-shrink-0" style={{ background: c.value }} />
                }
                  {c.label}
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {baseColour === 'custom' &&
        <input
          type="color"
          value={customColour}
          onChange={(e) => onCustomColourChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent" />

        }
      </div>

      <div className="flex-1" />

      {/* Undo / Redo */}
      <div data-tutorial="undo-redo" className="flex items-center gap-1">
        <Button
          onClick={onUndo}
          disabled={!canUndo}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          onClick={onRedo}
          disabled={!canRedo}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      <TutorialButton onStart={onStartTutorial} />

      {/* Designs Dropdown */}
      <div data-tutorial="designs" className="relative">
        <Button
          onClick={() => setDesignsOpen(!designsOpen)}
          variant="outline"
          size="sm"
          className="h-8 gap-2 text-xs"
        >
          <Save className="w-4 h-4" />
          Designs
          <ChevronDown className={`w-3 h-3 transition-transform ${designsOpen ? 'rotate-180' : ''}`} />
        </Button>

        {designsOpen && (
          <div className="absolute right-0 top-10 w-56 bg-card border border-border rounded-md shadow-lg z-50 p-1.5">
            {isAuthenticated && user && (
              <div className="px-2 py-1.5 mb-1 border-b border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Signed in as</p>
                <p className="text-xs text-foreground truncate flex items-center gap-1.5">
                  <UserIcon className="w-3 h-3 text-primary flex-shrink-0" />
                  {user.full_name || user.email}
                </p>
              </div>
            )}
            <button
              onClick={() => { setDesignsOpen(false); onSaveDesign(); }}
              className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded hover:bg-secondary text-xs text-foreground"
            >
              <Save className="w-3.5 h-3.5 text-primary" />
              Save Design…
            </button>
            <button
              onClick={() => { setDesignsOpen(false); onOpenMyDesigns(); }}
              className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded hover:bg-secondary text-xs text-foreground"
            >
              <FolderOpen className="w-3.5 h-3.5 text-primary" />
              My Designs
            </button>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setDesignsOpen(false)}
                className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded hover:bg-secondary text-xs text-foreground"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                Admin Dashboard
              </Link>
            )}
            {isAuthenticated && (
              <button
                onClick={() => { setDesignsOpen(false); onLogout(); }}
                className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded hover:bg-secondary text-xs text-muted-foreground mt-1 border-t border-border pt-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            )}
          </div>
        )}
      </div>

      {/* Install Guide Dropdown */}
      <div data-tutorial="install" className="relative">
        <Button
          onClick={() => setInstallOpen(!installOpen)}
          variant="outline"
          size="sm"
          className="h-8 gap-2 text-xs">
          <FolderOpen className="w-4 h-4" />
          How to Install
          <ChevronDown className={`w-3 h-3 transition-transform ${installOpen ? 'rotate-180' : ''}`} />
        </Button>
        
        {installOpen && (
          <div className="absolute right-0 top-10 w-72 bg-card border border-border rounded-md shadow-lg z-50 p-3">
            <ol className="flex flex-col gap-1.5">
              {[
                'Export the TGA using the button below',
                'Open the folder in Windows Explorer',
                'Drop customskin.tga into that folder',
                'Launch LMU — your livery will appear in-game',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[10px] font-mono text-primary mt-0.5 flex-shrink-0">{i + 1}.</span>
                  <span className="text-[11px] text-muted-foreground leading-snug">{step}</span>
                </li>
              ))}
            </ol>

            <div className="flex items-center gap-1.5 bg-secondary rounded px-2 py-1.5 mt-2.5">
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

            <p className="text-[10px] text-muted-foreground/60 leading-snug mt-2">
              If LMU is installed elsewhere, navigate to your game's <span className="font-mono">UserData\Liveries</span> folder instead.
            </p>
          </div>
        )}
      </div>

      {/* Feedback / Suggest */}
      <Button
        onClick={onOpenSuggestions}
        variant="outline"
        size="sm"
        className="h-8 gap-2 text-xs"
        title="Suggest a feature or report a bug"
      >
        <Lightbulb className="w-4 h-4 text-primary" />
        Feedback
      </Button>

      {/* Export */}
      <Button
        data-tutorial="export"
        onClick={onExport}
        variant="gradient"
        size="sm"
        className="h-8 gap-2 font-rajdhani font-semibold tracking-wide uppercase">

        <Download className="w-4 h-4" />
        Export 4K TGA
      </Button>
    </header>);

}