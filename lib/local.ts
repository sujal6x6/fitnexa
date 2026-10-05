// Customer data lives ONLY in the customer's browser (localStorage): no accounts, no passwords.
export type Profile = { name: string; phone: string; email: string; line1: string; line2: string; city: string; state: string; pincode: string };
export const EMPTY_PROFILE: Profile = { name: '', phone: '', email: '', line1: '', line2: '', city: '', state: '', pincode: '' };
export type SavedOrder = { n: string; k: string; at: string; total: number }; // order number + secret access token
const get = <T,>(key: string, fallback: T): T => { try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; } };
const set = (key: string, v: unknown) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} };
export const loadProfile = (): Profile | null => { const p = get<Partial<Profile> | null>('fx_profile', null); return p ? { ...EMPTY_PROFILE, ...p } : null; };
export const saveProfile = (p: Profile) => set('fx_profile', p);
export const clearProfile = () => { try { localStorage.removeItem('fx_profile'); } catch {} };
export const loadOrders = (): SavedOrder[] => get<SavedOrder[]>('fx_orders', []);
export const addOrder = (o: SavedOrder) => set('fx_orders', [o, ...loadOrders().filter((x) => x.n !== o.n)].slice(0, 20));
export const clearOrders = () => { try { localStorage.removeItem('fx_orders'); } catch {} };
