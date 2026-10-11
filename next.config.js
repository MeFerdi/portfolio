/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // Images and icons in /public are not content-hashed: cache for a week and
  // revalidate in the background. /_next/static is already cached immutably by Next.
  async headers() {
    return [
      {
        source: '/:file*.(jpg|png|svg|webmanifest)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache' }],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'employa.pages.dev',
      },
      {
        protocol: 'https',
        hostname: 'depesa.pages.dev',
      },
      {
        protocol: 'https',
        hostname: 'provd.pages.dev',
      },
    ],
  },
}

module.exports = nextConfig
