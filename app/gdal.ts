import initGdalJs from "gdal3.js";

const Gdal = initGdalJs();

export function getGdalJs() {
  return Gdal;
}
