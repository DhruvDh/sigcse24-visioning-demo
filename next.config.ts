/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only apply these settings in production build
  ...(process.env.NODE_ENV === "production"
    ? {
        output: "export",
        basePath: "/sigcse24-visioning-demo",
        assetPrefix: "/sigcse24-visioning-demo",
      }
    : {}),
  images: {
    unoptimized: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ This will allow production builds to successfully complete even with TS errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
