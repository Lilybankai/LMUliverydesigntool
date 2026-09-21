// ELMS x LMU — ELMS 2026 Livery Contest.
//
// Single source of truth for the contest. The public /elms-contest page, the
// banner under the top bar, the first-visit announcement and the sidebar card
// all read from here, so the deadline, the rules and the links can never drift
// apart between surfaces. When the deadline passes every in-editor surface
// hides itself and the page switches to its "entries closed" state, so nothing
// needs taking down by hand.

import { VEHICLES } from '@/lib/vehicles';

/** The in-app vehicle the contest is run on. */
export const CONTEST_VEHICLE_ID = 'oreca_07_lmp2_elms';

export const CONTEST_PAGE_PATH = '/elms-contest';

// Tuesday 6 October 2026, 12:00 CEST (UTC+2).
export const CONTEST_DEADLINE = new Date('2026-10-06T10:00:00Z');

export const ELMS_CONTEST = {
  name: 'ELMS 2026 Livery Contest',
  organisers: 'European Le Mans Series × Le Mans Ultimate',
  car: 'ELMS Oreca 07-Gibson',
  carShort: 'Oreca 07-Gibson',
  deadlineLabel: 'Tuesday 6 October 2026, 12:00 CEST',
  deadlineShort: '6 Oct, 12:00 CEST',
  winnerAnnounced: 'The winner is announced the week after the deadline.',
  entryFormUrl:
    'https://forms.cloud.microsoft/pages/responsepage.aspx?id=dwuiQGK23E6MJd2h__hn7u8chQ5ibIRNmML5wgtE8fBUMU5XODJTWTFRRVlHM0cySEFMM1RXMVZONC4u&route=shorturl',
  racecontrolUrl: 'https://racecontrol.gg',
  elmsUrl: 'https://www.europeanlemansseries.com',
  lmuUrl: 'https://lemansultimate.com',

  prize: [
    {
      title: 'Your livery in the game',
      body: 'The winning design becomes the official ELMS 2026 livery on the No.26 car in Le Mans Ultimate, playable by everyone.',
    },
    {
      title: 'Your name on the car',
      body: 'Your name goes in the game and on the car of the ELMS 26 Team.',
    },
    {
      title: 'A year of Racecontrol.gg',
      body: 'A free one-year subscription to Racecontrol.gg.',
    },
  ],

  rules: [
    'No other sponsors. The only brand logos allowed on the livery are ELMS and LMU.',
    'Text is allowed, but it must stay polite and respectful.',
    'Keep the number plates and class markers from the template in place. In the Studio that is the Class Stickers layer, so leave it switched on.',
    'Any livery that breaks these rules will not be included in the vote.',
  ],

  // Straight from the ELMS brand guidelines that ship with the media pack.
  brandRules: [
    'Use the logo exactly as supplied. Do not recolour, distort, re-typeset, rebuild or add effects to it.',
    'Never use orange as the only colour of the logo, and never put a gradient on it.',
    'Keep a clear zone around the logo of at least twice its cap height, with no artwork, text or other logos inside it.',
    'Pick the logo version that gives the strongest contrast with what sits behind it. White versions are for dark or busy backgrounds.',
    'Keep it legible: 130px is the smallest the full logo should ever be on screen.',
  ],

  requirements: [
    { title: 'A Racecontrol.gg subscription', body: 'Entries are uploaded to Racecontrol.gg, so you need an account there.' },
    { title: 'Le Mans Ultimate', body: 'You will want the game to check your livery on the car before you submit.' },
    { title: 'A way to paint the template', body: 'LMU Livery Studio has the official ELMS Oreca template built in. Or use any software that opens a .psd.' },
  ],
};

/** ELMS palette, from the brand guidelines. */
export const ELMS_COLOURS = [
  { label: 'ELMS Orange', value: '#FF5F00', note: 'Pantone Orange 021 C' },
  { label: 'ELMS Navy', value: '#0A0032', note: 'Pantone 282 C' },
  { label: 'ELMS White', value: '#FFFFFF', note: 'RAL 9003' },
  { label: 'LMP2 Blue', value: '#325F95', note: 'Class colour' },
];

/** Logo files served from /public, in the order they are offered. */
export const ELMS_LOGOS = [
  { id: 'blue-orange', label: 'Blue & orange', src: '/contest/elms/elms-logo-blue-orange.svg', onDark: false },
  { id: 'white-orange', label: 'White & orange', src: '/contest/elms/elms-logo-white-orange.svg', onDark: true },
  { id: 'white-black', label: 'White & black', src: '/contest/elms/elms-logo-white-black.svg', onDark: true },
  { id: 'black', label: 'Black', src: '/contest/elms/elms-logo-black.svg', onDark: false },
];

export const LMU_LOGOS = [
  { id: 'lmu-white', label: 'LMU white', src: '/contest/elms/lmu-logo-white.webp', onDark: true },
  { id: 'lmu-black', label: 'LMU black', src: '/contest/elms/lmu-logo-black.webp', onDark: false },
];

export const CONTEST_ASSETS = {
  hero: '/contest/elms/hero.webp',
  brandGuidelinesPdf: '/contest/elms/ELMS-Brand-Guidelines.pdf',
  // The official PSD is 25MB and ships inside every LMU install; we point people
  // at it rather than mirroring it.
  psdInstallPath:
    'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Le Mans Ultimate\\Support\\LiveryTemplates\\Template_LMP2_Oreca07_ELMS_2025.psd',
};

export function contestVehicle() {
  return VEHICLES.find((v) => v.id === CONTEST_VEHICLE_ID) || null;
}

export function isContestOpen(now = new Date()) {
  return now.getTime() < CONTEST_DEADLINE.getTime();
}

/** Whole days left, never negative; 0 on deadline day. */
export function daysLeft(now = new Date()) {
  const ms = CONTEST_DEADLINE.getTime() - now.getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/** Short human label for the time remaining, used on the compact surfaces. */
export function timeLeftLabel(now = new Date()) {
  const ms = CONTEST_DEADLINE.getTime() - now.getTime();
  if (ms <= 0) return 'Entries closed';
  const days = Math.floor(ms / 86_400_000);
  if (days >= 2) return `${days} days left`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 2) return `${hours} hours left`;
  return 'Closes in under 2 hours';
}

/**
 * Link into the editor with the contest car preselected. `placement` becomes
 * utm_content so each surface can be told apart in analytics.
 */
export function studioUrl(placement) {
  const params = new URLSearchParams({
    vehicle: CONTEST_VEHICLE_ID,
    utm_source: 'lmu-livery-studio',
    utm_medium: 'contest',
    utm_campaign: 'elms-2026-livery',
  });
  if (placement) params.set('utm_content', placement);
  return `/?${params.toString()}`;
}

export function contestPageUrl(placement) {
  const params = new URLSearchParams();
  if (placement) params.set('utm_content', placement);
  const qs = params.toString();
  return qs ? `${CONTEST_PAGE_PATH}?${qs}` : CONTEST_PAGE_PATH;
}

/**
 * Best-effort analytics, same shape as the Apex promo: the `db` shim differs per
 * entry point and does not always carry an `analytics` object, so a missing
 * tracker must never block whatever the user actually clicked.
 */
export function trackContest(eventName, properties) {
  try {
    globalThis.__B44_DB__?.analytics?.track?.({ eventName, properties });
  } catch {
    // non-fatal
  }
}
