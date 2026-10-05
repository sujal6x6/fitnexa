import { ORDER_STEPS, statusLabel } from '@/lib/format';
export default function Timeline({ status }: { status: string }) {
  if (status === 'cancelled' || status === 'refunded') return <p className="err">Order {statusLabel(status)}</p>;
  if (status === 'pending' || status === 'payment_processing') return <p>Awaiting payment confirmation</p>;
  const at = ORDER_STEPS.indexOf(status as (typeof ORDER_STEPS)[number]);
  return <ol className="tl">{ORDER_STEPS.map((s, i) => <li key={s} className={i <= at ? 'done' : ''}>{statusLabel(s)}</li>)}</ol>;
}
