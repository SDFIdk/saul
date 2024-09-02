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
 * @param {object} geoTiff - GeoTiff data output from getTerrainGeoTIFF() or getDenmarkGeoTiff() method
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

/** Creates an ASCII visualization of a GeoTiff with elevation data. Useful for display in a terminal.
 * NOTE: You may want to downsmaple the GeoTiff to fit within your terminal window. A GeoTiff pixel is represented by 3 characters each.
 * @param {object} gTiff - GeoTiff data output from getTerrainGeoTIFF() or getDenmarkGeoTiff() method
 */
async function visualizeGeotiff(gTiff) {
  console.log('--- GTIFF visualization ---')
  //console.log(gTiff, gTiff.getHeight(), gTiff.getWidth())
  const float32Arr = await gTiff.readRasters()
  const tiffWidth = gTiff.getWidth()
  const rasters = float32Arr[0]
  let lines = []
  let line = ''
  for (let i = 0; i < rasters.length; i++) {
    if (i % tiffWidth === 0) {
      lines.push(line)
      line = ''
    }
    line += zeroPadNumber(rasters[i])
  }
  for (const l of lines) {
    console.log(l)
  }
}

function zeroPadNumber(input) {
  if (input === 0) {
      return "..."
  } else if (input < 0) {
      return `0${input.toFixed(0)}`
  } else if (input < 10) {
      return `00${Math.floor(input)}`
  } else if (input < 100) {
      return `0${Math.floor(input)}`
  } else {
      return `${Math.floor(input)}`
  }
}

export {
  getElevation,
  visualizeGeotiff
}
