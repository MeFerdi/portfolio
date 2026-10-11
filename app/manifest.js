export default function manifest() {
  return {
    name: 'Ferdynand Odhiambo Portfolio',
    short_name: 'Ferdynand',
    description: 'Portfolio of Ferdynand Odhiambo, AI-native product engineer.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1f3a5f',
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
