/**
 * Win11OS - Icon Library
 * All icons as 48x48 SVG strings.
 */
const ICONS = {
  folder: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 10h16l4 4h20a2 2 0 012 2v24a2 2 0 01-2 2H4a2 2 0 01-2-2V12a2 2 0 012-2z" fill="#FFB900"/>
    <path d="M4 16h40v24H4z" fill="#FFC832"/></svg>`,

  edge: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="eg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0F4C81"/><stop offset="1" stop-color="#1B8CE3"/></linearGradient>
      <linearGradient id="eg2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#31BCEA"/><stop offset="1" stop-color="#39C3EE"/></linearGradient>
    </defs>
    <circle cx="24" cy="24" r="22" fill="url(#eg1)"/>
    <path d="M36 20c0 6.6-5.4 12-12 12s-12-5.4-12-12c0-2.4.7-4.6 1.9-6.5C8.8 15.6 6 19.5 6 24c0 9.9 8.1 18 18 18s18-8.1 18-18c0-1-.1-2-.3-2.9-.8 5-4.8 8.9-9.7 8.9z" fill="url(#eg2)"/></svg>`,

  notepad: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="4" width="32" height="40" rx="3" fill="#F5F5F5"/>
    <rect x="8" y="4" width="32" height="8" rx="3" fill="#E0E0E0"/>
    <rect x="12" y="16" width="24" height="2" rx="1" fill="#BDBDBD"/>
    <rect x="12" y="21" width="24" height="2" rx="1" fill="#BDBDBD"/>
    <rect x="12" y="26" width="18" height="2" rx="1" fill="#BDBDBD"/>
    <rect x="12" y="31" width="20" height="2" rx="1" fill="#CFCFCF"/>
    <rect x="18" y="0" width="4" height="8" rx="1" fill="#0078D4"/>
    <rect x="26" y="0" width="4" height="8" rx="1" fill="#0078D4"/></svg>`,

  settings: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="6" fill="#9E9E9E"/>
    <path d="M38.9 26.7l2.6-1.5a2 2 0 000-2.4l-2.6-1.5C38.3 21.9 38 21.4 38 21l.3-3a2 2 0 00-2-1.7l-3 .3c-.5 0-1-.3-1.3-.7l-1.5-2.6a2 2 0 00-2.1-.9l-1.7.7c-.4.2-.9.2-1.3 0l-1.7-.7a2 2 0 00-2.1.9l-1.5 2.6c-.3.4-.8.7-1.3.7l-3-.3a2 2 0 00-2 1.7l.3 3c0 .4-.3.9-.7 1.2l-2.6 1.5a2 2 0 000 2.4l2.6 1.5c.4.3.7.8.7 1.3l-.3 3a2 2 0 002 1.7l3-.3c.5 0 1 .3 1.3.7l1.5 2.6a2 2 0 002.1.9l1.7-.7c.4-.2.9-.2 1.3 0l1.7.7a2 2 0 002.1-.9l1.5-2.6c.3-.4.8-.7 1.3-.7l3 .3a2 2 0 002-1.7l-.3-3c0-.5.3-1 .7-1.3z" fill="#6E6E6E"/></svg>`,

  terminal: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="8" width="44" height="32" rx="3" fill="#0C0C0C"/>
    <polyline points="12,18 20,24 12,30" stroke="#0078D4" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="22" y1="30" x2="36" y2="30" stroke="#0078D4" stroke-width="2.5" stroke-linecap="round"/></svg>`,

  recycle: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 8l-6 10h4v4h4v-4h4L24 8z" fill="#81BC06"/>
    <path d="M16 28l-8 4 10 4 2-10-4 2z" fill="#05A6F0"/>
    <path d="M32 28l4 10 10-4-8-4z" fill="#F35325"/>
    <circle cx="24" cy="32" r="6" fill="#E8E8E8"/></svg>`,

  calendar: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="40" height="36" rx="3" fill="#0078D4"/>
    <rect x="4" y="8" width="40" height="12" rx="3" fill="#005A9E"/>
    <rect x="14" y="2" width="4" height="12" rx="2" fill="#fff"/>
    <rect x="30" y="2" width="4" height="12" rx="2" fill="#fff"/>
    <text x="24" y="38" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold" font-family="Segoe UI">10</text></svg>`,

  photos: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="ph1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F35325"/><stop offset=".5" stop-color="#FFB900"/><stop offset="1" stop-color="#81BC06"/></linearGradient></defs>
    <rect x="4" y="8" width="40" height="32" rx="3" fill="url(#ph1)"/>
    <circle cx="18" cy="20" r="4" fill="rgba(255,255,255,0.7)"/>
    <path d="M4 32l12-12 8 10 6-6 14 14H4z" fill="rgba(255,255,255,0.5)"/></svg>`,

  store: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="st1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0078D4"/><stop offset="1" stop-color="#50E6FF"/></linearGradient></defs>
    <rect x="4" y="4" width="40" height="40" rx="4" fill="url(#st1)"/>
    <path d="M24 12l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" fill="#fff"/></svg>`,

  mail: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="10" width="40" height="28" rx="3" fill="#0078D4"/>
    <path d="M4 13l20 14 20-14" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,

  spotify: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#1DB954"/>
    <path d="M33.5 32.5c-.4 0-.7-.1-1-.3-5.5-3.3-12.4-4-20.5-2.2-.8.2-1.5-.3-1.7-1.1-.2-.8.3-1.5 1.1-1.7 8.8-2 16.4-1.1 22.5 2.5.6.4.9 1.2.5 1.9-.3.5-.9.9-1.9.9zm2.5-5.5c-.5 0-1-.2-1.3-.4-6.3-3.7-15.8-4.8-23.2-2.6-1 .3-2-.3-2.3-1.2-.3-1 .3-2 1.2-2.3 8.5-2.6 19.1-1.3 26.4 3 .9.5 1.1 1.7.6 2.6-.4.6-1 .9-1.4.9zm.3-5.7c-7.5-4.5-19.9-4.9-27.1-2.7-1.1.3-2.3-.3-2.6-1.4-.3-1.1.3-2.3 1.4-2.6 8.3-2.5 22.1-2 30.6 3.1 1 .6 1.3 1.9.7 2.9-.5.7-1.3 1.1-1.9 1.1-.4 0-.8-.1-1.1-.4z" fill="#fff"/></svg>`,

  thispc: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="8" width="36" height="26" rx="2" fill="#607D8B"/>
    <rect x="8" y="10" width="32" height="22" rx="1" fill="#37474F"/>
    <rect x="16" y="34" width="16" height="4" fill="#546E7A"/>
    <rect x="12" y="38" width="24" height="3" rx="1" fill="#455A64"/></svg>`,

  user: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="16" r="10" fill="#60CDFF"/>
    <path d="M4 42c0-11 8.95-18 20-18s20 7 20 18" fill="#0078D4"/></svg>`,

  lock: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="22" width="32" height="22" rx="3" fill="#607D8B"/>
    <path d="M14 22V16a10 10 0 0120 0v6" fill="none" stroke="#607D8B" stroke-width="4" stroke-linecap="round"/>
    <circle cx="24" cy="33" r="4" fill="#fff"/>
    <rect x="22" y="33" width="4" height="6" rx="1" fill="#fff"/></svg>`,

  power: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M26 6v18h-4V6h4zm6.9 6.1a18 18 0 11-17.8 0" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>`,

  search: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="14" fill="none" stroke="#fff" stroke-width="3"/>
    <line x1="30" y1="30" x2="44" y2="44" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>`,

  win: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="21" height="21" fill="#F35325"/>
    <rect x="25" y="2" width="21" height="21" fill="#81BC06"/>
    <rect x="2" y="25" width="21" height="21" fill="#05A6F0"/>
    <rect x="25" y="25" width="21" height="21" fill="#FFB900"/></svg>`,

  person: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="16" r="9" fill="#9E9E9E"/>
    <path d="M6 40c0-9.9 8.1-16 18-16s18 6.1 18 16" fill="#757575"/></svg>`,

  shield: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 4L6 12v12c0 11 7.7 21.3 18 24 10.3-2.7 18-13 18-24V12L24 4z" fill="#0078D4"/>
    <path d="M16 24l6 6 12-12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  add: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#0078D4"/>
    <line x1="24" y1="12" x2="24" y2="36" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    <line x1="12" y1="24" x2="36" y2="24" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`,
};

