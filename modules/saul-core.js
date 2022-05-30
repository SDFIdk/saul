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

  let world_coordinate_lat = 0
  let world_coordinate_lon = 0
  let world_coordinate_cote = 0
  
  // ... insert magic ...

  return [
    world_coordinate_lat,
    world_coordinate_lon,
    world_coordinate_cote
  ]
}

/** 
 * Converts lat,lon coordinates to x,y coordinates in a specific image
 * @param {Object} image_data - skraafoto-stac-api image data
 * @param {Number} lat - latitude
 * @param {Number} lon - longitude
 * @param {Number} cote - OPTIONAL: elevation above sea level
 */
function world2image(image_data, lat, lon, cote = 0) {

  // Example constants pulled from image_data
  const omega = image_data.properties['pers:omega'] 
  const phi = image_data.properties['pers:phi'] 
  const kappa = image_data.properties['pers:kappa']
  const sensor_array_dimension_x = image_data.properties['pers:interior_orientation'].sensor_array_dimensions[0] 
  const sensor_array_dimension_y = image_data.properties['pers:interior_orientation'].sensor_array_dimensions[1]
  const rotation_matrix = image_data.properties['pers:rotation_matrix'] // This is an array of numbers
  const bbox = image_data.bbox // ie. [x1,y1,x2,y2]

  // Output values
  let image_x = 0
  let image_y = 0
  
  // ... Do calculations ...

  return [image_x, image_y]
}

export { 
  image2world,
  world2image
}
 