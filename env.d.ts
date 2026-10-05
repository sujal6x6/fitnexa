// Minimal Cloudflare binding types (we avoid @cloudflare/workers-types globals because they change the browser `Response` typings).
interface D1Result<T = unknown> { results: T[]; success: boolean; meta: { changes?: number; last_row_id?: number; [k: string]: unknown } }
interface D1PreparedStatement { bind(...values: unknown[]): D1PreparedStatement; all<T = unknown>(): Promise<D1Result<T>>; first<T = unknown>(): Promise<T | null>; run(): Promise<D1Result> }
interface D1Database { prepare(query: string): D1PreparedStatement; batch(statements: D1PreparedStatement[]): Promise<D1Result[]> }
interface CloudflareEnv { DB: D1Database }
