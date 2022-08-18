// Testing saul-core methods

// You should add your own config.js with proper tokens, passwords, etc.
// Check config.js.example for info on how to set it up
import auth from '../config.js'

import assert from 'assert'
import {getSTAC} from '../modules/api.js'
import {world2image, image2world, getZ, iterate} from '../modules/saul-core.js'

/*
const item = await getSTAC('/collections/skraafotos2019/items/2019_83_37_2_0046_00001113', auth)
const world_x = 580341
const world_y = 6130925
const image_x = 7373
const image_y = 3205
const world_elevation = 32.7199
*/

const item = await getSTAC('/collections/skraafotos2021/items/2021_83_36_4_0013_00003824', auth)
const world_x = 587739
const world_y = 6130951
const image_x = 41839.698939
const image_y = 3204.326930
const world_elevation = 38.874336

function is_equalIsh(num1, num2) {
  const deviation = 0.05
  if (Math.abs(num1 - num2) > deviation) {
    return false
  } else {
    return true
  }
} 

// Test getZ
try {

  let elevation = await getZ(world_x, world_y, auth)

  assert(is_equalIsh(elevation, world_elevation), "getZ fail: This is not the Z value we were hoping for.")
  
  console.log("Test getZ OK")

} catch(error) {
  console.error(error)
}

// Test iterate
try {

  let ite = await iterate(item, image_x, image_y, auth, 0.05)

  assert(is_equalIsh(ite[0][0], world_x), "iterate fail: The coordinate values are not equal") //test if the values are equal
  assert(is_equalIsh(ite[0][1], world_y), "iterate fail: The coordinate values are not equal") //test if the values are equal

  console.log("Test iterate OK")

} catch(error) {
  console.error(error)
}

// Test world2image
try {

  let xy = world2image(item, world_x, world_y, world_elevation)

  assert(is_equalIsh(xy[0], image_x), "world2image fail: The x coordinate values are not equal")
  assert(is_equalIsh(xy[1], image_y), "world2image fail: The y coordinate values are not equal")
  
  console.log("Test world2image OK")

} catch(error) {
  console.error(error)
}

// Test image2world
try {

  let coords = image2world(item, image_x, image_y, world_elevation)

  assert(is_equalIsh(coords[0], world_x), "image2world fail: The longitude values are not equal")
  assert(is_equalIsh(coords[1], world_y), "image2world fail: The latitude values are not equal")

  console.log("Test image2world OK")

} catch(error) {
  console.error(error)
}

// Test world2image > image2world 
try {

  let xy1 = world2image(item, world_x, world_y, world_elevation)
  let coords1 = image2world(item, xy1[0], xy1[1], world_elevation)

  assert(is_equalIsh(coords1[0], world_x), "world2image > image2world fail: The longitude values are not equal")
  assert(is_equalIsh(coords1[1], world_y), "world2image > image2world fail: The latitude values are not equal")

  console.log("Test world2image > image2world OK")

} catch(error) {
  console.error(error)
}

// Test world2image > iterate 
try {

  let xy2 = world2image(item, world_x, world_y, world_elevation)
  let coords2 = iterate(item, xy2[0], xy2[1], auth)

  assert(is_equalIsh(coords2[0], world_x), "world2image > iterate fail: The longitude values are not equal")
  assert(is_equalIsh(coords2[1], world_y), "world2image > iterate fail: The latitude values are not equal")

  console.log("Test world2image > iterate OK")

} catch(error) {
  console.error(error)
}