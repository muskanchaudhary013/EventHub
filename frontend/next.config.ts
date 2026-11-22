import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["firebase", "@firebase/app", "@firebase/auth", "@firebase/firestore", "@firebase/analytics"],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
