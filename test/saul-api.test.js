// Testing saul-core methods

// You should add your own config.js with proper tokens, passwords, etc.
// Check config.js.example for info on how to set it up
import auth from '../config.js'

import assert from 'assert'
import { getSTAC } from '../modules/api.js'
import { image2world, world2image } from '../modules/saul-core.js'
import { getTerrain } from '../modules/saul-terrain.js'

const item = await getSTAC('/collections/skraafotos2021/items/2021_83_36_2_0015_00003591?crs=http://www.opengis.net/def/crs/EPSG/0/25832', auth)
const image_x = 5000
const image_y = 3000

// Test image2world2image conversion using getTerrain
try {

  console.log("===================")
  console.log("Testing getTerrain")

  let terrain = await getTerrain(item.bbox, auth)

  assert(terrain[0].geop[0] === 587838, "getTerrain fail: Bad outcome.")
  
  console.log("OK")
  console.log("============================================")
  console.log("Testing conversion image2world > world2image")

  let world_coords = image2world(item, image_x, image_y, terrain)
  let image_coords = world2image(item, world_coords[0], world_coords[1], world_coords[2])

  assert(Math.round(image_coords[0]) === image_x, "Fail: Not precise enough.")
  
  console.log("OK")
  console.log("============================================")

} catch(error) {
  console.error(error)
}
