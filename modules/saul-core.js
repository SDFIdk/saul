/**
 * SAUL photogrammetry utilities 
 */
 
import { getDHM } from './api.js'

/** 
 * Converts x,y coordinates from an image to real world lat,lon coordinates
 * @param {object} image_data - skraafoto-stac-api image data
 * @param {number} col - Image x coordinate (from left to right). Should be a coordinate for the entire image, not just the part displayed in the viewport.
 * @param {number} row - Image y coordinate (from top to bottom). Should be a coordinate for the entire image, not just the part displayed in the viewport.
 * @param {number} [Z] - Elevation (geoide)
 * @returns {array} [longitude, latitude, elevation] 
 */
function image2world(image_data, col, row, Z = 0) {

  // constants pulled from image_data
  const xx0  = image_data.properties['pers:interior_orientation'].principal_point_offset[0]
  const yy0  = image_data.properties['pers:interior_orientation'].principal_point_offset[1]
  const ci   = image_data.properties['pers:interior_orientation'].focal_length
  const pix  = image_data.properties['pers:interior_orientation'].pixel_spacing[0]
  const dimXi = image_data.properties['pers:interior_orientation'].sensor_array_dimensions[0]
  const dimYi = image_data.properties['pers:interior_orientation'].sensor_array_dimensions[1]
  const X0   = image_data.properties['pers:perspective_center'][0]
  const Y0   = image_data.properties['pers:perspective_center'][1]
  const Z0   = image_data.properties['pers:perspective_center'][2]
  const Ome  = image_data.properties['pers:omega']
  const Phi  = image_data.properties['pers:phi']
  const Kap  = image_data.properties['pers:kappa']

  // recalc values
  var c = ci*(-1)
  var dimX = dimXi*pix/2*(-1)
  var dimY = dimYi*pix/2*(-1)
  row = dimYi - row
  
  // ... Do calculations ...
  var o = radians(Ome)
  var p = radians(Phi)
  var k = radians(Kap)
  var D11 =   Math.cos(p) * Math.cos(k)
  var D12 = - Math.cos(p) * Math.sin(k)
  var D13 =   Math.sin(p)
  var D21 =   Math.cos(o) * Math.sin(k) + Math.sin(o) * Math.sin(p) * Math.cos(k)
  var D22 =   Math.cos(o) * Math.cos(k) - Math.sin(o) * Math.sin(p) * Math.sin(k)
  var D23 = - Math.sin(o) * Math.cos(p)
  var D31 =   Math.sin(o) * Math.sin(k) - Math.cos(o) * Math.sin(p) * Math.cos(k)
  var D32 =   Math.sin(o) * Math.cos(k) + Math.cos(o) * Math.sin(p) * Math.sin(k)
  var D33 =   Math.cos(o) * Math.cos(p)

  var x_dot = ((col*pix)-dimX*-1)-xx0
  var y_dot = ((row*pix)-dimY*-1)-yy0

  var kx = (D11*x_dot + D12*y_dot + D13*c)/(D31*x_dot + D32*y_dot + D33*c)
  var ky = (D21*x_dot + D22*y_dot + D23*c)/(D31*x_dot + D32*y_dot + D33*c)

  var X = (Z-Z0)*kx + X0
  var Y = (Z-Z0)*ky + Y0


  return[X,Y,Z]
}

/** 
 * Converts lat,lon coordinates to x,y coordinates within a specific image
 * @param {Object} image_data - skraafoto-stac-api image data
 * @param {Number} Y - northing
 * @param {Number} X - easting
 * @param {Number} [Z] - elevation (geoide)
 * @returns {array} [x,y] Column/row image coordinate 
 */
