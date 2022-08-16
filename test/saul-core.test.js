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
const world_y = 6130952
const image_x = 41826
const image_y = 3204
const world_elevation = 38.8549

function roundUp(num) {
  return Number(num.toFixed(0))
}

// Test getZ
try {

  let elevation = await getZ(world_x, world_y, auth)

  assert.strictEqual(Number(elevation.toFixed(4)), world_elevation, "This is not the Z value we were hoping for.")

  console.log("Test getZ OK")

} catch(error) {
  console.error(error)
}

// Test iterate
try {

  let ite = await iterate(item, image_x, image_y, auth, 0.05)

  assert.strictEqual(roundUp(ite[0][0]), world_x, "The coordinate values are not equal") //test if the values are equal

  console.log("Test iterate OK")

} catch(error) {
  console.error(error)
}

// Test world2image
try {

  let xy = world2image(item, world_x, world_y, world_elevation)

  assert.strictEqual(roundUp(xy[0]), image_x, "The x coordinate values are not equal")
  assert.strictEqual(roundUp(xy[1]), image_y, "The y coordinate values are not equal")
  
  console.log("Test world2image OK")

} catch(error) {
  console.error(error)
}

// Test image2world
try {

  let coords = image2world(item, image_x, image_y, world_elevation)

  assert.strictEqual(roundUp(coords[0]), world_x, "The longitude values are not equal")
  assert.strictEqual(roundUp(coords[1]), world_y, "The latitude values are not equal")

  console.log("Test image2world OK")

} catch(error) {
  console.error(error)
}
