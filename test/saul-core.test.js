// Testing saul-core methods

// You should add your own config.js with proper tokens, passwords, etc.
// Check config.js.example for info on how to set it up
import auth from '../config.js'

import assert from 'assert'
import {getSTAC} from '../modules/api.js'
import {world2image, image2world, getZ, iterate} from '../modules/saul-core.js'

// Test getZ
try {

  let elevation = await getZ(580341.2884785153,6130925.477182463, auth)

  assert.strictEqual(elevation, 31.100582, "This is not the Z value we were hoping for.")
  
  console.log("Test getZ Ok")

} catch(error) {
  console.error(error)
}

// Test iterate
try {

  let image_data = await getSTAC('/collections/skraafotos2019/items/2019_83_37_2_0046_00001113', auth)
  let ite = await iterate(image_data, 7375, 5382, auth, 0.05)

  assert.strictEqual(ite[0][0], 580341.2884785153, "The coordinate values are not equal") //test if the values are equal
  
  console.log("Test iterate Ok")

} catch(error) {
  console.error(error)
}

// Test world2image
try {

  let image_data = await getSTAC('/collections/skraafotos2019/items/2019_83_37_2_0046_00001113', auth)
  let xy = world2image(image_data, 580341.2884785153, 6130925.477182463, 31.100582)

  assert.strictEqual(Number(xy[0].toFixed(0)), 7375, "The x coordinate values are not equal")
  assert.strictEqual(Number(xy[1].toFixed(0)), 5382, "The y coordinate values are not equal")
  
  console.log("Test world2image Ok")

} catch(error) {
  console.error(error)
}

// Test image2world
try {

  let image_data = await getSTAC('/collections/skraafotos2019/items/2019_83_37_2_0046_00001113', auth)
  let coords = image2world(image_data, 7375, 5382, 31.100582)

  assert.strictEqual(coords[0], 580341.2884785153, "The longitude values are not equal")
  assert.strictEqual(coords[1], 6130925.477182463, "The latitude values are not equal")

  console.log("Test image2world Ok")

} catch(error) {
  console.error(error)
}