/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverBuildPath: "functions/[[path]].js",
  buildDirectory: "build/client",
  serverModuleFormat: "esm",
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
    v3_lazyRouteDiscovery: true,
  },
  cloudflare: {
    buildOutputDirectory: "build/client",
    functionsDirectory: "functions",
  },
  routes: async (defineRoutes) => {
    return defineRoutes((route) => {
      route("/", "routes/_index.tsx");
    });
  },
};