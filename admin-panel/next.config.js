/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'https://jhhhhhhggre.onrender.com',
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'https://jhhhhhhggre.onrender.com',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'JuniorAdmon123'
  }
}

module.exports = nextConfig