import { getCloudflareContext } from '@opennextjs/cloudflare';

// Cloudflare D1 helpers. The database is only reachable through the Worker binding (no public endpoint).
const d1 = (): D1Database => getCloudflareContext().env.DB;
export async function all<T = any>(sql: string, ...p: unknown[]): Promise<T[]> { return (await d1().prepare(sql).bind(...p).all<T>()).results; }
export async function first<T = any>(sql: string, ...p: unknown[]): Promise<T | null> { return (await d1().prepare(sql).bind(...p).first<T>()) ?? null; }
export async function run(sql: string, ...p: unknown[]) { return (await d1().prepare(sql).bind(...p).run()).meta; }
/** Runs all statements in ONE transaction: either every statement applies or none does. */
export async function batch(stmts: [string, unknown[]][]) { const db = d1(); return db.batch(stmts.map(([s, p]) => db.prepare(s).bind(...p))); }
export const uuid = () => crypto.randomUUID();
export const nowIso = () => new Date().toISOString();
export const inList = (n: number) => Array(n).fill('?').join(',');
export const parseJson = <T>(v: unknown, fallback: T): T => { try { return typeof v === 'string' ? (JSON.parse(v) as T) : ((v as T) ?? fallback); } catch { return fallback; } };
