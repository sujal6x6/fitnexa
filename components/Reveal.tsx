'use client';
import { useEffect, useRef } from 'react';
export default function Reveal({ children, className }: { children: React.ReactNode; className: string }) {
  const r = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = r.current!; const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in'); o.disconnect(); } }, { threshold: 0.3 }); o.observe(el); return () => o.disconnect(); }, []);
  return <div ref={r} className={className}>{children}</div>;
}
