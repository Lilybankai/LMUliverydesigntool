// Apex AIO System — the in-family cross-promo shown inside the Livery Studio.
//
// Single source of truth for the offer. Both promo surfaces (the export dialog
// and the sidebar card) read from here, so the URL and the price/trial wording
// can never drift apart between them.
//
// Every placement funnels to the same landing page and is tagged with a UTM
// source so the Apex side can tell Livery Studio traffic apart from the rest,
// and tell the two placements apart from each other.

export const APEX_AIO_URL = 'https://apexandchillracing.co.uk/apex-overlay-system';

export const APEX_AIO = {
  name: 'Apex AIO System',
  // Kept in step with electron/billing.js in the apex-overlay-system repo.
  price: '£4.99/month',
  trialDays: 7,
  tagline: 'Live telemetry overlays for Le Mans Ultimate & rFactor 2',
  // The claim that does the work in the trial emails: nothing is taken up front.
  reassurance: 'Cancel in two clicks — nothing is taken during the 7 days.',
  bullets: [
    'Standings, relative, pedals, tyres, fuel & weather',
    'Drop straight into OBS as Browser Sources',
    'Or show them in game over the sim HUD',
  ],
};

/**
 * Build the landing-page URL for a given placement.
 * `placement` becomes utm_content so each surface is measurable on its own.
 */
export function apexAioUrl(placement) {
  const url = new URL(APEX_AIO_URL);
  url.searchParams.set('utm_source', 'lmu-livery-studio');
  url.searchParams.set('utm_medium', 'cross-promo');
  url.searchParams.set('utm_campaign', 'apex-aio-trial');
  if (placement) url.searchParams.set('utm_content', placement);
  return url.toString();
}

/**
 * Open the Apex AIO landing page in a new tab and record the click.
 *
 * Analytics is best-effort: the `db` shim differs per entry point and does not
 * always carry an `analytics` object, so a missing tracker must never swallow
 * the navigation the user actually asked for.
 */
export function openApexAio(placement) {
  try {
    globalThis.__B44_DB__?.analytics?.track?.({
      eventName: 'apex_aio_promo_clicked',
      properties: { placement },
    });
  } catch {
    // non-fatal — never block the click on a tracking failure
  }
  window.open(apexAioUrl(placement), '_blank', 'noopener,noreferrer');
}
