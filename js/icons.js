/* Win11OS — Icons via Icons8 Fluency CDN
   Free use with attribution: https://icons8.com
   Format: https://img.icons8.com/fluency/SIZE/ICON-SLUG.png
*/

const ICON_MAP = {
  folder:      'folder',
  edge:        'microsoft-edge-new',
  notepad:     'notepad',
  settings:    'settings',
  terminal:    'console',
  recycle:     'full-trash',
  calendar:    'calendar',
  photos:      'image-gallery',
  paint:       'paint-palette',
  calculator:  'calculator',
  music:       'music',
  store:       'microsoft-store',
  mail:        'secured-letter',
  thispc:      'imac',
  user:        'user-male-circle',
  wifi:        'wi-fi',
  battery:     'battery',
  volume:      'speaker',
  bluetooth:   'bluetooth',
  brightness:  'sun',
  lock:        'padlock',
  power:       'shutdown',
  search:      'search',
  shield:      'security-shield-green',
  notification:'notification',
  file:        'file',
  image:       'image-file',
  audio:       'audio-file',
  video:       'video-file',
};

// Snap to Icons8 supported sizes
function snapSize(s) {
  if (s <= 16) return 16;
  if (s <= 24) return 24;
  if (s <= 32) return 32;
  if (s <= 48) return 48;
  return 64;
}

/**
 * Returns an <img> tag pointing at Icons8 Fluency CDN.
 * Falls back to generic 'file' icon on error.
 */
function icon(name, size = 48) {
  const sz   = snapSize(size);
  const slug = ICON_MAP[name] || name;
  const src  = `https://img.icons8.com/fluency/${sz}/${slug}.png`;
  const fb   = `https://img.icons8.com/fluency/${sz}/file.png`;
  return `<img src="${src}" width="${size}" height="${size}" alt="${name}" draggable="false" style="display:block;image-rendering:auto" onerror="if(this.src!=='${fb}')this.src='${fb}'">`;
}

/** Returns just the CDN URL string */
function iconUrl(name, size = 48) {
  const sz   = snapSize(size);
  const slug = ICON_MAP[name] || name;
  return `https://img.icons8.com/fluency/${sz}/${slug}.png`;
}

/* ── Attribution (required by Icons8 free licence) ──────────────
   Icons by Icons8 — https://icons8.com
   ─────────────────────────────────────────────────────────────── */
