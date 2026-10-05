// Info pages. Policies are intentionally placeholders: legal text must come from Kesari Traders / their advisor.
const TBD = 'This policy will be published by Kesari Traders before launch. Please add the final text here (or move it into the admin content manager in phase 3).';
export const PAGES: Record<string, { title: string; body: string[] }> = {
  about: { title: 'About Fitnexa', body: [
    'Fitnexa is a fitness equipment brand dedicated to making fitness accessible and affordable for every household.',
    'We offer unique, premium-quality fitness products at very reasonable and competitive prices, with a strong focus on products designed for domestic and home use.',
    'Our aim is simple — "Fitness for Every Home." We believe that everyone should have the opportunity to stay fit and healthy without having to spend excessively on fitness equipment.',
    'Our Mission: To make quality fitness equipment affordable and accessible to as many people as possible.',
    'Our Vision: "Har Ghar Fitness."' ] },
  'business-model': { title: 'Our Business Model', body: [
    'FITNEXA is operated by KESARI TRADERS.',
    'We import selected fitness equipment and also work with trusted manufacturing partners to produce products according to our requirements and specifications. These products are marketed and sold under the FITNEXA brand.',
    'Our focus: product selection, quality standards, design, pricing and customer experience.' ] },
  delivery: { title: 'Pan-India Delivery', body: [
    'FITNEXA delivers fitness equipment across India from our warehouse in Etawah, Uttar Pradesh.',
    'Availability and delivery charges may vary by product and location.' ] },
  warranty: { title: 'Warranty & After-Sales', body: [
    'Warranty coverage varies by machine and model. The applicable warranty period and terms will be provided with each product.' ] },
  installation: { title: 'Installation & Service', body: [
    'Video-call installation assistance is available free of cost.',
    'Doorstep installation and service are available at additional charges depending on location and product.' ] },
  contact: { title: 'Contact', body: [] },
  privacy: { title: 'Privacy Policy', body: [TBD] },
  terms: { title: 'Terms & Conditions', body: [TBD] },
  shipping: { title: 'Shipping Policy', body: [TBD] },
  refund: { title: 'Refund / Cancellation Policy', body: [TBD] },
};