function world2image(image_data, X, Y, Z = 0) {

  // constants pulled from image_data
  const xx0  = image_data.properties['pers:interior_orientation'].principal_point_offset[0]
  const yy0  = image_data.properties['pers:interior_orientation'].principal_point_offset[1]
  const ci   = image_data.properties['pers:interior_orientation'].focal_length
  const pix  = image_data.properties['pers:interior_orientation'].pixel_spacing[0]
  const dimXi = image_data.properties['pers:interior_orientation'].sensor_array_dimensions[0]
  const dimYi = image_data.properties['pers:interior_orientation'].sensor_array_dimensions[1]
  const X0   = image_data.properties['pers:perspective_center'][0]
  const Y0   = image_data.properties['pers:perspective_center'][1]
  const Z0   = image_data.properties['pers:perspective_center'][2]
  const Ome  = image_data.properties['pers:omega']
  const Phi  = image_data.properties['pers:phi']
  const Kap  = image_data.properties['pers:kappa']

  // recalc values
  var c = ci*(-1)
  var dimX = dimXi*pix/2*(-1)
  var dimY = dimYi*pix/2*(-1)
  
  // ... Do calculations ...
  var o = radians(Ome)
  var p = radians(Phi)
  var k = radians(Kap)
  var D11 =   Math.cos(p) * Math.cos(k)
  var D12 = - Math.cos(p) * Math.sin(k)
  var D13 =   Math.sin(p)
  var D21 =   Math.cos(o) * Math.sin(k) + Math.sin(o) * Math.sin(p) * Math.cos(k)
  var D22 =   Math.cos(o) * Math.cos(k) - Math.sin(o) * Math.sin(p) * Math.sin(k)
  var D23 = - Math.sin(o) * Math.cos(p)
  var D31 =   Math.sin(o) * Math.sin(k) - Math.cos(o) * Math.sin(p) * Math.cos(k)
  var D32 =   Math.sin(o) * Math.cos(k) + Math.cos(o) * Math.sin(p) * Math.sin(k)
  var D33 =   Math.cos(o) * Math.cos(p)

  var x_dot = (-1)*c*((D11*(X-X0)+D21*(Y-Y0)+D31*(Z-Z0))/(D13*(X-X0)+D23*(Y-Y0)+D33*(Z-Z0)))
  var y_dot = (-1)*c*((D12*(X-X0)+D22*(Y-Y0)+D32*(Z-Z0))/(D13*(X-X0)+D23*(Y-Y0)+D33*(Z-Z0)))

  var col = ((x_dot-xx0)+(dimX))*(-1)/pix
  var row = ((y_dot-yy0)+(dimY))*(-1)/pix

  return [col, row]
}

/** Converts degress to radians */
function radians(degrees) {
  return degrees * (Math.PI / 180)
}

/** 
 * Fetches elevation based on X,Y coordinates using DHM/Koter endpoint
 * @param {number} xcoor - EPSG:25832 X coordinate
 * @param {number} ycoor - EPSG:25832 Y coordinate
 * @param {{API_DHM_BASEURL: string, API_DHM_USERNAME: string, API_DHM_PASSWORD: string}} auth - API autentication data. See ../config.js.example for reference.
 * @returns {number} Elevation in meters 
 */
async function getZ(xcoor, ycoor, auth) {
  let zcoor_data = await getDHM(`?geop=POINT(${xcoor} ${ycoor})&elevationmodel=dsm`, auth)
  let z = zcoor_data.HentKoterRespons.data[0].kote
  return z
}

/** Iterates guessing at a world coordinate using image coordinates and elevation info */
function iterateRecursive(image_data, col, row, z, count, limit, auth) {
  // Get coordinates based on current z value
  const worldcoor = image2world(image_data,col,row,z)

  // Get new z value from coordinates
  return getZ(worldcoor[0],worldcoor[1], auth).then((new_z) => {
    
    // How big is the different between z and new z?
    const delta = Math.abs(new_z - z)
    
    if (delta >= limit) {
      // If the difference is too big, try building coordinates with the new z
      count = count + 1
      return iterateRecursive(image_data, col, row, new_z, count, limit, auth)
    } else {
      // If the difference is small, return coordinates
      return [worldcoor, delta, count]
    }
  })
}

/** 
 * Tries to guess world coordinate for a pixel position within an image using STAC API image data.
 * @param {object} image_data - image item data from STAC API
 * @param {number} col - image x coordinate (from left to right)
 * @param {number} row - image y coordinate (from top to bottom)
 * @param {{API_DHM_BASEURL: string, API_DHM_USERNAME: string, API_DHM_PASSWORD: string}} auth - API autentication data. See ../config.js.example for reference.
 * @param {number} [limit] - result may be inaccurate within this limit. Default is 0.1.
 * @returns {array} [world coordindates (array), elevation discrepancy, calculation iterations]
 */
async function iterate(image_data, col, row, auth, limit = 0.1) {
  return iterateRecursive(image_data, col, row, 0.5, 0, limit, auth)
}

export { 
  image2world,
  world2image,
  getZ,
  iterate
}
 