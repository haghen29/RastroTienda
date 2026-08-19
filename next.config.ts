import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "dcdn-us.mitiendanube.com" },
      { protocol: "https", hostname: "d26lpennugtm8s.cloudfront.net" },
    ],
  },
};

export default nextConfig;
