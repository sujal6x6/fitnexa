import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FITNEXA',
    short_name: 'FITNEXA',
    description: 'Premium home fitness equipment with free Pan-India delivery.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0c0c0c',
    theme_color: '#0c0c0c',
    icons: [
      { src: '/brand/logo.webp', sizes: '512x512', type: 'image/webp' },
      { src: '/brand/header-logo.png', sizes: '153x69', type: 'image/png' },
    ],
  };
}
