// Testing saul-core methods

// You should add your own config.js with proper tokens, passwords, etc.
// Check config.js.example for info on how to set it up
import auth from '../config.js'

import assert from 'assert'
import { getSTAC, getTerrain } from '../modules/api.js'
import { world2image, image2world, getZ } from '../modules/saul-core.js'

const item = await getSTAC('/collections/skraafotos2021/items/2021_83_36_4_0013_00003824?crs=http://www.opengis.net/def/crs/EPSG/0/25832', auth)
const terrain = await getTerrain(item.bbox, auth)
const world_x = 587762.602
const world_y = 6133610.917
const image_x = 7373
const image_y = 3205
const world_elevation = 31.019

function is_equalIsh(num1, num2, deviation = 0.03) {
  if (Math.abs(num1 - num2) >= deviation) {
    return false
  } else {
    return true
  }
} 

// Test getZ
try {

  console.log("============")
  console.log("Testing getZ")

  let elevation = await getZ(world_x, world_y, auth)

  assert(is_equalIsh(elevation, world_elevation), "getZ fail: This is not the Z value we were hoping for.")
  
  console.log("OK")
  console.log("============")

} catch(error) {
  console.error(error)
}

// Test world2image
try {

  console.log("===================")
  console.log("Testing world2image")

  let xy = world2image(item, world_x, world_y, world_elevation)
  console.log('xy etc',xy, image_x, image_y)
  assert(is_equalIsh(xy[0], image_x, 0.7), "world2image fail: The x coordinate values are not equal")
  assert(is_equalIsh(xy[1], image_y, 0.7), "world2image fail: The y coordinate values are not equal")

  console.log("OK")
  console.log("===================")

} catch(error) {
  console.error(error)
}

// Test image2world
try {

  console.log("===================")
  console.log("Testing image2world")

  let coords = image2world(item, image_x, image_y, terrain)
  
  assert(is_equalIsh(coords[0], world_x), "image2world fail: The longitude values are not equal")
  assert(is_equalIsh(coords[1], world_y), "image2world fail: The latitude values are not equal")

  console.log("OK")
  console.log("===================")

} catch(error) {
  console.error(error)
}

// Test world2image > image2world 
/*
try {

  let xy1 = world2image(item, world_x, world_y, world_elevation)
  let coords1 = image2world(item, xy1[0], xy1[1], terrain)

  assert(is_equalIsh(coords1[0], world_x), "world2image > image2world fail: The longitude values are not equal")
  assert(is_equalIsh(coords1[1], world_y), "world2image > image2world fail: The latitude values are not equal")

  console.log("Test world2image > image2world OK")

} catch(error) {
  console.error(error)
}
*/
