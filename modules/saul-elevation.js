import { getTerrainGeoTIFF } from './api.js'


/** Constrain coordinates to be within a bounding box */
function constrainToBbox(bbox, x, y) {
  let new_x = x
  let new_y = y
  if (x < bbox[0]) {
    new_x = bbox[0] + 1
  } else if (bbox[2] < x) {
    new_x = bbox[2] - 1
  }
  if (y < bbox[1]) {
    new_y = bbox[1] + 1
  } else if (bbox[3] < y) {
    new_y = bbox[3] - 1
  }
  return [new_x, new_y]
}

/** Calculates nearest elevation for given coordinate using geoTIFF terrain data
 * Heavily inspired by https://towardsdatascience.com/geotiff-coordinate-querying-with-javascript-5e6caaaf88cf
 * @param {number} x - EPSG:25832 X coordinate
 * @param {number} y - EPSG:25832 Y coordinate
 * @param {object} geoTiff - GeoTiff data output from getTerrainGeoTIFF() method
 * @returns {number} Elevation in meters 
 */
async function getElevation(lat, lon, geoTiff) {

  const bbox = geoTiff.getBoundingBox()
  const height = geoTiff.getHeight()
  const width = geoTiff.getWidth()
  const bboxWidth = bbox[2] - bbox[0]
  const bboxHeight = bbox[3] - bbox[1]

  const [x,y] = constrainToBbox(bbox, lat, lon)

  const widthPct = ( x - bbox[0] ) / bboxWidth
  const heightPct = ( y - bbox[1] ) / bboxHeight
  const xPx = Math.floor( width * widthPct )
  const yPx = Math.floor( height * ( 1 - heightPct ) )

  const window = [ xPx, yPx, xPx + 1, yPx + 1 ]
  const elevation_data = await geoTiff.readRasters({
    window: window, 
    fillValue: 0
  })

  return Math.round(elevation_data[0][0])
}

export {
  getTerrainGeoTIFF,
  getElevation
}
