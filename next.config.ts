import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/calendar",
        destination: "/kalender",
        permanent: true,
      },
      {
        source: "/notifications",
        destination: "/notifikasi",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

