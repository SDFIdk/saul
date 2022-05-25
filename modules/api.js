/**
 * SAUL API utilities 
 */

/** 
 * HTTP GET request from API
 * @param {Object} service - API service object. Must contain `baseUrl` and `apiToken` properties
 * @param {String} params - path fragment and url parameters for a specific endpoint request
 */
function get(service, params) {
  if (!service.apiToken || !service.baseUrl) {
    console.error('Missing API token or URL')
    return false
  } else {
    return fetch( service.baseUrl + params, {
      headers: {
        'token': service.apiToken
      }
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${ response.status }`)
      }
      // We assume the returned data is JSON
      return JSON.parse(response)
    })
    .then((response) => {
      return response
    })
    .catch((error) => {
      console.error(`Fetch error: ${error}`)
      return error
    })
  }
}

export { 
  get
}
 