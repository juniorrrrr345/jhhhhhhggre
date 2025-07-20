/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ]
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
  }
}

module.exports = nextConfig