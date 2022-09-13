/**
 * SAUL API utilities 
 */

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

/** Returns JSON response data */
function HttpResponseHandler(response) {
  if (!response.ok) {
    error_msg = response.status
    interruptLoading()
    throw new Error(`HTTP error! Status: ${ response.status }`)
  }
  // We assume the returned data is JSON
  return response.json()
}

/** 
 * GET HTTP responsee from API
 * @param {string} url - API service URL, including endpoint paths and query parameters.
 * @param {object} [config] - Custom request configs. See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options
 * @returns {object} response object
 */
function get(url, config = {}) {
  if (!url) {
    console.error('Could not fetch data. Missing API URL')
  } else {
    startLoading()
    return fetch( url, {
      ...config,
      method: 'GET'
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
 * @param {{API_DHM_BASEURL: string, API_DHM_USERNAME: string, API_DHM_PASSWORD: string}} auth - API autentication data. See ../config.js.example for reference.
 * @returns {object} Response data
 */
function getDHM(query, auth) {
  const auth_params = `&username=${auth.API_DHM_USERNAME}&password=${auth.API_DHM_PASSWORD}`
  return get(encodeURI(auth.API_DHM_BASEURL + query + auth_params))
  .then((data) => data)
}

/** 
 * API method to GET data from STAC API
 * @param {string} query - STAC API query.
 * @param {{API_STAC_BASEURL: string, API_STAC_TOKEN: string}} auth - API autentication data. See ../config.js.example for reference.
 * @returns {object} Response data
 */
function getSTAC(query, auth) {
  return get(auth.API_STAC_BASEURL + query, {headers: {'token': auth.API_STAC_TOKEN}})
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

export {
  get,
  post,
  getSTAC,
  postSTAC,
  getDHM
}
