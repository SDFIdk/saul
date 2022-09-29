/**
 * SAUL photogrammetry utilities 
 */
 
import { getDHM } from './api.js'

/** Gathers elevation range extremes from terrain data */
function getZrange(terrain_data) {
  let sorted_data = terrain_data.sort(function(a,b) {
    if (a.kote > b.kote) {
      return -1
    } else if (b.kote > a.kote) {
      return 1
    } else {
      return 0
    }
  })
  let min = sorted_data[ sorted_data.length -1 ].kote
  let max = sorted_data[0].kote
  let mid = (min + max) / 2
  return [min, mid, max]
}

/** 
 * Converts x,y coordinates from an image to real world latitude, longitude, and elevation coordinates
 * @param {object} image_data - skraafoto-stac-api image data
 * @param {number} col - Image x coordinate (from left to right). Should be a coordinate for the entire image, not just the part displayed in the viewport.
 * @param {number} row - Image y coordinate (from bottom to top). Should be a coordinate for the entire image, not just the part displayed in the viewport.
 * @param {object} terrain_data - Output from `getTerrain()` method. DHM Elevation data covering the image's bounding box.
 * @returns {array} [longitude, latitude, elevation] Elevation is in meters. Lon/lat are EPSG:25832 coordinates.
 */
function image2world(image_data, col, row, terrain_data) {

  // Terrain values
  const Z_range = getZrange(terrain_data)
  let Z = Z_range[1]

  // constants pulled from image_data
  const xx0   = image_data.properties['pers:interior_orientation'].principal_point_offset[0]
  const yy0   = image_data.properties['pers:interior_orientation'].principal_point_offset[1]
  const ci    = image_data.properties['pers:interior_orientation'].focal_length
  const pix   = image_data.properties['pers:interior_orientation'].pixel_spacing[0]
  const dimXi = image_data.properties['pers:interior_orientation'].sensor_array_dimensions[0]
  const dimYi = image_data.properties['pers:interior_orientation'].sensor_array_dimensions[1]
  const X0    = image_data.properties['pers:perspective_center'][0]
  const Y0    = image_data.properties['pers:perspective_center'][1]
  const Z0    = image_data.properties['pers:perspective_center'][2]
  const Ome   = image_data.properties['pers:omega']
  const Phi   = image_data.properties['pers:phi']
  const Kap   = image_data.properties['pers:kappa']

  // recalc values
  const c = ci*(-1)
  const dimX = dimXi*pix/2*(-1)
  const dimY = dimYi*pix/2*(-1)
  
  // ... Do calculations ...
  const o = radians(Ome)
  const p = radians(Phi)
  const k = radians(Kap)
  const D11 =   Math.cos(p) * Math.cos(k)
  const D12 = - Math.cos(p) * Math.sin(k)
  const D13 =   Math.sin(p)
  const D21 =   Math.cos(o) * Math.sin(k) + Math.sin(o) * Math.sin(p) * Math.cos(k)
  const D22 =   Math.cos(o) * Math.cos(k) - Math.sin(o) * Math.sin(p) * Math.sin(k)
  const D23 = - Math.sin(o) * Math.cos(p)
  const D31 =   Math.sin(o) * Math.sin(k) - Math.cos(o) * Math.sin(p) * Math.cos(k)
  const D32 =   Math.sin(o) * Math.cos(k) + Math.cos(o) * Math.sin(p) * Math.sin(k)
  const D33 =   Math.cos(o) * Math.cos(p)

  const x_dot = ((col*pix)-dimX*-1)-xx0
  const y_dot = ((row*pix)-dimY*-1)-yy0

  const kx = (D11*x_dot + D12*y_dot + D13*c)/(D31*x_dot + D32*y_dot + D33*c)
  const ky = (D21*x_dot + D22*y_dot + D23*c)/(D31*x_dot + D32*y_dot + D33*c)

  let world_x = (Z-Z0)*kx + X0
  let world_y = (Z-Z0)*ky + Y0

  // TODO: We might not need this
  //const world_coord = refineWorldCoord(image_data, [world_x, world_y], [col, row], Z)

  return [world_x, world_y, Z]
}

/** 
 * Converts lat,lon coordinates to x,y coordinates within a specific image
 * @param {Object} image_data - skraafoto-stac-api image data
 * @param {Number} Y - EPSG:25832 northing coordinate
 * @param {Number} X - EPSG:25832 easting coordinate
 * @param {Number} [Z] - elevation in meters (geoide)
 * @returns {array} [x,y] Column/row image coordinate 
 */
