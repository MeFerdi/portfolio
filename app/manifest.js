export default function manifest() {
  return {
    name: 'Ferdynand Odhiambo Portfolio',
    short_name: 'Ferdynand',
    description: 'Portfolio showcasing backend, web, and product work.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#1d4ed8',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
  };
}
