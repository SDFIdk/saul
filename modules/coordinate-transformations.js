import {get} from './api.js'

function WGS84toEPSG25832(latitude, longitude) {
  return get(`https://api.dataforsyningen.dk/rest/webproj/v1.0/trans/EPSG%3A4326/EPSG%3A25832/${latitude},${longitude}`)
  .then((result) => {
      console.log(result)
      return result
  })
}

export {
  WGS84toEPSG25832
}