function world2image(image_data, X, Y, Z = 0) {

  // constants pulled from image_data
  const xx0   = image_data.properties['pers:interior_orientation'].principal_point_offset[0]
  const yy0   = image_data.properties['pers:interior_orientation'].principal_point_offset[1]
  const ci    = image_data.properties['pers:interior_orientation'].focal_length
  const pix   = image_data.properties['pers:interior_orientation'].pixel_spacing[0]
  const dimXi = image_data.properties['pers:interior_orientation'].sensor_array_dimensions[0]
  const dimYi = image_data.properties['pers:interior_orientation'].sensor_array_dimensions[1]
  const X0    = image_data.properties['pers:perspective_center'][0]
  const Y0    = image_data.properties['pers:perspective_center'][1]
  const Z0    = image_data.properties['pers:perspective_center'][2]
  const Ome   = image_data.properties['pers:omega']
  const Phi   = image_data.properties['pers:phi']
  const Kap   = image_data.properties['pers:kappa']

  // recalc values
  const c = ci*(-1)
  const dimX = dimXi*pix/2*(-1)
  const dimY = dimYi*pix/2*(-1)
  
  // ... Do calculations ...
  const o = radians(Ome)
  const p = radians(Phi)
  const k = radians(Kap)
  const D11 =   Math.cos(p) * Math.cos(k)
  const D12 = - Math.cos(p) * Math.sin(k)
  const D13 =   Math.sin(p)
  const D21 =   Math.cos(o) * Math.sin(k) + Math.sin(o) * Math.sin(p) * Math.cos(k)
  const D22 =   Math.cos(o) * Math.cos(k) - Math.sin(o) * Math.sin(p) * Math.sin(k)
  const D23 = - Math.sin(o) * Math.cos(p)
  const D31 =   Math.sin(o) * Math.sin(k) - Math.cos(o) * Math.sin(p) * Math.cos(k)
  const D32 =   Math.sin(o) * Math.cos(k) + Math.cos(o) * Math.sin(p) * Math.sin(k)
  const D33 =   Math.cos(o) * Math.cos(p)

  const x_dot = (-1)*c*((D11*(X-X0)+D21*(Y-Y0)+D31*(Z-Z0))/(D13*(X-X0)+D23*(Y-Y0)+D33*(Z-Z0)))
  const y_dot = (-1)*c*((D12*(X-X0)+D22*(Y-Y0)+D32*(Z-Z0))/(D13*(X-X0)+D23*(Y-Y0)+D33*(Z-Z0)))

  const col = ((x_dot-xx0)+(dimX))*(-1)/pix
  const row = ((y_dot-yy0)+(dimY))*(-1)/pix

  return [col, row]
}

/**
 * Calculates horizontal distance between to points in an image
 * @param {[x,y]} image_coor_1 - Image [x,y] 'from' measure
 * @param {[x,y]} image_coor_2 - Image [x,y] 'to' measure
 * @returns {number} Distance in meters
 */
function getHorizontalDistance(image_coor_1, image_coor_2) {
  return true
}

/**
 * Calculates vertical distance between to points in an image
 * @param {[x,y]} image_coor_1 - Image [x,y] 'from' measure
 * @param {[x,y]} image_coor_2 - Image [x,y] 'to' measure
 * @returns {number} Distance in meters
 */
function getVerticalDistance(image_coor_1, image_coor_2) {
  return true
}

/** Converts degress to radians */
function radians(degrees) {
  return degrees * (Math.PI / 180)
}

/** 
 * Fetches elevation based on X,Y coordinates using DHM/Koter endpoint
 * @param {number} xcoor - EPSG:25832 easting coordinate
 * @param {number} ycoor - EPSG:25832 northing coordinate
 * @param {{API_DHM_BASEURL: string, API_DHM_USERNAME: string, API_DHM_PASSWORD: string}} auth - API autentication data. See ../config.js.example for reference.
 * @returns {number} Elevation in meters 
 */
async function getZ(xcoor, ycoor, auth) {
  let zcoor_data = await getDHM(`?geop=POINT(${xcoor} ${ycoor})&elevationmodel=dtm`, auth)
  let z = zcoor_data.HentKoterRespons.data[0].kote
  return z
}

/** 
 * Compare XY and calculate again if necessary
 */ 
function refineWorldCoord(image_data, world_coord, img_coord, elevation) {
  
  const img_coord_now = world2image(image_data, world_coord[0], world_coord[1])
  console.log('checking world coord', world_coord, img_coord, img_coord_now, elevation)

  if (checkDeviation(img_coord_now[0], img_coord[0]) && checkDeviation(img_coord_now[1], img_coord[1])) {
    return [world_coord[0], world_coord[1], elevation]
  } else {
    console.log('Something is rotten within image2world method.') 
    console.log('See', img_coord_now, 'compared to', img_coord)
    console.log('We should recalc world_x/world_y using a different elevation and try again')
    return [world_coord[0], world_coord[1], elevation]
  }
}

/**
 * Checks whether two numbers are equal enough within a given limit
 * @param {number} num1 - First number to check
 * @param {number} num2 - Second number to check
 * @param {number} [deviation] - The numbers may be off by this amount. Default is 0.5
 * @returns {boolean} `true` if numbers are approximately equal
 */
function checkDeviation(num1, num2, deviation = 0.3) {
  if (Math.abs(num1 - num2) >= deviation) {
    return false
  } else {
    return true
  }
}

export { 
  image2world,
  world2image,
  getHorizontalDistance,
  getVerticalDistance,
  getZ
}
 