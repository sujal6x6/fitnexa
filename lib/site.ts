// Phase 3 moves these into the admin-editable site_settings table.
export const SITE = {
  name: 'FITNEXA', tagline: 'Har Ghar Fitness', firm: 'KESARI TRADERS',
  phones: { order: '+91 63974 97386', service: '+91 75994 44073', help: '+91 78955 95323' },
  hours: 'Monday – Saturday, 10:30 AM – 6:00 PM',
  address: 'Ground Floor, 257, MS Villa, Gali No. 1, Near Central Bank of India, Ashok Nagar, Yashoda Nagar, Etawah, Uttar Pradesh – 206001, India.',
  gstin: '09ACYPP8061A2Z4', instagram: 'https://www.instagram.com/kesari_fitzone/',
  url: process.env.SITE_URL || 'http://localhost:3000',
};
export const tel = (p: string) => 'tel:' + p.replace(/\s/g, '');
