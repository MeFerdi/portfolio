/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
