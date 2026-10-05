import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev(); // lets `next dev` use a local D1 database

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true }, // Next's image optimiser isn't free on Cloudflare; our images are pre-sized WebP / Cloudinary
  poweredByHeader: false,
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ] }];
  },
};
export default nextConfig;
