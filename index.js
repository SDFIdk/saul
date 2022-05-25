/**
 * SAUL photogrammetry utilities 
 */

/** 
 * Converts x,y coordinates from an image to real world lat,lon coordinates
 * @param {Number} image_x - Image x coordinate
 * @param {Number} image_y - Image y coordinate
 * @param {Object} image_data - skraafoto-stac-api image data
 */
function image2world(image_data, image_x, image_y) {

  let world_coords = {
    lat: 0,
    lon: 0,
    cote: 0
  }

  // ... insert magic ...

  return world_coords
}

/** 
 * Converts lat,lon coordinates to x,y coordinates in a specificimage
 * @param {Number} image_x - Image x coordinate
 * @param {Number} image_y - Image y coordinate
 * @param {Object} image_data - skraafoto-stac-api image data
 */
function world2image(image_data, lat, lon) {

  let image_coords = {
    x: 0,
    y: 0,
    Z: 0
  }

  // ... insert magic ...

  return image_coords
}

// Export SAUL utilities as a Javascript module object
export { 
  image2world,
  world2image
}
// To import into another script, use `import {methodName1, methodName2} from '/path/saul/index.js'`
 