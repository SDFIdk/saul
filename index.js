// Import/export modules with their public methods

export {
  postSTAC,
  getSTAC,
  getDHM,
  get,
  post
} from './modules/api.js'

export {
  epsg25832proj,
  createTranslator
} from './modules/projection.js'

export {
  getElevation,
  visualizeGeotiff,
  getZ,
  getTerrainGeoTIFF,
  getDenmarkGeoTiff
} from './modules/elevation.js'

export {
  getTotalBbox,
  image2world,
  world2image, // Deprecated. Use getImageXY
  getWorldXYZ,
  getImageXY,
  iterate // Deprecated. Use getWorldXYZ
} from './modules/image.js'
