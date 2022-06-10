/**
 * SAUL API utilities 
 */

// Get environment variables
const api_stac_baseurl = environment.API_STAC_BASEURL ? environment.API_STAC_BASEURL : ''
const api_stac_token = environment.API_STAC_TOKEN ? environment.API_STAC_TOKEN : ''
const api_dhm_baseurl = environment.API_DHM_BASEURL ? environment.API_DHM_BASEURL : ''
const api_dhm_username = environment.API_DHM_USERNAME ? environment.API_DHM_USERNAME : ''
const api_dhm_password = environment.API_DHM_PASSWORD ? environment.API_DHM_PASSWORD : ''

function HttpResponseHandler(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${ response.status }`)
  }
  // We assume the returned data is JSON
  return response.json()
}

/** 
 * GET HTTP responsee from API
 * @param {String} url - API service URL, including endpoint paths and query parameters.
 * @param {Object} [config] - Custom request configs. See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options
 */
function get(url, config = {}) {
  if (!url) {
    console.error('Could not fetch data. Missing API URL')
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
 * @param {String} url - API service URL, including endpoint paths and query parameters.
 * @param {Object} requestbody - Request data
 * @param {String} token - Authentication token from Dataforsyningen
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

function getDHM(query) {
  const auth_params = `&username=${api_dhm_username}&password=${api_dhm_password}`
  return get(encodeURI(api_dhm_baseurl + query + auth_params))
  .then((data) => data)
}

function getSTAC(query) {
  return get(api_stac_baseurl + query, {headers: {'token': api_stac_token}})
  .then((data) => data)
}

function postSTAC(endpoint, data) {
  return post(api_stac_baseurl + endpoint, data, api_stac_token)
  .then((data) => data)
}

export {
  get,
  getSTAC,
  postSTAC,
  getDHM
}
