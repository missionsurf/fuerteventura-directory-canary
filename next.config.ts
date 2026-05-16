import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-libsql",
    "@libsql/client",
  ],

  // Force @libsql/client to its explicit Node.js entry point.
  // Without this, Turbopack resolves the ESM import under the
  // "edge-light" condition → web.js, which rejects remote URLs.
  turbopack: {
    resolveAlias: {
      "@libsql/client": "@libsql/client/node",
    },
  },

  webpack(config, { isServer }) {
    if (isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias as Record<string, string>),
        "@libsql/client": require.resolve("@libsql/client/node"),
      }
    }
    return config
  },
}

export default withNextIntl(nextConfig)
