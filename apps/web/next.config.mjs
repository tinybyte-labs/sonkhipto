import { withContentlayer } from "next-contentlayer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [
      "cheerio",
      "rss-parser",
      "puppeteer-core",
      "@sparticuz/chromium",
    ],
  },
  transpilePackages: ["@acme/trpc", "@acme/atuh", "@acme/db"],
};

export default withContentlayer(nextConfig);
