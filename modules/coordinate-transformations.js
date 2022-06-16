import {get} from './api.js'

/** 
 * Converts WGS84 lat/lon coordinates to EPSG25832 
 * @param {number} longitude - WGS84 longitude (x)
 * @param {number} latitude - WGS84 latitude (y)
 * @param {object} env - Environment variables for API authentication. See ../config.js.example for reference.
 */
function WGS84toEPSG25832(longitude, latitude, env) {
  return get(`https://api.dataforsyningen.dk/rest/webproj/v1.0/trans/EPSG%3A4326/EPSG%3A25832/${latitude},${longitude}?token=${env.API_STAC_TOKEN}`)
  .then((result) => {
      return result
  })
}

export {
  WGS84toEPSG25832
}
