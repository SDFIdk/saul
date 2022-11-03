import { fromArrayBuffer } from 'geotiff'
import { get } from './api.js'

/** Fetches a GeoTIFF with elevation data matching the bounding box of a STAC API item (image)
 * @param {object} stac_item - STAC API item from a featureCollection request
 * @param {{API_DHM_WCS_BASEURL: string, API_DHM_USERNAME: string, API_DHM_PASSWORD: string}} auth - API autentication data. See ../config.js.example for reference.
 * @param {number} [fidelity] - Resolution fidelity. Higher number means more pixels and better precision. Between 1 and 0.01.
 * @returns {object} GeoTiff data
 */
function getTerrainGeoTIFF(stac_item, auth, fidelity = 0.05) {
  
  const bbox = stac_item.bbox
  const width = Math.round( stac_item.properties['proj:shape'][0] * fidelity )
  const height = Math.round( stac_item.properties['proj:shape'][1] * fidelity )

  // GET request for DHM WCS data
  let url = auth.API_DHM_WCS_BASEURL
  url += '?SERVICE=WCS&COVERAGE=dhm_terraen&RESPONSE_CRS=epsg:25832&CRS=epsg:25832&FORMAT=GTiff&REQUEST=GetCoverage&VERSION=1.0.0'
  url += `&username=${ auth.API_DHM_USERNAME }&password=${ auth.API_DHM_PASSWORD }` // TODO: Should be auth stuff
  url += `&height=${ height }`
  url += `&width=${ width }`
  url += `&bbox=${ bbox[0]},${ bbox[1]},${ bbox[2]},${ bbox[3]}`

  return get(url, {}, false)
  .then((response) => {
    return response.arrayBuffer()
  })
  .then((arrayBuffer) => {
    return consumeGeoTIFF(arrayBuffer)
  })
}

/** Converts raw GeoTIFF arrayBuffer to image */
async function consumeGeoTIFF(raw_data) {
  const tiff = await fromArrayBuffer(raw_data)
  const image = await tiff.getImage()
  return image
}

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
async function getElevation(x, y, geoTiff) {
  
  const bbox = geoTiff.getBoundingBox()
  const height = geoTiff.getHeight()
  const width = geoTiff.getWidth()
  const bboxWidth = bbox[2] - bbox[0]
  const bboxHeight = bbox[3] - bbox[1]

  const xy = constrainToBbox(bbox, x, y)

  const widthPct = ( xy[0] - bbox[0] ) / bboxWidth
  const heightPct = ( xy[1] - bbox[1] ) / bboxHeight
  const xPx = Math.floor( width * widthPct )
  const yPx = Math.floor( height * ( 1 - heightPct ) )

  const window = [ xPx, yPx, xPx + 1, yPx + 1 ]
  const elevation_data = await geoTiff.readRasters( {window} )

  return Math.round( elevation_data[0][0] * 10) / 10
}

export {
  getTerrainGeoTIFF,
  getElevation
}
