import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
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
