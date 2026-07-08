// A curated list of popular Google Fonts. We dynamically load each font's
// CSS only when it's selected (to avoid pulling hundreds of font files at start).
export const GOOGLE_FONTS = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Source Sans 3',
  'Raleway', 'Poppins', 'Roboto Condensed', 'Merriweather', 'Noto Sans',
  'Ubuntu', 'PT Sans', 'Playfair Display', 'Nunito', 'Roboto Slab',
  'Work Sans', 'Quicksand', 'Mulish', 'Inter', 'Rajdhani', 'Bruno Ace SC',
  'Anta', 'Bebas Neue', 'Anton', 'Russo One', 'Black Ops One', 'Audiowide',
  'Orbitron', 'Press Start 2P', 'VT323', 'Major Mono Display', 'Monoton',
  'Bungee', 'Bungee Shade', 'Bowlby One', 'Squada One', 'Permanent Marker',
  'Pacifico', 'Lobster', 'Lobster Two', 'Great Vibes', 'Dancing Script',
  'Satisfy', 'Caveat', 'Shadows Into Light', 'Indie Flower', 'Kalam',
  'Architects Daughter', 'Patrick Hand', 'Amatic SC', 'Special Elite',
  'Fjalla One', 'Teko', 'Saira Condensed', 'Barlow', 'Barlow Condensed',
  'Exo 2', 'Titillium Web', 'Bai Jamjuree', 'Chakra Petch', 'Saira Stencil One',
  'Stick No Bills', 'Faster One', 'Iceland', 'Zen Dots', 'Goldman',
  'Wallpoet', 'Bungee Inline', 'Bungee Outline', 'Black Han Sans', 'Big Shoulders Display',
  'Big Shoulders Stencil Display', 'Stencil', 'Sansita', 'Sansita Swashed',
  'Alfa Slab One', 'Righteous', 'Bangers', 'Fredoka', 'Kanit', 'Prompt',
  'Sora', 'Manrope', 'DM Sans', 'DM Serif Display', 'DM Mono', 'Space Grotesk',
  'Space Mono', 'JetBrains Mono', 'Fira Code', 'Fira Sans', 'IBM Plex Sans',
  'IBM Plex Serif', 'IBM Plex Mono', 'Cormorant Garamond', 'EB Garamond',
  'Crimson Text', 'Libre Baskerville', 'Lora', 'PT Serif', 'Bitter',
  'Abril Fatface', 'Cinzel', 'Cinzel Decorative', 'Cookie', 'Tangerine',
  'Allura', 'Sacramento', 'Yellowtail', 'Kaushan Script', 'Berkshire Swash',
  'Faster One', 'Racing Sans One', 'Krona One', 'Michroma', 'Syncopate',
];

// Convert "Open Sans" -> "Open+Sans" for Google Fonts URL
function toQueryName(name) {
  return name.replace(/\s+/g, '+');
}

// Track which fonts we've already injected so we don't add duplicate <link>s
const loaded = new Set();

export function loadGoogleFont(name) {
  if (!name || loaded.has(name)) return;
  loaded.add(name);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  // Request multiple weights & italic so bold/italic toggles work
  link.href = `https://fonts.googleapis.com/css2?family=${toQueryName(name)}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
  document.head.appendChild(link);
}

// Best-effort wait for the font to be loaded before canvases use it.
export async function ensureFontReady(name, fontSize = 96, weight = '400', style = 'normal') {
  loadGoogleFont(name);
  if (!document.fonts || !document.fonts.load) return;
  try {
    await document.fonts.load(`${style} ${weight} ${fontSize}px "${name}"`);
  } catch (e) {
    // ignore — canvas will fall back
  }
}