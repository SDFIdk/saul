/**
 * SAUL API utilities 
 */

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

function getDHM(query, env) {
  const auth_params = `&username=${env.API_DHM_USERNAME}&password=${env.API_DHM_PASSWORD}`
  return get(encodeURI(env.API_DHM_BASEURL + query + auth_params))
  .then((data) => data)
}

function getSTAC(query, env) {
  return get(env.API_STAC_BASEURL + query, {headers: {'token': env.API_STAC_TOKEN}})
  .then((data) => data)
}

function postSTAC(endpoint, data, env) {
  return post(env.API_STAC_BASEURL + endpoint, data, env.API_STAC_TOKEN)
  .then((data) => data)
}

export {
  get,
  post,
  getSTAC,
  postSTAC,
  getDHM
}
