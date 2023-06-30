import initGdalJs from "gdal3.js";

const Gdal = initGdalJs({ path: "/" });

export function getGdalJs() {
  return Gdal;
}
