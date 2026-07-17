import { pinyin } from 'pinyin-pro';

/**
 * Convert a Chinese name into a URL-safe slug (pinyin).
 *  - lowercase, no tones, no spaces
 *  - ü -> v  (吕行 -> lvxing), matching common input-method convention
 *  - any other non-ASCII stripped defensively
 */
export function slugFromName(name: string): string {
  return pinyin(name, { toneType: 'none', type: 'array' })
    .join('')
    .toLowerCase()
    .replace(/ü/g, 'v')
    .replace(/[^a-z]/g, '');
}
