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
      "puppeteer-core",
      "chrome-aws-lambda",
    ],
  },
  transpilePackages: ["@acme/trpc", "@acme/atuh", "@acme/db"],
};

export default withContentlayer(nextConfig);
