'use client';
import { useMemo, useState } from 'react';

type Props = {
  orders: {
    low_stock_threshold: number;
    enable_whatsapp_pay: boolean;
    enable_cod: boolean;
    enable_razorpay: boolean;
  };
  contact: Record<string, string>;
  shipping: { flat_paise: number; free_above_paise: number };
};

export default function CheckoutProcessEditor({ orders, contact, shipping }: Props) {
  const [whatsapp, setWhatsapp] = useState(!!orders.enable_whatsapp_pay);
  const [cod, setCod] = useState(!!orders.enable_cod);
  const [razorpay, setRazorpay] = useState(!!orders.enable_razorpay);
  const [phone, setPhone] = useState(contact.whatsapp || contact.phone_order || '');
  const [flat, setFlat] = useState(String((shipping.flat_paise ?? 0) / 100));
  const [freeAbove, setFreeAbove] = useState(String((shipping.free_above_paise ?? 0) / 100));
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const enabledCount = Number(whatsapp) + Number(cod) + Number(razorpay);
  const methods = useMemo(() => [
    whatsapp && { title: 'Pay directly on WhatsApp', text: 'Order is created, then customer opens WhatsApp with order details.' },
    cod && { title: 'Cash on Delivery', text: 'Order is created as confirmed and payment is collected later.' },
    razorpay && { title: 'UPI / Card online payment', text: 'Customer pays through Razorpay before final confirmation.' },
  ].filter(Boolean) as { title: string; text: string }[], [whatsapp, cod, razorpay]);

  async function save() {
    setBusy(true); setMsg('Saving checkout process...');
    const ordersBody = { ...orders, enable_whatsapp_pay: whatsapp, enable_cod: cod, enable_razorpay: razorpay };
    const contactBody = { ...contact, whatsapp: phone, phone_order: contact.phone_order || phone };
    const shippingBody = { flat_paise: Math.round((parseFloat(flat) || 0) * 100), free_above_paise: Math.round((parseFloat(freeAbove) || 0) * 100) };
    const calls = [
      fetch('/api/admin/settings/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ordersBody) }),
      fetch('/api/admin/settings/contact', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contactBody) }),
      fetch('/api/admin/settings/shipping', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(shippingBody) }),
    ];
    const res = await Promise.all(calls);
    setBusy(false);
    if (res.every((r) => r.ok)) setMsg('Saved. Checkout is updated on the live store.');
    else {
      const text = await Promise.all(res.filter((r) => !r.ok).map((r) => r.text()));
      setMsg(text.join(' ') || 'Could not save checkout settings.');
    }
  }

  return <div className="checkout-admin">
    <section className="checkout-hero-panel">
      <div>
        <span className="eyebrow">Order process</span>
        <h1>Checkout controls</h1>
        <p>Turn payment methods on or off instantly. Customers will only see the active options at checkout.</p>
      </div>
      <div className="checkout-live-card">
        <small>Live methods</small>
        <b>{enabledCount || 0}</b>
        <span>{enabledCount ? 'available to customers' : 'no payment method enabled'}</span>
      </div>
    </section>

    <section className="panel checkout-switchboard">
      <h2>Payment methods shown on checkout</h2>
      <div className="method-grid">
        <button type="button" className={whatsapp ? 'method-card on' : 'method-card'} onClick={() => setWhatsapp((v) => !v)}>
          <strong>Pay on WhatsApp</strong><span>{whatsapp ? 'Enabled' : 'Disabled'}</span><small>Best for manual payment follow-up.</small>
        </button>
        <button type="button" className={cod ? 'method-card on' : 'method-card'} onClick={() => setCod((v) => !v)}>
          <strong>COD</strong><span>{cod ? 'Enabled' : 'Disabled'}</span><small>Customer pays after delivery.</small>
        </button>
        <button type="button" className={razorpay ? 'method-card on' : 'method-card'} onClick={() => setRazorpay((v) => !v)}>
          <strong>Razorpay / UPI</strong><span>{razorpay ? 'Enabled' : 'Disabled'}</span><small>UPI, card, netbanking via Razorpay.</small>
        </button>
      </div>
      {!enabledCount && <p className="bad">Enable at least one method before customers place orders.</p>}
    </section>

    <section className="checkout-columns">
      <div className="panel">
        <h2>Checkout details</h2>
        <label>WhatsApp order number<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="91XXXXXXXXXX" /></label>
        <div className="g2">
          <label>Delivery charge (₹)<input type="number" min="0" step="0.01" value={flat} onChange={(e) => setFlat(e.target.value)} /></label>
          <label>Free delivery above (₹)<input type="number" min="0" step="0.01" value={freeAbove} onChange={(e) => setFreeAbove(e.target.value)} /></label>
        </div>
        <button className="p" disabled={busy || !enabledCount} onClick={save}>{busy ? 'Saving...' : 'Save checkout process'}</button>
        {msg && <p className={msg.startsWith('Saved') ? 'good' : 'bad'}>{msg}</p>}
      </div>

      <div className="panel checkout-preview">
        <h2>Customer checkout preview</h2>
        <div className="preview-box">
          <label>Name<input readOnly value="Customer name" /></label>
          <label>Address<input readOnly value="House number, city, pincode" /></label>
          <div className="pay-methods">
            {methods.map((m, i) => <label key={m.title}><input readOnly type="radio" checked={i === 0} /> <span><b>{m.title}</b><small>{m.text}</small></span></label>)}
            {!methods.length && <p className="bad">No payment method will appear.</p>}
          </div>
        </div>
      </div>
    </section>
  </div>;
}
