/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  distDir: 'out',
  // En Electron siempre usamos ruta relativa
  assetPrefix: './',
  // Configuración para TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
