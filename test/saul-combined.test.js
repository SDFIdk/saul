// You should add your own config.js with proper tokens, passwords, etc.
// Check config.js.example for info on how to set it up
import auth from '../config.js'
import assert from 'assert'
import { getTerrainGeoTIFF, getElevation } from '../modules/saul-elevation.js'
import { get } from '../modules/api.js'
import { getZ, getWorldXYZ, world2image } from '../modules/saul-core.js'


// Vars
const resolution = 0.03 // Higher number means more points and better precision
const max_deviation = 0.5

const item_1 = {
  id: '2021_83_29_2_0019_00003995',
  stac_url: generateSTACurl(this.id)
}


function is_equalIsh(num1, num2, deviation = max_deviation) {
  if (Math.abs(num1 - num2) > deviation) {
    return false
  } else {
    return true
  }
}

function generateSTACurl(stac_item_id) {
  let url = `${ auth.API_STAC_BASEURL }/search?limit=1&crs=http://www.opengis.net/def/crs/EPSG/0/25832&token=${ auth.API_STAC_TOKEN }`
  url += `&ids=${ stac_item_id }`
  return url
}

// Test getTerrainGeoTIFF and getElevation with a STAC API item
get(url_stac)
.then((json) => {

  const width = Math.round( json.features[0].properties['proj:shape'][0] * resolution )
  const height = Math.round( json.features[0].properties['proj:shape'][1] * resolution )

  console.info('fetching', width * height, 'data points as GeoTiff image')

  getTerrainGeoTIFF(json.features[0], auth, resolution)
  .then(data => {

    // Testing getElevation
    try {
      testGetElevationAnumberOfTimes(data, json.features[0].bbox, 5)
    } catch(error) {
      console.error(error)
    }

    // Testing getWorldXYZ
    try {
      testGetWorldXYZAnumberOfTimes(json.features[0], data, 10)
    } catch(error) {
      console.error(error)
    }

  })

})
.catch((err) => {
  console.log('THE ERROR', err)
})