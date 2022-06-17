/**
 * SAUL API utilities 
 */

/** Returns JSON response data */
function HttpResponseHandler(response) {
  if (!response.ok) {
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
    console.log('what config', config)
  } else {
    return fetch( url, {
      ...config,
      method: 'GET'
    })
    .then((response) => {
      return HttpResponseHandler(response)
    })
    .then((response) => {
      // Finally, return the parsed JSON response
      return response
    })
    .catch((error) => {
      // ... unless something goes wrong
      console.error(`Fetch error: ${error}`)
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
      return response
    })
    .catch((error) => {
      // ... unless something goes wrong
      console.error(`Fetch error: ${error}`)
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
