/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverBuildPath: "functions/[[path]].js",
  buildDirectory: "build/client",
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
    v3_lazyRouteDiscovery: true,
  },
  // Cloudflare Pages specific configuration
  cloudflare: {
    buildOutputDirectory: "build/client",
    functionsDirectory: "functions",
  },
  // Ensure correct path aliases
  alias: {
    "~": "./app",
  },
};