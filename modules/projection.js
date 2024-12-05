/**
 * SAUL map projection and transformation utilities 
 */

import proj4 from 'proj4'

/** Defines an EPSG:25832 projection using proj4.
 * Learn about EPSG:25832 at https://epsg.io/25832 and proj4 at http://proj4js.org/
 * EPSG:25832 definition can be requested at Definition can be requested from https://epsg.io/?format=json&q=25832
 * @param {object} proj4object - a proj4 instance
 * @returns {object} Returns same proj4 instance with an added EPSG:25832 projection definition
 */
function epsg25832proj(proj4object) {
  proj4object.defs('EPSG:25832', "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs")
  return proj4object
}

/** Creates an object with methods for translating coordinates from one projection to the other
 * @param {string} [projection1] - from Projection
 * @param {string} [projection2] - to projection
 * @returns {object} An object with two methods is returned, its methods are `forward` which projects from the first projection to the second and `inverse` which projects from the second to the first.
 */
function createTranslator(projection1 = 'WGS84', projection2 = 'EPSG:25832') {
  if (!proj4.defs['EPSG:25832']) {
    epsg25832proj(proj4) // Define EPSG:25832 projection if missing
  }
  return proj4(projection1, projection2)
}

export {
  epsg25832proj,
  createTranslator
}