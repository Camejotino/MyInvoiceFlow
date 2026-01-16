/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  distDir: 'out_next',
  assetPrefix: isProd ? './' : undefined,
};

export default nextConfig;
