import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Optimisations de production
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  generateEtags: true,
  compress: true,

  // Sécurité headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Turbopack disabled due to API route issues
  // turbopack: {
  //   root: process.cwd(),
  // },

  // Optimisations d'image
  images: {
    formats: ["image/webp", "image/avif"],
  },

  // Suppression des commentaires en production
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.minimize = true;
    }
    return config;
  },
};

export default nextConfig;
