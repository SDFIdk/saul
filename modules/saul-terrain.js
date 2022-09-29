/**
 * SAUL terrain methods
 */

import { get } from './api.js'

/** 
 * Fetches elevation based on X,Y coordinates using DHM/Koter endpoint
 * @param {number} xcoor - EPSG:25832 easting coordinate
 * @param {number} ycoor - EPSG:25832 northing coordinate
 * @param {{API_DHM_BASEURL: string, API_DHM_USERNAME: string, API_DHM_PASSWORD: string}} auth - API autentication data. See ../config.js.example for reference.
 * @returns {number} Elevation in meters 
 */
 async function getZ(xcoor, ycoor, auth) {
  let zcoor_data = await getDHM(`?geop=POINT(${xcoor} ${ycoor})&elevationmodel=dtm`, auth)
  let z = zcoor_data.HentKoterRespons.data[0].kote
  return z
}

/** Gathers elevation range extremes from terrain data */
function getZrange(terrain_data) {
  let sorted_data = terrain_data.sort(function(a,b) {
    if (a.kote > b.kote) {
      return -1
    } else if (b.kote > a.kote) {
      return 1
    } else {
      return 0
    }
  })
  let min = sorted_data[ sorted_data.length -1 ].kote
  let max = sorted_data[0].kote
  let mid = (min + max) / 2
  return [min, mid, max]
}

/** 
 * API method to fetch data from DHM
 * @param {string} query - DHM API query. Find details at https://datafordeler.dk/dataoversigt/danmarks-hoejdemodel-dhm/koter/
 * @param {{API_DHM_BASEURL: string, API_DHM_USERNAME: string, API_DHM_PASSWORD: string}} auth - API autentication data. See ../config.js.example for reference.
 * @returns {object} Response data
 */
 function getDHM(query, auth) {
  const auth_params = `&username=${auth.API_DHM_USERNAME}&password=${auth.API_DHM_PASSWORD}`
  return get(encodeURI(auth.API_DHM_BASEURL + query + auth_params))
  .then((data) => data)
}

/** 
 * API method to fetch DHM terrain data in a given area
 * @param {[x1 ,y1, x2, y2]} bbox - Array of EPSG:25832 coordinates for a bounding box describing the area we want terrain data for.
 * @param {{API_DHM_BASEURL: string, API_DHM_USERNAME: string, API_DHM_PASSWORD: string}} auth - API autentication data. See ../config.js.example for reference.
 * @param {array} [points] - Optional extra coordinates [lat,lon] you want included in the terrain data. (Max. 20 points)
 * @returns {object} Response data
 */
function getTerrain(bbox, auth, points) {

  // Normalize bbox values
  const bbox_ = bbox.map(function(coord) {
    return Math.round(coord)
  })

  // Declare variables
  const sampling_steps_x = 3
  const sampling_steps_y = 3
  const range_x = Math.round( ( bbox_[2] - bbox_[0] ) / sampling_steps_x )
  const range_y = Math.round( ( bbox_[3] - bbox_[1] ) / sampling_steps_y )
  let coordinate_map = []
  
  // Populate coordinate_map with coordinates covering the bbox' area
  for (let y = bbox_[1]; y < bbox_[3]; y = y + range_y) {
    for (let x = bbox_[0]; x < bbox_[2]; x = x + range_x) {
      coordinate_map.push([x,y])
    }
  }
  if (points && points.length < 20) { // For a total max of 50 points in request
    points.forEach(function(point) {
      coordinate_map.push(point)
    })  
  }

  // Create a query string for the API GET request
  let geop_string = "geop="
  coordinate_map.forEach(function(coord, idx) {
    if (idx > 0) {
      geop_string += '|'
    } 
    geop_string += `POINT(${coord[0]} ${coord[1]})`
  })

  // Request terrain data from DHM
  return getDHM(`?${geop_string}&elevationmodel=dtm`, auth).then((response) => {
    if (response.HentKoterRespons.data) {
      return normalizeTerrainData(response.HentKoterRespons.data)
    } else {
      return response
    }
  })
}

/**
 * Checks whether two numbers are equal enough within a given limit
 * @param {number} num1 - First number to check
 * @param {number} num2 - Second number to check
 * @param {number} [deviation] - The numbers may be off by this amount. Default is 0.5
 * @returns {boolean} `true` if numbers are approximately equal
 */
 function checkDeviation(num1, num2, deviation = 0.3) {
  if (Math.abs(num1 - num2) >= deviation) {
    return false
  } else {
    return true
  }
}

/**
 * Converts terrain coordinate strings into numbers
 * @param {array} terrain_data - Raw terrain data from DHM response
 * @returns {array} Terrain data with number coordinates
 */
function normalizeTerrainData(terrain_data) {
  let new_terrain = terrain_data.map(function(t) {
    const coord = t.geop.split(',')
    return {geop: [ Number(coord[0]), Number(coord[1]) ], kote: t.kote}
  })
  return new_terrain
}

export {
  getZ,
  getZrange,
  getTerrain,
  getDHM
}