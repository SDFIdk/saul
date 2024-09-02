/**
 * SAUL API utilities
 */

import { fromArrayBuffer } from 'geotiff'

let error_msg
let load_stack = []

// These custom events can only be created in a browser environment
const loadstart = isBrowser() ? new CustomEvent('loadstart') : null
const loadend = isBrowser() ? new CustomEvent('loadend') : null
const loaderror = isBrowser() ? new CustomEvent('loaderror', {
  detail: {
    name: getErrorMsg()
  }
}) : null


/** Check if code is run in a Browser or Node enviroment */
function isBrowser() {
  // Check if the environment is Node.js
  if (typeof process === "object" &&
    typeof require === "function") {
    return false
  }
  // Check if the environment is
  // a Service worker
  if (typeof importScripts === "function") {
    return false
  }
  // Check if the environment is a Browser
  if (typeof window === "object") {
    return true
  }
}

/** Sends 'loadstart' event if nothing else is currently loading */
function startLoading() {
  if (isBrowser() && load_stack.length < 1) {
    document.dispatchEvent(loadstart)
  }
  load_stack.push(1)
}

/** Sends 'loadend' event if current loads have finished */
function endLoading() {
    load_stack.pop()
    if (isBrowser() && load_stack.length < 1) {
      document.dispatchEvent(loadend)
    }
}

/** Sends 'loaderror' event and resets load status */
function interruptLoading() {
  load_stack = []
  if (isBrowser()) {
    document.dispatchEvent(loaderror)
  }
}

/** Getter for error messages */
function getErrorMsg() {
  return error_msg
}

/** Returns response data */
function HttpResponseHandler(response, is_json) {
  if (!response.ok) {
    error_msg = response.status
    interruptLoading()
    throw new Error(`HTTP error! ${ response.status }`)
  }
  if (is_json) {
    // We assume the returned data is JSON
    return response.json()
  } else {
    // Return whatever and let someone else worry about parsing it
    return response
  }
  
}

/** 
 * GET HTTP responsee from API
 * @param {string} url - API service URL, including endpoint paths and query parameters.
 * @param {object} [config] - Custom request configs. See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options
 * @param {boolean} [is_json] - `true` if requested output is JSON
 * @returns {object} response object
 */
function get(url, config = {}, is_json = true) {
  if (!url) {
    console.error('Could not fetch data. Missing API URL')
  } else {
    startLoading()
    return fetch( url, {
      ...config,
      method: 'GET',
      mode: 'cors'
    })
    .then((response) => {
      return HttpResponseHandler(response, is_json)
    })
    .then((response) => {
      // Finally, return the parsed JSON response
      endLoading()
      return response
    })
    .catch((error) => {
      // ... unless something goes wrong
      console.error(`Fetch error: ${error}`)
      endLoading()
      return error
    })
  }
}

/** 
 * POST HTTP request to API
 * @param {string} url - API service URL, including endpoint paths and query parameters.
 * @param {object} requestbody - Request data
 * @param {string} token - Authentication token from Dataforsyningen
 * @returns {object} response object
 */
function post(url, requestbody, token) {
  if (!url || !token || !requestbody) {
    console.error('Could not fetch data. Missing API token, request body, or URL')
  } else {
    startLoading()
    return fetch( url, {
      method: 'POST',
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestbody)
    })
    .then((response) => {
      return HttpResponseHandler(response)
    })
    .then((response) => {
      // Finally, return the parsed JSON response
      endLoading()
      return response
    })
    .catch((error) => {
      // ... unless something goes wrong
      console.error(`Fetch error: ${error}`)
      endLoading()
      return error
    })
  }
}

/** 
 * API method to fetch data from DHM
 * @param {string} query - DHM API query. Find details at https://datafordeler.dk/dataoversigt/danmarks-hoejdemodel-dhm/koter/
 * @param {{API_DHM_BASEURL: string, API_DHM_TOKENA: string, API_DHM_TOKENB: string}} auth - API autentication data. See ../config.js.example for reference.
 * @returns {object} Response data
 */
function getDHM(query, auth) {
  const auth_params = `&username=${auth.API_DHM_TOKENA}&password=${auth.API_DHM_TOKENB}`
  return get(encodeURI(auth.API_DHM_BASEURL + query + auth_params), {cache: 'force-cache'})
  .then((data) => data)
}