// Smaller 16px nav/toolbar icon paths (fill="currentColor" unless noted)
const NAV_ICONS = {
  back:    `<path d="M15 8L9 14l6 6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  fwd:     `<path d="M9 8l6 6-6 6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  refresh: `<path d="M4 12a8 8 0 0114-5.3M4 12H8M20 12a8 8 0 01-14 5.3M20 12h-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
  search:  `<path d="M15 15l-3.5-3.5M11 7a4 4 0 110 8 4 4 0 010-8z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
  close:   `<line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  min:     `<line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  max:     `<rect x="4" y="4" width="16" height="16" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
  more:    `<circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/>`,
  grid:    `<rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor"/><rect x="14" y="2" width="8" height="8" rx="1" fill="currentColor"/><rect x="2" y="14" width="8" height="8" rx="1" fill="currentColor"/><rect x="14" y="14" width="8" height="8" rx="1" fill="currentColor"/>`,
  list:    `<line x1="2" y1="6" x2="22" y2="6" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="18" x2="22" y2="18" stroke="currentColor" stroke-width="1.5"/>`,
  new:     `<path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  sort:    `<path d="M4 6h16M4 12h10M4 18h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  cut:     `<path d="M6 20L18 8M6 8l12 12M6 20a3 3 0 100-6 3 3 0 000 6zm12 0a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
  copy:    `<rect x="8" y="2" width="13" height="16" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M5 6H4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-1" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
  paste:   `<rect x="5" y="6" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M9 2h6a1 1 0 011 1v3H8V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
  rename:  `<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M18.5 2.5l3 3L12 15H9v-3l9.5-9.5z" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
  delete:  `<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
  share:   `<circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8.6 13.5l5.8 3.5M14.4 7L8.6 10.5" stroke="currentColor" stroke-width="1.5"/>`,
};

function icon(name, size = 48) {
  const svg = ICONS[name];
  if (!svg) return '';
  return svg.replace('<svg ', `<svg width="${size}" height="${size}" `);
}

function navIcon(name) {
  const path = NAV_ICONS[name] || '';
  return `<svg viewBox="0 0 24 24" width="16" height="16">${path}</svg>`;
}
