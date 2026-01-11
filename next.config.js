
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['page.tsx', 'page.ts', 'route.ts'],
  images: {
    domains: ['lh3.googleusercontent.com', 'res.cloudinary.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  env: {
    // Ensure API_KEY is available in the client-side bundle
    API_KEY: process.env.API_KEY,
  },
};

module.exports = nextConfig;
