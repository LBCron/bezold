/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Load the GA4 client from node_modules instead of bundling it. Minifying
    // it renames protobufjs' Long class, and the request encoder checks
    // `constructor.name === "Long"`, so every int64 field (e.g. `limit`)
    // fails to serialize in production builds.
    serverComponentsExternalPackages: ["@google-analytics/data"],
    // The sitemap revalidates hourly, so Vercel regenerates it inside a
    // serverless function. File tracing doesn't follow lib/blog.ts's fs reads
    // from the sitemap route (the blog pages trace them fine), so without this
    // the regenerated sitemap finds no content/blog folder and lists 0 posts.
    outputFileTracingIncludes: {
      "/sitemap.xml": ["./content/blog/**/*"],
    },
  },
  images: {
    // Bypass Vercel's Image Optimization (was returning 402
    // OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED once the quota was hit).
    // Images are served directly from Firebase Storage / googleapis.com.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
    minimumCacheTTL: 1500000, // * TODO: need more knowledge about this setting
  },
};

module.exports = nextConfig;
