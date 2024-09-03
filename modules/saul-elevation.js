/**  Maps a coordinate from the one coordinate system to another  */
function convertCoordinate(coord, bbox1, bbox2) {
  
  // Extract the coordinates from the bounding boxes
  const [x1_min, y1_min, x1_max, y1_max] = bbox1
  const [x2_min, y2_min, x2_max, y2_max] = bbox2

  // Extract the coordinate to convert
  const [x1, y1] = coord

  // Calculate the width and height of both bounding boxes
  const width1 = x1_max - x1_min
  const height1 = y1_max - y1_min
  const width2 = x2_max - x2_min
  const height2 = y2_max - y2_min

  // Calculate the relative position in the first coordinate system
  const x_relative = (x1 - x1_min) / width1
  const y_relative = (y1 - y1_min) / height1

  console.log('ratios', (x_relative * width2), (y_relative * height2), x2_min, y2_min)

  // Calculate the new position in the second coordinate system
  const x2 = x2_min + Math.abs(x_relative * width2);
  const y2 = y2_min + Math.abs(y_relative * height2);

  return [x2, y2];
}

/** Calculates nearest elevation for given coordinate using geoTIFF terrain data
 * Heavily inspired by https://towardsdatascience.com/geotiff-coordinate-querying-with-javascript-5e6caaaf88cf
 * @param {number} x - EPSG:25832 X coordinate
 * @param {number} y - EPSG:25832 Y coordinate
 * @param {object} geoTiff - GeoTiff data output from getTerrainGeoTIFF() or getDenmarkGeoTiff() method
 * @returns {number} Elevation in meters 
 */
async function getElevation(x, y, geoTiff) {

  const bbox = geoTiff.getBoundingBox()
  const height = geoTiff.getHeight()
  const width = geoTiff.getWidth()

  // Convert lat/lon to geotiff x/y
  const [xPx, yPx] = convertCoordinate([x,y], bbox, [0,0, width, height])

  // Fetch window of values around x/y

  // Interpolate elevation value of x/y in relation to window values

  const window = [ xPx, yPx, xPx + 1, yPx + 1 ]
  const elevation_data = await geoTiff.readRasters({
    window: window,
    fillValue: 0
  })

  return elevation_data[0][0]
}

/** Creates an ASCII visualization of a terrain GeoTiff. Useful for display in a terminal.
 * NOTE: You may want to use a downsmapled GeoTiff to fit within your terminal window. A GeoTiff pixel is represented by 3 characters each.
 * @param {object} gTiff - GeoTiff output from getTerrainGeoTIFF() or getDenmarkGeoTiff() method
 */
async function visualizeGeotiff(gTiff) {
  console.log('--- GTIFF visualization ---')
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
