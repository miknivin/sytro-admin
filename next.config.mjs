/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "kids-bags.s3.eu-north-1.amazonaws.com",
    ],
  },

  // Optional but recommended safety net (especially if you see webpack-related warnings)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark these as externals so webpack doesn't try to bundle the huge binaries
      config.externals.push("puppeteer-core", "@sparticuz/chromium");
    }
    return config;
  },
};

export default nextConfig;
