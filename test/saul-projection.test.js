// Testing saul-projection methods

import assert from 'assert'
import proj4 from 'proj4'
import {epsg25832proj, createTranslator} from '../modules/saul-projection.js'

// Test epsg25832proj
try {

  const projection = epsg25832proj(proj4)

  assert.ok(projection.defs['EPSG:25832'], "Projection not defined.")
  
  console.log("Test epsg25832proj Ok")

} catch(error) {
  console.error(error)
}

// Test createTranslator
try {

  const translator = createTranslator()
  const forwarded_coors = translator.forward([10.31,55.37])
  const inverse_coors = translator.inverse(forwarded_coors)

  assert.strictEqual(forwarded_coors[0], 583023.3267001238, "Failed to forward coordinates")
  assert.strictEqual(inverse_coors[0], 10.31, "Failed to inverse coordinates")
  
  console.log("Test createTranslator Ok")

} catch(error) {
  console.error(error)
}
