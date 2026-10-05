import Link from 'next/link';
export const metadata = { title: 'Payment failed', robots: { index: false } };
export default async function Failed(props: { searchParams: Promise<{ n?: string }> }) {
  const searchParams = await props.searchParams;
  return <div className="page"><div className="wrap prose"><h1 className="d">Payment failed</h1>
    <p>We couldn&apos;t complete your payment{searchParams.n ? ` for order ${searchParams.n}` : ''}. If money was deducted, it is automatically refunded by your bank/Razorpay, or the order will update once Razorpay confirms it.</p>
    <p style={{ marginBottom: 20 }}>Your cart is still saved.</p><Link className="btn" href="/cart">TRY AGAIN</Link></div></div>;
}
