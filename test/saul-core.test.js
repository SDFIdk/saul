// Testing saul-core methods

// You should add your own config.js with proper tokens, passwords, etc.
// Check config.js.example for info on how to set it up
import auth from '../config.js'

import assert from 'assert'
import { getSTAC } from '../modules/api.js'
import { world2image, image2world } from '../modules/saul-core.js'
import { getTerrain, getZ } from '../modules/saul-terrain.js'

const item1 = await getSTAC('/collections/skraafotos2021/items/2021_83_36_5_0017_00003353?crs=http://www.opengis.net/def/crs/EPSG/0/25832', auth)
const item2 = await getSTAC('/collections/skraafotos2019/items/2019_83_36_5_0023_00000333?crs=http://www.opengis.net/def/crs/EPSG/0/25832', auth)

const world_x = 588589.10
const world_y = 6133643.63
const world_elevation = await getZ(world_x, world_y, auth)

const image_x_1 = 894.4 // 895.8517570509372
const image_y_1 = 5768.3 // 5756.580310765313
const image_x_2 = 9341.6 // 9354.498051515757
const image_y_2 = 4175 // 4173.457948559876

const terrain1 = await getTerrain(item1.bbox, auth, [[world_x,world_y]])
const terrain2 = await getTerrain(item2.bbox, auth, [[world_x,world_y]])

function is_equalIsh(num1, num2, deviation = 0.03) {
  if (Math.abs(num1 - num2) >= deviation) {
    return false
  } else {
    return true
  }
}

// Test getTerrain response
try {

  console.log("===========================")
  console.log("Testing getTerrain response")

  const t1 = terrain1.find(function(t) {
    if (t.geop[0] === world_x && t.geop[1] === world_y) {
      return t
    }
  })

  assert(t1.kote === world_elevation, "Bad elevation data")
  
  console.log("OK")
  console.log("===========================")

} catch(error) {
  console.error(error)
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

  const xy1 = world2image(item1, world_x, world_y, world_elevation)
  const xy2 = world2image(item2, world_x, world_y, world_elevation)
  
  assert(is_equalIsh(xy1[0], image_x_1, 0.5), "world2image fail: The x coordinate values are not equal")
  assert(is_equalIsh(xy1[1], image_y_1, 0.5), "world2image fail: The y coordinate values are not equal")

  assert(is_equalIsh(xy2[0], image_x_2, 0.5), "world2image fail: The x coordinate values are not equal")
  assert(is_equalIsh(xy2[1], image_y_2, 0.5), "world2image fail: The y coordinate values are not equal")

  console.log("OK within 0.5px")
  console.log("===================")

} catch(error) {
  console.error(error)
}

// Test image2world
try {

  console.log("===================")
  console.log("Testing image2world")

  let coords = image2world(item1, image_x_1, image_y_1, terrain1)

  console.log(coords, world_x, world_y)
  
  assert(is_equalIsh(coords[0], world_x, 2), "image2world fail: The longitude values are not equal")
  assert(is_equalIsh(coords[1], world_y, 2), "image2world fail: The latitude values are not equal")

  console.log("OK within 2m")
  console.log("===================")

} catch(error) {
  console.error(error)
}

// Cross test image2world
try {

  console.log("===================")
  console.log("Testing image2world with two images")

  const world_coor_1 = image2world(item1, image_x_1, image_y_1, terrain1)
  const world_coor_2 = image2world(item2, image_x_2, image_y_2, terrain2)
  
  console.log('world coords', world_coor_1, world_coor_2)

  assert(is_equalIsh(world_coor_1[0], world_coor_2[0], 1), "World x coordinates are too different")
  assert(is_equalIsh(world_coor_1[1], world_coor_2[1], 1), "World y coordinates are too different")

  console.log("OK within 1m")
  console.log("===================")

} catch(error) {
  console.error(error)
}

// Cross test world2image
try {

  console.log("===================")
  console.log("Testing world2image with two images")

  const img_coor_1 = world2image(item1, world_x, world_y, world_elevation)
  const img_coor_2 = world2image(item2, world_x, world_y, world_elevation)
  
  console.log(img_coor_1, img_coor_2)

  const world_coor_1 = image2world(item1, img_coor_1[0], img_coor_1[1], terrain1)
  const world_coor_2 = image2world(item2, img_coor_2[0], img_coor_2[1], terrain2)

  console.log(world_coor_1, world_coor_2)

  assert(is_equalIsh(world_coor_1[0],world_coor_2[0], 1), "World x coordinates are too different")
  assert(is_equalIsh(world_coor_1[1],world_coor_2[1], 1), "World y coordinates are too different")

  console.log("OK within 1m")
  console.log("===================")

} catch(error) {
  console.error(error)
}
