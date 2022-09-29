/**
 * SAUL photogrammetry utilities 
 */
 
import { getZrange } from './saul-terrain.js'

/**
 * Finds a set of terrain data that is closest to `geop` coordinate
 * @param {array} terrain - Terrain data from DHM response
 * @param {array} geop - EPSG:25832 coordinate [x,y]
 * @returns {array} [x,y,z]
 */
function getClosestTerrain(terrain, geop) {

  let t = [0,0,0]
  let delta_x 
  let delta_y
  
  terrain.forEach(function(obj) {
    const new_delta_x = Number(obj.geop[0]) - geop[0]
    if (!delta_x) {
      delta_x = new_delta_x
      t[0] = obj.geop[0]
    } else if (new_delta_x <= delta_x) {
      delta_x = new_delta_x
      t[0] = obj.geop[0]
      if (delta_x < delta_y) {
        t[2] = obj.kote
      }
    }
    const new_delta_y = Number(obj.geop[1]) - geop[1]
    if (!delta_y) {
      delta_y = new_delta_y
      t[1] = obj.geop[1]
    } else if (new_delta_y <= delta_y) {
      delta_y = new_delta_y
      t[1] = obj.geop[1]
      if (delta_y < delta_x) {
        t[2] = obj.kote
      }
    }
  })

  return t
}

function refineWorldCoord(options) {
  
  // TODO:
  // This method finds the closest terrain datapoint [xyz] for a given XY
  // On subsequent iterations with a slightly altereed XY, 
  // the closest terrain datapoint is usually the same,
  // making this method pretty unusable

  // It might be more fruitful to compare output from world2image with the current image_xy

  const new_geop = getClosestTerrain(options.terrain, options.world_xy)
  const delta_z = options.elevation - new_geop[2]
  let new_world_x
  let new_world_y

  console.log('delta', delta_z, 'from', new_geop)

  if (delta_z === 0) {

    return [options.world_xy[0], options.world_xy[1], options.elevation]

  } else {
    if (options.world_xy[0] > new_geop[0]) {
      new_world_x = options.world_xy[0] + 0.02
    } else if (options.world_xy[0] < new_geop[0]) {
      new_world_x = options.world_xy[0] - 0.02
    }
    if (options.world_xy[1] > new_geop[1]) {
      new_world_y = options.world_xy[1] + 0.02
    } else if (options.world_xy[1] < new_geop[1]) {
      new_world_y = options.world_xy[1] - 0.02
    }
  }

  console.log('old xyz', options.world_xy, options.elevation)
  console.log('new xyz', new_world_x, new_world_y, new_geop[2])
  console.log('image xy', options.image_xy)
  console.log('world2image', world2image(options.item, new_world_x, new_world_y, new_geop[2]))

  options.world_xy = [new_world_x, new_world_y]
  options.elevation = new_geop[2]
  return refineWorldCoord(options)
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

  const world_x = (Z-Z0)*kx + X0
  const world_y = (Z-Z0)*ky + Y0

  const world_xyz = refineWorldCoord({
    item: image_data,
    terrain: terrain_data,
    world_xy: [world_x, world_y], 
    image_xy: [col,row],
    elevation: Z
  })
  
  return world_xyz
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

export { 
  image2world,
  world2image,
  getHorizontalDistance,
  getVerticalDistance
}
 