import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/gdal3.js/dist/package/gdal3.js",
          dest: ".",
        },
        {
          src: "node_modules/gdal3.js/dist/package/gdal3WebAssembly.data",
          dest: ".",
        },
        {
          src: "node_modules/gdal3.js/dist/package/gdal3WebAssembly.wasm",
          dest: ".",
        },
      ],
    }),
  ],
});
