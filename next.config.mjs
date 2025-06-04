import path from "path";
import { fileURLToPath } from "url";

// Em módulos ESM, __dirname não existe. Convertendo:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilitar React Strict Mode (causa dupla inicialização com WalletConnect)
  reactStrictMode: false,
  
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Stub módulos Node para o browser
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
        pino: false,
        "pino-pretty": false
      };

      // Redireciona qualquer import de rxjs para a versão única instalada na raiz
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        rxjs: path.resolve(__dirname, "node_modules/rxjs"),
        "rxjs/dist/cjs/operators/index.js": path.resolve(
          __dirname,
          "node_modules/rxjs/dist/cjs/operators/index.js"
        )
      };
    }
    return config;
  },
  transpilePackages: []
};

export default nextConfig;