// You should add your own config.js with proper tokens, passwords, etc.
// Check config.js.example for info on how to set it up
import auth from '../config.js'

import assert from 'assert'
import { getTerrainGeoTIFF, getElevation } from '../modules/saul-elevation.js'
import { get } from '../modules/api.js'
import { getZ, getWorldXYZ } from '../modules/saul-core.js'

// Vars
const stac_item = '2021_83_29_2_0019_00003995'
const fidelity = 0.05 // Higher number means more points and better precision
const max_deviation = 0.5

// STAC API endpoint
let url_stac = 'https://api.dataforsyningen.dk/skraafotoapi_test/search?limit=1&crs=http://www.opengis.net/def/crs/EPSG/0/25832&token=9b554b6c854184c3b0f377ffc7481585'
url_stac += `&ids=${ stac_item }`

function is_equalIsh(num1, num2) {
  if (Math.abs(num1 - num2) > max_deviation) {
    return false
  } else {
    return true
  }
}

function getRandomCoordinate(bbox) {
  const x = bbox[0] + Math.random() * (bbox[2] - bbox[0])
  const y = bbox[1] + Math.random() * (bbox[3] - bbox[1])
  return [x,y]
}

function testDataAnumberOfTimes(data, bbox, times) {
  for (let i = 1; i <= times; i++) {
    const world1 = getRandomCoordinate(bbox)
    compareElevations(world1[0], world1[1], data)
  }
}

function compareElevations(x,y,geotiff) {
  getElevation(x, y, geotiff)
  .then(elevation => {
    getZ(x, y, auth)
    .then(getz_e => {
      assert(is_equalIsh(getz_e, elevation), `Elevations ${elevation} / ${getz_e} at ${x} ${y} do not match`)
      console.log(`Elevation at ${ x } ${ y } with delta ${Math.abs(elevation - getz_e).toFixed(2)} OK`)
    })
  })
}

// Test getTerrainGeoTIFF and getElevation with a STAC API item
get(url_stac)
.then((json) => {

  console.log('Testing getTerrainGeoTIFF and getElevation')

  const width = Math.round( json.features[0].properties['proj:shape'][0] * fidelity )
  const height = Math.round( json.features[0].properties['proj:shape'][1] * fidelity )

  console.info('fetching', width * height, 'data points as GeoTiff image')

  getTerrainGeoTIFF(json.features[0], auth, fidelity)
  .then(data => {

    testDataAnumberOfTimes(data, json.features[0].bbox, 5)
    
    getWorldXYZ({
      xy: [1,1],
      image: json.features[0],
      terrain: data
    }).then(world_xy => {
      compareElevations(world_xy[0], world_xy[1], data) // lower left corner of image
    })

  })

})
.catch((err) => {
  console.log('THE ERROR', err)
})
