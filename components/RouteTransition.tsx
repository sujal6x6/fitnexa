'use client';
import { usePathname } from 'next/navigation';

export default function RouteTransition({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const path = usePathname();
  return <div key={path} className={`route-shell ${className}`.trim()}>{children}</div>;
}
