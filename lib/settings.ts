import { cache } from 'react';
import { all, parseJson } from './db';
import { DEFAULTS } from './settings-schema';

export type Settings = Record<string, any>;
/** Admin-edited settings merged over safe defaults. Never throws: if the DB is unreachable the defaults are used. */
export const getSettings = cache(async (): Promise<Settings> => {
  const raw: Record<string, any> = {};
  try { for (const r of await all<{ key: string; value: string }>('SELECT key, value FROM site_settings')) raw[r.key] = parseJson(r.value, {}); } catch {}
  const out: Settings = {};
  for (const k of Object.keys(DEFAULTS)) out[k] = { ...DEFAULTS[k], ...(raw[k] ?? {}) };
  return out;
});
