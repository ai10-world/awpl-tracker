/** @type {import('next').NextConfig} */
const appHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL).host
      : null;
  } catch {
    return null;
  }
})();

const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "awpl-tracker-theta.vercel.app",
        appHost,
      ].filter(Boolean),
    },
  },
};

module.exports = nextConfig;
