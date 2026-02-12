/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"], // your existing Google profile images domain
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
