'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
export type CartItem = { productId: string; qty: number };
type Ctx = { items: CartItem[]; count: number; ready: boolean; add: (id: string, qty?: number) => void; setQty: (id: string, qty: number) => void; remove: (id: string) => void; replace: (items: CartItem[]) => void; clear: () => void };
const C = createContext<Ctx>(null as unknown as Ctx);
export const useCart = () => useContext(C);
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem('fx_cart') || '[]')); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) try { localStorage.setItem('fx_cart', JSON.stringify(items)); } catch {} }, [items, ready]);
  const add = useCallback((id: string, qty = 1) => setItems((s) => s.some((i) => i.productId === id) ? s.map((i) => i.productId === id ? { ...i, qty: Math.min(i.qty + qty, 20) } : i) : [...s, { productId: id, qty }]), []);
  const setQty = useCallback((id: string, qty: number) => setItems((s) => qty < 1 ? s.filter((i) => i.productId !== id) : s.map((i) => i.productId === id ? { ...i, qty: Math.min(qty, 20) } : i)), []);
  const remove = useCallback((id: string) => setItems((s) => s.filter((i) => i.productId !== id)), []);
  return <C.Provider value={{ items, count: items.reduce((a, i) => a + i.qty, 0), ready, add, setQty, remove, replace: setItems, clear: () => setItems([]) }}>{children}</C.Provider>;
}
