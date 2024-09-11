// You should add your own config.js with proper tokens, etc.
// Check config.js.example for info on how to set it up
import auth from '../config.js'
import { getSTAC, getTerrainGeoTIFF,getZ, getWorldXYZ, getImageXY } from '../index.js'

console.log('---------------')
console.log('Combined tests ')
console.log('---------------')

// Vars
const resolution = 0.005 // Higher number means more points and better precision
const max_deviation = 0.5

/*
// North
let item_1 = {
  id: '2021_83_29_2_0019_00003995',
  xy: [1000,1000]
}
// East
let item_2 = {
  id: '2021_83_29_4_0016_00002877'
}
// West
let item_3 = {
  id: '2021_83_29_5_0022_00003276'
}
// South
let item_4 = {
  id: '2021_83_29_3_0019_00003975'
}
// Nadir
let item_5 = {
  id: '2021_83_29_1_0019_00003985'
}
*/

/*
// North
let item_1 = {
  id: '2021_83_33_2_0003_00002821',
  xy: [8000,5000]
}
// East
let item_2 = {
  id: '2021_83_33_4_0002_00000845'
}
// West
let item_3 = {
  id: '2021_83_33_5_0005_00003192'
}
// South
let item_4 = {
  id: '2021_83_33_3_0004_00002970'
}
// Nadir
let item_5 = {
  id: '2021_83_33_1_0004_00002965'
}
*/

// North
let item_1 = {
  id: '2021_83_29_2_0019_00003995',
  xy: [1000,1000]
}
// East
let item_2 = {
  id: '2021_83_29_4_0016_00002877'
}
// West
let item_3 = {
  id: '2021_83_29_5_0022_00003276'
}
// South
let item_4 = {
  id: '2021_83_29_3_0019_00003975'
}
// Nadir
let item_5 = {
  id: '2021_83_29_1_0019_00003985'
}

// Helper functions
function is_equalIsh(num1, num2, deviation = max_deviation) {
  if (Math.abs(num1 - num2) > deviation) {
    return false
  } else {
    return true
  }
}

function generateSTACurl(stac_item_id) {
  return `/search?limit=1&crs=http://www.opengis.net/def/crs/EPSG/0/25832&ids=${ stac_item_id }`
}

async function enrichData(item) {
  let new_item = Object.assign({}, item)
  // add STAC item
  new_item.item = await getSTAC(generateSTACurl(new_item.id), auth)
  new_item.item = new_item.item.features[0]
  // add terrain GeoTIFF
  new_item.terrain = await getTerrainGeoTIFF(new_item.item, auth, resolution)
  // Add imageXY
  new_item.xy = getImageXY(new_item.item, item_1.xyz[0], item_1.xyz[1], item_1.xyz[2])
  // Add world XYZ (from imageYX)
  new_item.xyz = await getWorldXYZ({
    xy: new_item.xy,
    image: new_item.item,
    terrain: new_item.terrain
  })
  // add kote
  new_item.kote = await getZ(new_item.xyz[0], new_item.xyz[1], auth)
  // add resolution info
  new_item.ext_x = Math.round((new_item.item.bbox[2] - new_item.item.bbox[0]) * 100) / 100
  new_item.ext_y = Math.round((new_item.item.bbox[3] - new_item.item.bbox[1]) * 100) / 100
  new_item.z_pr_m_x = Math.round((new_item.item.properties['proj:shape'][0] / new_item.ext_x) * 100  * resolution) / 100
  new_item.z_pr_m_y = Math.round((new_item.item.properties['proj:shape'][1] / new_item.ext_y) * 100  * resolution) / 100
  const width = Math.round( new_item.item.properties['proj:shape'][0] * resolution )
  const height = Math.round( new_item.item.properties['proj:shape'][1] * resolution )
  new_item.z_points = width * height
  return new_item
}

// Fetch image data and terrain
item_1.item = await getSTAC(generateSTACurl(item_1.id), auth)
item_1.item = item_1.item.features[0]
item_1.terrain = await getTerrainGeoTIFF(item_1.item, auth, resolution)

// Given image XY for one image, get world XYZ
item_1.xyz = await getWorldXYZ({
  xy: item_1.xy,
  image: item_1.item,
  terrain: item_1.terrain
})

item_1.kote = await getZ(item_1.xyz[0], item_1.xyz[1], auth)

// Get image and corresponding world coordinates for other images (amongst other things)
item_2 = await enrichData(item_2)
item_3 = await enrichData(item_3)
item_4 = await enrichData(item_4)
item_5 = await enrichData(item_5)

// Compare items
console.table({
  north: item_1, 
  east: item_2,
  west: item_3,
  south: item_4, 
  nadir: item_5
})
