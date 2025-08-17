import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['drive.google.com', 'photos.google.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/file/**',
        search: '',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['zvuchi-vocal.ru', 'localhost:3000'], 
    }
  }
};

export default nextConfig;
