export const inr = (paise: number) => '₹' + (paise / 100).toLocaleString('en-IN');
export const normalisePhone = (p: string) => p.replace(/[\s-]/g, '').replace(/^(\+91|91)(?=\d{10}$)/, '');
export const ORDER_STEPS = ['paid', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'] as const;
export const statusLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
