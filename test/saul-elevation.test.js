// You should add your own config.js with proper tokens, passwords, etc.
// Check config.js.example for info on how to set it up
import auth from '../config.js'

import { getTerrainGeoTIFF, getElevation } from '../modules/saul-elevation.js'
import { get } from '../modules/api.js'
import { getZ } from '../modules/saul-core.js'

// variables and constants
const width = 1000
const height = 1000

// STAC API endpoint
let url_stac = 'https://api.dataforsyningen.dk/skraafotoapi_test/search?limit=1&crs=http://www.opengis.net/def/crs/EPSG/0/25832&token=9b554b6c854184c3b0f377ffc7481585'
url_stac += '&ids=2021_83_29_2_0019_00003995'

function getRandomCoordinate(bbox) {
  const x = bbox[0] + Math.random() * (bbox[2] - bbox[0])
  const y = bbox[1] + Math.random() * (bbox[3] - bbox[1])
  return [x,y]
}

function testDataAnumberOfTimes(data, bbox, times) {
  for (let i = 1; i < times; i++) {
    const world1 = getRandomCoordinate(bbox)
    compareElevations(world1[0], world1[1], data)
  }
}

function compareElevations(x,y,geotiff) {
  getElevation(x, y, geotiff)
  .then(elevation => {
    getZ(x, y, auth)
    .then(getz_e => {
      console.log('comparing at', x, y)
      console.log('getElevation/getZ', elevation, '/', getz_e)
      console.log('delta is', Number(Math.abs(getz_e - elevation).toFixed(2)))
    })
  })
}

get(url_stac)
.then((json) => {

  console.log('feature', json.features[0].properties['proj:shape'])
  console.log('bbox', json.features[0].bbox)

  getTerrainGeoTIFF(json.features[0])
  .then(data => {

    testDataAnumberOfTimes(data, json.features[0].bbox, 5)

    const left = json.features[0].bbox[0] + 50
    const low = json.features[0].bbox[1] + 50
    const right = json.features[0].bbox[2] - 50
    const up = json.features[0].bbox[3] - 50
    const c1 = left + ((right - left) / 2)
    const c2 = low + ((up - low) / 2)

    compareElevations(left,low,data) // Left low
    compareElevations(left,up,data) // Left up
    compareElevations(right,up,data) // Right up
    compareElevations(right,low,data) // Right low
    compareElevations(c1,c2,data) // Center center
    
  })

})
.catch((err) => {
  console.log('THE ERROR', err)
})