/** 
 * API method to GET data from STAC API
 * @param {string} query - STAC API query string. May include endpoint path information.
 * @param {{API_STAC_BASEURL: string, API_STAC_TOKEN: string}} auth - API autentication data. See ../config.js.example for reference.
 * @returns {object} Response data
 */
function getSTAC(query, auth) {
  let requestUrl = `${auth.API_STAC_BASEURL}${query}`
  const queryStr = query.split('?')[1]
  if (queryStr) {
    requestUrl += `&token=${auth.API_STAC_TOKEN}`
  } else {
    requestUrl += `?token=${auth.API_STAC_TOKEN}`
  }
  return get(requestUrl)
  .then((data) => data)
}

/** 
 * API method to POST data to STAC API
 * @param {string} endpoint - STAC API endpoint. Ex. `/collections`
 * @param {object} data - request body
 * @param {{API_STAC_BASEURL: string, API_STAC_TOKEN: string}} auth - API autentication data. See ../config.js.example for reference.
 * @returns {object} Reponse data
 */
function postSTAC(endpoint, data, auth) {
  return post(auth.API_STAC_BASEURL + endpoint, data, auth.API_STAC_TOKEN)
  .then((data) => data)
}


/** Converts raw GeoTIFF arrayBuffer to image */
async function consumeGeoTIFF(raw_data) {
  const tiff = await fromArrayBuffer(raw_data)
  const image = await tiff.getImage()
  return image
}

function calcSizeRatio(sizeX, bbox) {
  const ratio = ( bbox[0] - bbox[2] ) / ( bbox[1] - bbox[3] )
  return Math.round(sizeX * ratio)
}


/** Fetches a GeoTIFF with elevation data matching the bounding box of a STAC API item (image)
 * @param {object} stac_item - STAC API item from a featureCollection request
 * @param {{API_DHM_WCS_BASEURL: string, API_DHM_TOKENA: string, API_DHM_TOKENB: string}} auth - API autentication data. See ../config.js.example for reference.
 * @param {number} [resolution] - Resolution (1 - 0.01). Higher number means more pixels and better precision.
 * @returns {object} GeoTiff data
 */
function getTerrainGeoTIFF(stac_item, auth, resolution = 0.05, sizeX = 300) {
  
  const bbox = stac_item.bbox
  const sizeY = calcSizeRatio(sizeX, stac_item.bbox)
  const width = stac_item.properties ? Math.round( stac_item.properties['proj:shape'][0] * resolution ) : sizeX
  const height = stac_item.properties ? Math.round( stac_item.properties['proj:shape'][1] * resolution ) : sizeY

  // GET request for DHM WCS data
  let url = auth.API_DHM_WCS_BASEURL
  url += '?SERVICE=WCS&COVERAGE=dhm_terraen&RESPONSE_CRS=epsg:25832&CRS=epsg:25832&FORMAT=GTiff&REQUEST=GetCoverage&VERSION=1.0.0'
  url += `&username=${ auth.API_DHM_TOKENA }&password=${ auth.API_DHM_TOKENB }`
  url += `&height=${ height }`
  url += `&width=${ width }`
  url += `&bbox=${ bbox[0]},${ bbox[1]},${ bbox[2]},${ bbox[3]}`

  return get(url, {}, false)
  .then((response) => {
    return response.arrayBuffer()
  })
  .then((arrayBuffer) => {
    return consumeGeoTIFF(arrayBuffer)
  })
}

/**
 * Fetches a geoTIFF with elevation data covering all of Denmark
 * @param {*} auth - API autentication data. See ../config.js.example for reference.
 * @param {*} size - Size (width and height) of the returned geoTiff image
 * @returns GeoTIFF raster with elevation data
 */
function getDenmarkGeoTiff(auth, size = 300) {
  return getTerrainGeoTIFF({bbox: [425000,6030000,910000,6415000]}, auth, null, size)
}

export {
  get,
  post,
  getSTAC,
  postSTAC,
  getDHM,
  getTerrainGeoTIFF,
  getDenmarkGeoTiff
}
