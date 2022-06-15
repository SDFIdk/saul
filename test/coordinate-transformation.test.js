// Testing coordinate-transformation methods

// You should add your own config.js with proper tokens, passwords, etc.
// Check config.js.example for info on how to set it up
import auth from '../config.js'

import assert from 'assert'
import {WGS84toEPSG25832} from '../modules/coordinate-transformations.js'

// Test WGS84toEPSG25832
try {

  let epsg25832_coords = await WGS84toEPSG25832(10.31, 55.47, auth)
  
  assert.strictEqual(epsg25832_coords.v1, 582813.8171736911, "This is not the longitude we were hoping for.")
  assert.strictEqual(epsg25832_coords.v2, 6147874.57222, "This is not the latitide we were hoping for.")
  
  console.log("Test WGS84toEPSG25832 Ok")

} catch(error) {
  console.error(error)
}
