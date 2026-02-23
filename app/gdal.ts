import initGdalJs from "gdal3.js";

const Gdal = initGdalJs({
  paths: {
    js:   "/gdal3.js",
    data: "/gdal3WebAssembly.data",
    wasm: "https://cdn.jsdelivr.net/npm/gdal3.js@2.8.1/dist/package/gdal3WebAssembly.wasm",
  },
});

export function getGdalJs() {
  return Gdal;
}
