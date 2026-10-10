// Which ink each stamp is printed in.

import { KEYWORD_BY_KEY } from './catalog';
import type { Described } from './describe';

const HOUSE = {
  special: '#e8604c',
  stars: '#f2b705',
  number: '#2f4a8a',
  species: '#0e7f78',
  tag: '#8e4ec6',
  slate: '#56637f',
  custom: '#8a8f9c',
};

export function inkFor(d: Described, text: string): string {
  if (d.type) return d.type.color;
  switch (d.kind) {
    case 'stars':
    case 'iv':
      return HOUSE.stars;
    case 'range':
      return HOUSE.number;
    case 'dex':
      // A single number is a species; a span of numbers is a range.
      return d.label.startsWith('Dex') ? HOUSE.number : HOUSE.species;
    case 'species':
      return HOUSE.species;
    case 'tag':
      return HOUSE.tag;
    case 'move':
      return HOUSE.slate;
    case 'keyword': {
      const kw = KEYWORD_BY_KEY.get(text.toLowerCase().replace(/\s+/g, ''));
      return kw?.group === 'special' || kw?.group === 'size' ? HOUSE.special : HOUSE.slate;
    }
    default:
      return HOUSE.custom;
  }
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

const NAVY = '#1d2742';

/** Navy or white, whichever reads better on the ink. */
export function inkText(hex: string): string {
  const l = luminance(hex);
  const onWhite = 1.05 / (l + 0.05);
  const onNavy = (l + 0.05) / (luminance(NAVY) + 0.05);
  return onNavy >= onWhite ? NAVY : '#ffffff';
}

/** A stable tilt per stamp, so stamps look hand-placed but never jump around. */
export function tilt(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 7) - 3) * 0.6;
}
