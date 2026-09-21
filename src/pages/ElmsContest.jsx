import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, Download, ExternalLink, FileText, Trophy, ShieldCheck,
  Palette, Layers, Upload, ClipboardList, Gamepad2, Ban, Copy, CheckCheck,
} from 'lucide-react';
import {
  ELMS_CONTEST, ELMS_COLOURS, ELMS_LOGOS, LMU_LOGOS, CONTEST_ASSETS,
  CONTEST_DEADLINE, studioUrl, isContestOpen, trackContest,
} from '@/lib/elmsContest';

const ORANGE = '#FF5F00';
const NAVY = '#0A0032';

function computeCountdown() {
  const ms = Math.max(0, CONTEST_DEADLINE.getTime() - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms % 86_400_000) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
  };
}

function useCountdown() {
  const [t, setT] = useState(computeCountdown);
  useEffect(() => {
    const id = setInterval(() => setT(computeCountdown()), 30_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function Eyebrow({ children }) {
  return <p className="brand-eyebrow" style={{ color: ORANGE }}>{children}</p>;
}

function H2({ children }) {
  return (
    <h2 className="mt-2 font-rajdhani text-3xl font-bold uppercase leading-none tracking-wide text-foreground sm:text-4xl">
      {children}
    </h2>
  );
}

function Section({ id, children, className = '' }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 ${className}`}>
      {children}
    </section>
  );
}

function PrimaryLink({ to, href, placement, children, className = '' }) {
  const cls = `clip-chamfer inline-flex items-center justify-center gap-2 px-6 py-3 font-rajdhani text-base font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90 ${className}`;
  const style = { background: ORANGE };
  if (to) {
    return (
      <Link to={to} className={cls} style={style} onClick={() => trackContest('elms_contest_studio_clicked', { placement })}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cls}
      style={style}
      onClick={() => trackContest('elms_contest_link_clicked', { placement, href })}
    >
      {children}
    </a>
  );
}

function SecondaryLink({ href, placement, children, className = '' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackContest('elms_contest_link_clicked', { placement, href })}
      className={`inline-flex items-center justify-center gap-2 rounded border border-white/30 px-6 py-3 font-rajdhani text-base font-semibold uppercase tracking-widest text-white transition-colors hover:bg-white/10 ${className}`}
    >
      {children}
    </a>
  );
}

function CopyPath({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked; the path is still visible to select by hand
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy path"
      className="mt-2 flex w-full items-center gap-2 rounded border border-border bg-background px-3 py-2 text-left font-mono text-[11px] text-muted-foreground hover:text-foreground"
    >
      <span className="min-w-0 flex-1 truncate">{value}</span>
      {copied
        ? <CheckCheck className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
        : <Copy className="h-3.5 w-3.5 flex-shrink-0" />}
    </button>
  );
}

function LogoTile({ logo, alt }) {
  return (
    <a
      href={logo.src}
      download
      className={`flex flex-col items-center gap-2 rounded border border-border p-4 transition-colors hover:border-[#FF5F00] ${logo.onDark ? '' : 'bg-white'}`}
      style={logo.onDark ? { background: NAVY } : undefined}
    >
      <img src={logo.src} alt={alt} className="h-8 w-auto" />
      <span className={`flex items-center gap-1 text-[11px] ${logo.onDark ? 'text-white/70' : 'text-[#0A0032]/70'}`}>
        <Download className="h-3 w-3" />
        {logo.label}
      </span>
    </a>
  );
}

const STEPS = [
  {
    icon: Layers,
    title: 'Design the ELMS Oreca',
    body: (
      <>
        Open LMU Livery Studio with the contest car preselected, or pick{' '}
        <span className="text-foreground">Oreca 07 LMP2 (ELMS)</span> from the vehicle list.
        The official ELMS template is built in, with the number plates and class markers on the
        Class Stickers layer. Prefer Photoshop? The same PSD ships with every copy of the game.
      </>
    ),
  },
  {
    icon: Gamepad2,
    title: 'Check it on the car',
    body: (
      <>
        Export from the Studio and drop the file into Le Mans Ultimate to see the livery in game
        before you submit. The Studio&apos;s auto installer does the file handling for you.
      </>
    ),
  },
  {
    icon: Upload,
    title: 'Upload it to Racecontrol.gg',
    body: (
      <>
        Entries are collected on Racecontrol.gg, so add your finished livery there. You need a
        Racecontrol.gg subscription to upload.
      </>
    ),
  },
  {
    icon: ClipboardList,
    title: 'Fill in the entry form',
    body: (
      <>
        Both parts are required: the upload on Racecontrol.gg{' '}
        <span className="text-foreground">and</span> the entry form. Do both before the deadline.
      </>
    ),
  },
];

export default function ElmsContest() {
  const cd = useCountdown();
  const open = isContestOpen();
  const elmsWhite = ELMS_LOGOS.find((l) => l.id === 'white-orange');
  const lmuWhite = LMU_LOGOS.find((l) => l.id === 'lmu-white');

  useEffect(() => {
    document.title = `${ELMS_CONTEST.name} — LMU Livery Studio`;
    trackContest('elms_contest_page_view', { open });
    return () => { document.title = 'LMU LIVERY STUDIO'; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-white/10" style={{ background: NAVY }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <img src={elmsWhite.src} alt="European Le Mans Series" className="h-7 w-auto sm:h-8" />
            <span className="text-white/40">×</span>
            <img src={lmuWhite.src} alt="Le Mans Ultimate" className="h-6 w-auto sm:h-7" />
          </div>
          <Link
            to="/"
            className="hidden items-center gap-1 font-rajdhani text-sm font-semibold uppercase tracking-wider text-white/80 hover:text-white sm:inline-flex"
          >
            LMU Livery Studio
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: NAVY }}>
        <img
          src={CONTEST_ASSETS.hero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center opacity-60"
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(90deg, ${NAVY} 0%, ${NAVY}E6 45%, ${NAVY}66 100%)` }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Eyebrow>{ELMS_CONTEST.organisers}</Eyebrow>
          <h1 className="mt-3 max-w-3xl font-rajdhani text-5xl font-bold uppercase leading-[0.95] tracking-wide text-white sm:text-7xl">
            Design the official<br />ELMS 2026 livery
          </h1>
          <p className="mt-5 max-w-2xl text-base text-white/80 sm:text-lg">
            Paint the {ELMS_CONTEST.car}. If a panel of experts picks your design, it becomes the
            official ELMS livery in Le Mans Ultimate, on the No.26 car, for everyone to drive.
          </p>

          <div className="mt-8 inline-flex flex-wrap items-center gap-x-6 gap-y-2 rounded border border-white/15 bg-black/30 px-5 py-3 backdrop-blur">
            {open ? (
              <>
                <div className="flex items-baseline gap-3 font-rajdhani text-white">
                  {[['days', cd.days], ['hrs', cd.hours], ['min', cd.minutes]].map(([u, v]) => (
                    <span key={u} className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold tabular-nums">{String(v).padStart(2, '0')}</span>
                      <span className="text-xs uppercase tracking-widest text-white/60">{u}</span>
                    </span>
                  ))}
                </div>
                <p className="text-sm text-white/80">
                  Entries close <span className="font-semibold text-white">{ELMS_CONTEST.deadlineLabel}</span>
                </p>
              </>
            ) : (
              <p className="text-sm text-white/80">
                <span className="font-rajdhani text-xl font-bold uppercase tracking-wide" style={{ color: ORANGE }}>
                  Entries closed
                </span>
                {' '}on {ELMS_CONTEST.deadlineLabel}. {ELMS_CONTEST.winnerAnnounced}
              </p>
            )}
          </div>

          {open && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PrimaryLink to={studioUrl('page-hero')} placement="page-hero">
                Design it in the Studio
                <ArrowRight className="h-4 w-4" />
              </PrimaryLink>
              <SecondaryLink href={ELMS_CONTEST.entryFormUrl} placement="page-hero">
                Entry form
                <ExternalLink className="h-4 w-4" />
              </SecondaryLink>
              <SecondaryLink href={ELMS_CONTEST.racecontrolUrl} placement="page-hero">
                Racecontrol.gg
                <ExternalLink className="h-4 w-4" />
              </SecondaryLink>
            </div>
          )}
        </div>
      </div>

      {/* Prize */}
      <Section id="prize">
        <Eyebrow>The prize</Eyebrow>
        <H2>Your livery, in the game, for everyone</H2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {ELMS_CONTEST.prize.map((p, i) => (
            <div key={p.title} className="clip-chamfer border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" style={{ color: ORANGE }} />
                <span className="brand-eyebrow text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-3 font-rajdhani text-xl font-bold uppercase leading-tight tracking-wide">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{ELMS_CONTEST.winnerAnnounced}</p>
      </Section>

      {/* How to enter */}
      <div className="border-y border-border bg-card/40">
        <Section id="enter">
          <Eyebrow>How to enter</Eyebrow>
          <H2>Four steps before {ELMS_CONTEST.deadlineShort}</H2>
          <ol className="mt-8 grid gap-4 md:grid-cols-2">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4 rounded border border-border bg-background p-5">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded"
                  style={{ background: `${ORANGE}22`, color: ORANGE }}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="brand-eyebrow text-muted-foreground">Step {i + 1}</p>
                  <h3 className="mt-1 font-rajdhani text-xl font-bold uppercase leading-tight tracking-wide">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          {open && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryLink to={studioUrl('page-steps')} placement="page-steps">
                Start designing
                <ArrowRight className="h-4 w-4" />
              </PrimaryLink>
              <a
                href={ELMS_CONTEST.entryFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackContest('elms_contest_link_clicked', { placement: 'page-steps', href: ELMS_CONTEST.entryFormUrl })}
                className="inline-flex items-center justify-center gap-2 rounded border border-border px-6 py-3 font-rajdhani text-base font-semibold uppercase tracking-widest text-foreground transition-colors hover:bg-secondary"
              >
                Open the entry form
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </Section>
      </div>

      {/* Rules */}
      <Section id="rules">
        <Eyebrow>The rules</Eyebrow>
        <H2>Keep it clean, keep it ELMS</H2>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 font-rajdhani text-lg font-bold uppercase tracking-wide">
              <ShieldCheck className="h-5 w-5" style={{ color: ORANGE }} />
              Contest rules
            </h3>
            <ul className="mt-4 space-y-3">
              {ELMS_CONTEST.rules.map((r) => (
                <li key={r} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: ORANGE }} />
                  <span className="text-muted-foreground">{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-rajdhani text-lg font-bold uppercase tracking-wide">
              <Ban className="h-5 w-5" style={{ color: ORANGE }} />
              Using the ELMS logo
            </h3>
            <ul className="mt-4 space-y-3">
              {ELMS_CONTEST.brandRules.map((r) => (
                <li key={r} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: ORANGE }} />
                  <span className="text-muted-foreground">{r}</span>
                </li>
              ))}
            </ul>
            <a
              href={CONTEST_ASSETS.brandGuidelinesPdf}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
              style={{ color: ORANGE }}
            >
              <FileText className="h-4 w-4" />
              Read the full ELMS brand guidelines (PDF)
            </a>
          </div>
        </div>
      </Section>

      {/* Toolkit */}
      <div className="border-y border-border bg-card/40">
        <Section id="toolkit">
          <Eyebrow>Your toolkit</Eyebrow>
          <H2>Everything you need to build it</H2>

          <div className="mt-8 grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <h3 className="font-rajdhani text-lg font-bold uppercase tracking-wide">ELMS logo pack</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Four official versions as SVG. In the Studio these are one click away in the contest card
                once the ELMS Oreca is selected.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {ELMS_LOGOS.map((l) => <LogoTile key={l.id} logo={l} alt={`ELMS logo, ${l.label}`} />)}
              </div>

              <h3 className="mt-8 font-rajdhani text-lg font-bold uppercase tracking-wide">Le Mans Ultimate logo</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-md">
                {LMU_LOGOS.map((l) => <LogoTile key={l.id} logo={l} alt={l.label} />)}
              </div>
            </div>

            <div className="space-y-6 lg:col-span-2">
              <div>
                <h3 className="flex items-center gap-2 font-rajdhani text-lg font-bold uppercase tracking-wide">
                  <Palette className="h-5 w-5" style={{ color: ORANGE }} />
                  ELMS colours
                </h3>
                <ul className="mt-4 space-y-2">
                  {ELMS_COLOURS.map((c) => (
                    <li key={c.value} className="flex items-center gap-3 text-sm">
                      <span className="h-8 w-8 flex-shrink-0 rounded border border-white/20" style={{ background: c.value }} />
                      <span className="font-semibold">{c.label}</span>
                      <span className="ml-auto font-mono text-xs text-muted-foreground">{c.value}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">
                  These are also in the Studio&apos;s base colour list and on the contest card.
                </p>
              </div>

              <div>
                <h3 className="flex items-center gap-2 font-rajdhani text-lg font-bold uppercase tracking-wide">
                  <FileText className="h-5 w-5" style={{ color: ORANGE }} />
                  Official template (PSD)
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Already loaded in the Studio as <span className="text-foreground">Oreca 07 LMP2 (ELMS)</span>.
                  If you would rather work in Photoshop, the same file is inside your Le Mans Ultimate install:
                </p>
                <CopyPath value={CONTEST_ASSETS.psdInstallPath} />
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Requirements */}
      <Section id="requirements">
        <Eyebrow>Before you start</Eyebrow>
        <H2>What you need</H2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {ELMS_CONTEST.requirements.map((r) => (
            <div key={r.title} className="rounded border border-border bg-card p-5">
              <h3 className="font-rajdhani text-lg font-bold uppercase leading-tight tracking-wide">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Closing CTA */}
      {open && (
        <div style={{ background: NAVY }}>
          <Section className="text-center">
            <Eyebrow>Good luck</Eyebrow>
            <h2 className="mt-2 font-rajdhani text-3xl font-bold uppercase tracking-wide text-white sm:text-5xl">
              Submit by {ELMS_CONTEST.deadlineShort}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/75">
              Upload on Racecontrol.gg and fill in the entry form. Liveries that break the rules are not
              put to the vote, so keep it to ELMS and LMU logos only.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <PrimaryLink to={studioUrl('page-footer')} placement="page-footer">
                Design it in the Studio
                <ArrowRight className="h-4 w-4" />
              </PrimaryLink>
              <SecondaryLink href={ELMS_CONTEST.entryFormUrl} placement="page-footer">
                Entry form
                <ExternalLink className="h-4 w-4" />
              </SecondaryLink>
            </div>
          </Section>
        </div>
      )}

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            The {ELMS_CONTEST.name} is organised by the{' '}
            <a href={ELMS_CONTEST.elmsUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
              European Le Mans Series
            </a>
            {' '}and{' '}
            <a href={ELMS_CONTEST.lmuUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
              Le Mans Ultimate
            </a>.
            {' '}LMU Livery Studio is a free tool for painting the official templates.
          </p>
          <Link to="/" className="font-rajdhani font-semibold uppercase tracking-wider hover:text-foreground">
            Open LMU Livery Studio
          </Link>
        </div>
      </footer>
    </div>
  );
}
