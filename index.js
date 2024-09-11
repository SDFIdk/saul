// Import/export modules with their public methods

export {
  image2world,
  world2image, // Deprecated. Use getImageXY
  getWorldXYZ,
  getImageXY,
  getZ,
  iterate // Deprecated. Use getWorldXYZ
} from './modules/saul-core.js'

export {
  postSTAC,
  getSTAC,
  getDHM,
  getTerrainGeoTIFF,
  getDenmarkGeoTiff,
  get,
  post
} from './modules/api.js'

export {
  epsg25832proj,
  createTranslator
} from './modules/saul-projection.js'

export {
  getElevation,
  visualizeGeotiff
} from './modules/saul-elevation.js'
