/**  
 * Maps a coordinate from the one coordinate system to another based on GeoTiff image dimensions.
 * @param {Array} coord - EPSG:25832 X,Y coordinate pair
 * @param {Array} bbox - Bounding box within input coordinate systtem. Consists of 2 EPSG:25832 coordinate pairs. Example: [x1,y1,x2,y2]
 * @param {Array} imageDimensions - Width and height of a GeoTiff image. This will set the bounding box of the output coordinate system. Note: This coordinate system will have 0,0 set in the top right position of the image.
 */
function convertCoordinate(coord, bbox1, imageDimensions) {
  
  // Extract the coordinates from the bounding boxes
  const [x1_min, y1_min, x1_max, y1_max] = bbox1

  // Extract the coordinate to convert
  const [x1, y1] = coord

  // Calculate the width and height of both bounding boxes
  const width1 = x1_max - x1_min
  const height1 = y1_max - y1_min
  const width2 = imageDimensions[0]
  const height2 = imageDimensions[1]

  // Calculate the relative position in the first coordinate system
  const x_relative = (x1 - x1_min) / width1
  const y_relative = (y1 - y1_min) / height1

  // Calculate the new position in the second coordinate system
  const x2 = Math.abs(x_relative * width2)
  const y2 = height2 - Math.abs(y_relative * height2)

  return [x2, y2]
}

/** 
 * Calculates nearest elevation for given coordinate using geoTIFF terrain data
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
  const [xPx, yPx] = convertCoordinate([x,y], bbox, [width, height])
 
  // Fetch window of raster values around x/y
  const window = [
    Math.floor(xPx), 
    Math.floor(yPx),
    Math.ceil(xPx),
    Math.ceil(yPx)
  ]
  
  // Fetch elevation value from geoTiff rasters
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

/** Converts numbers to strings in a 3-letter format. Ex. `002`, `0-3` (for negative numbers), or `123` */
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
