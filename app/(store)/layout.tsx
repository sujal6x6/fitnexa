import { CartProvider } from '@/components/CartProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RouteTransition from '@/components/RouteTransition';
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider><Header /><main><RouteTransition>{children}</RouteTransition></main><Footer /></CartProvider>;
}
