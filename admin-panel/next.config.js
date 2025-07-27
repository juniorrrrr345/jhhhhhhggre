/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'https://telegram-bot-vip.onrender.com',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || 'https://telegram-bot-vip.onrender.com',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1'
  },
  images: {
    domains: [
      'postimg.cc',
      'i.postimg.cc',
      'imgur.com',
      'i.imgur.com',
      'example.com',
      'localhost',
      'api.telegram.org',
      'telegram-bot-vip.onrender.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ]
  }
}

module.exports = nextConfig