/**
 * SAUL photogrammetry utilities 
 */

/** 
 * Converts x,y coordinates from an image to real world lat,lon coordinates
 * @param {Object} image_data - skraafoto-stac-api image data
 * @param {Number} image_x - Image x coordinate. Should be a coordinate for the entire image, not just the part displayed in the viewport.
 * @param {Number} image_y - Image y coordinate. Should be a coordinate for the entire image, not just the part displayed in the viewport.
 */
 function image2world(image_data, image_x, image_y) {

  // constants pulled from image_data
  const xx0  = image_data.properties['pers:interior_orientation'].principal_point_offset[0]
  const yy0  = image_data.properties['pers:interior_orientation'].principal_point_offset[1]
  const c    = image_data.properties['pers:interior_orientation'].focal_length
  const pix  = image_data.properties['pers:interior_orientation'].pixel_spacing[0]
  const dimX = image_data.properties['pers:interior_orientation'].sensor_array_dimensions[0]
  const dimY = image_data.properties['pers:interior_orientation'].sensor_array_dimensions[1]
  const X0   = image_data.properties['pers:perspective_center'][0]
  const Y0   = image_data.properties['pers:perspective_center'][1]
  const Z0   = image_data.properties['pers:perspective_center'][2]
  const Ome  = image_data.properties['pers:omega']
  const Phi  = image_data.properties['pers:phi']
  const Kap  = image_data.properties['pers:kappa']

  
  let world_coordinate_lat = 0
  let world_coordinate_lon = 0
  let world_coordinate_cote = 0
  
  // ... insert magic ...
  o = math.radians(Ome)
  p = math.radians(Phi)
  k = math.radians(Kap)
  D11 =   math.cos(p) * math.cos(k)
  D12 = - math.cos(p) * math.sin(k)
  D13 =   math.sin(p)
  D21 =   math.cos(o) * math.sin(k) + math.sin(o) * math.sin(p) * math.cos(k)
  D22 =   math.cos(o) * math.cos(k) - math.sin(o) * math.sin(p) * math.sin(k)
  D23 = - math.sin(o) * math.cos(p)
  D31 =   math.sin(o) * math.sin(k) - math.cos(o) * math.sin(p) * math.cos(k)
  D32 =   math.sin(o) * math.cos(k) + math.cos(o) * math.sin(p) * math.sin(k)
  D33 =   math.cos(o) * math.cos(p)

  x_dot = ((col-(dimX/2))*pix)+xx0
  y_dot = ((row-(dimY/2))*pix)+yy0

  x_dot = ((col*pix)-dimX*-1)-xx0
  y_dot = ((row*pix)-dimY*-1)-yy0

  kx=(D11*x_dot + D12*y_dot + D13*c)/(D31*x_dot + D32*y_dot + D33*c)
  ky=(D21*x_dot + D22*y_dot + D23*c)/(D31*x_dot + D32*y_dot + D33*c)

  X=(Z-Z0)*kx + X0
  Y=(Z-Z0)*ky + Y0
  #newZ=(Y-Y0)/ky + Z0
  #print newZ


  return[X,Y]

  return [
    world_coordinate_lat,
    world_coordinate_lon,
    world_coordinate_cote
  ]
}

/** 
 * Converts lat,lon coordinates to x,y coordinates in a specific image
 * @param {Object} image_data - skraafoto-stac-api image data
<<<<<<< Updated upstream
 * @param {Number} lat - latitude
 * @param {Number} lon - longitude
 * @param {Number} [cote] - elevation above sea level
=======
 * @param {Number} n - northing
 * @param {Number} e - easting
 * @param {Number} z - elevation (geoide)
>>>>>>> Stashed changes
 */
function world2image(image_data, n, e, z = 0) {

  // constants pulled from image_data
  const xx0  = image_data.properties['pers:interior_orientation'].principal_point_offset[0]
  const yy0  = image_data.properties['pers:interior_orientation'].principal_point_offset[1]
  const c    = image_data.properties['pers:interior_orientation'].focal_length
  const pix  = image_data.properties['pers:interior_orientation'].pixel_spacing[0]
  const dimX = image_data.properties['pers:interior_orientation'].sensor_array_dimensions[0]
  const dimY = image_data.properties['pers:interior_orientation'].sensor_array_dimensions[1]
  const X0   = image_data.properties['pers:perspective_center'][0]
  const Y0   = image_data.properties['pers:perspective_center'][1]
  const Z0   = image_data.properties['pers:perspective_center'][2]
  const Ome  = image_data.properties['pers:omega']
  const Phi  = image_data.properties['pers:phi']
  const Kap  = image_data.properties['pers:kappa']
  
  const rotation_matrix = image_data.properties['pers:rotation_matrix'] // This is an array of numbers
  const bbox = image_data.bbox // ie. [x1,y1,x2,y2]

  // Output values
  let image_x = 0
  let image_y = 0
  
  // ... Do calculations ...
  o = math.radians(Ome)
  p = math.radians(Phi)
  k = math.radians(Kap)
  D11 =   math.cos(p) * math.cos(k)
  D12 = - math.cos(p) * math.sin(k)
  D13 =   math.sin(p)
  D21 =   math.cos(o) * math.sin(k) + math.sin(o) * math.sin(p) * math.cos(k)
  D22 =   math.cos(o) * math.cos(k) - math.sin(o) * math.sin(p) * math.sin(k)
  D23 = - math.sin(o) * math.cos(p)
  D31 =   math.sin(o) * math.sin(k) - math.cos(o) * math.sin(p) * math.cos(k)
  D32 =   math.sin(o) * math.cos(k) + math.cos(o) * math.sin(p) * math.sin(k)
  D33 =   math.cos(o) * math.cos(p)

  x_dot = (-1)*c*((D11*(X-X0)+D21*(Y-Y0)+D31*(Z-Z0))/(D13*(X-X0)+D23*(Y-Y0)+D33*(Z-Z0)))
  y_dot = (-1)*c*((D12*(X-X0)+D22*(Y-Y0)+D32*(Z-Z0))/(D13*(X-X0)+D23*(Y-Y0)+D33*(Z-Z0)))

  col = ((x_dot-xx0)+(dimX))*(-1)/pix
  row = ((y_dot-yy0)+(dimY))*(-1)/pix

  return [col, row]
}

function getZ(x) {
  let y = x*10;

  return [y]
}

// export { 
//   image2world,
//   world2image,
//   getZ
// }
 