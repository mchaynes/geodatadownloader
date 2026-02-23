import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteStaticCopy({
    targets: [
      {
        src: "node_modules/gdal3.js/dist/package/gdal3.js",
        dest: ".",
      },
      {
        src: "node_modules/gdal3.js/dist/package/gdal3WebAssembly.data",
        dest: ".",
      },
      // gdal3WebAssembly.wasm (~27 MiB) exceeds Cloudflare Pages' 25 MiB limit;
      // it is served from jsDelivr CDN instead (see app/gdal.ts).
    ],
  }),
  ...(process.env.SENTRY_AUTH_TOKEN ? [sentryVitePlugin({
    org: "geodatadownloader",
    project: "geodatadownloader",
    include: "./dist",
  })] : [])],

  build: {
    sourcemap: true
  }
});
