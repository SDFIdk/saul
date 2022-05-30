/**
 * SAUL API utilities 
 */

/** 
 * GET HTTP responsee from API
 * @param {String} url - API service URL, including endpoint paths and query parameters.
 * @param {String} token - Authentication token from Dataforsyningen
 */
function get(url, token) {
  if (!url || !token) {
    console.error('Could not fetch data. Missing API token or URL')
  } else {
    return fetch( url, {
      headers: {
        'token': token
      }
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${ response.status }`)
      }
      // We assume the returned data is JSON
      return response.json()
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

export { 
  get
}
