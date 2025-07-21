/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'https://jhhhhhhggre.onrender.com',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || 'https://jhhhhhhggre.onrender.com',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'JuniorAdmon123'
  },
  images: {
    domains: [
      'postimg.cc',
      'i.postimg.cc',
      'imgur.com',
      'i.imgur.com',
      'example.com',
      'localhost'
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