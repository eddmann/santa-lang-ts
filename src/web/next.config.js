const withTM = require('next-transpile-modules')(['santa-lang']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  assetPrefix: process.env.NODE_ENV === 'production' ? '/santa-lang-prancer/' : undefined,
};

module.exports = withTM(nextConfig);
