// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other configurations like experimental, env, etc.
  images: {
    // Allow images from fakestoreapi.com
    remotePatterns: [
      {
        protocol: "https", // FakeStoreAPI uses HTTPS
        hostname: "fakestoreapi.com",
        port: "", // Leave empty for default ports (80 for http, 443 for https)
        pathname: "/img/**", // Allow all paths under /img/
      },
      // Add patterns for other domains if needed in the future
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   port: '',
      //   pathname: '/somepath/**',
      // },
    ],
  },
};

module.exports = nextConfig;
