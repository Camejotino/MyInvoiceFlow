/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  distDir: 'out',

  compiler: {
    // Elimina todos los console.* en producción, excepto los errores
    removeConsole: isProd ? { exclude: ['error'] } : false,
  },
  // 🛠️ FIX: Solo usamos ruta relativa en producción (para Electron)
  // En desarrollo (localhost), debe ser vacío para que el HMR funcione.
  assetPrefix: isProd ? './' : undefined,

  // 🛠️ OPCIONAL: Si sigues teniendo problemas de hidratación en Electron, 
  // esto asegura que las rutas se manejen correctamente.
  trailingSlash: true,

  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;