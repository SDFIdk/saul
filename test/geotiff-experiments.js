import auth from '../config.js'
import { fromArrayBuffer } from 'geotiff'
import { getElevation } from '../modules/saul-elevation.js'
import { image2world, getImageXY, getWorldXYZ } from '../modules/saul-core.js'
import { getDenmarkGeoTiff } from '../modules/api.js'

import assert from 'assert'

const API_DHM_TOKENA = "QKJBQATHVS"
const API_DHM_TOKENB = "ytxCA8UGM5n0Z*zi"

const worldxy = [533344, 6172951] // World XY Point in all images near Vejle
const image1xy = [8566,4105] // Point/Image XY in `image1`
const image1 = '2023_83_29_2_0019_00001130' // Vejle N
const image2 = '2023_83_29_4_0017_00001752' // Vejle E
const image3 = '2023_83_29_3_0019_00001149' // Veje S
const image4 = '2023_83_29_5_0022_00002826' // Vejle W
const image0 = '2023_83_29_1_0019_00001139' // Vejle Nadir

const point1 = [724400, 6175773] // Rådhuspladsen
const point2 = [595686, 6170394] // In the sea
const point3 = [542656, 6217825] // Near Himmelbjerg
const point4 = [480770, 6087529] // Marshes in the west
const point5 = [533394, 6173015] // Steep street in Vejle
const point6 = [533381, 6173108] // Vejle 2
const point7 = [533339, 6172860] // Vejle 3

const pointn = [596610, 6402161] // Skagen
const points = [692008, 6049902] // Gedser
const pointø = [892999, 6147725] // Christians Ø
const pointv = [441977, 6157385] // Blåvands hug

function fetchKote(worldXY) {
  return fetch(`https://services.datafordeler.dk/DHMTerraen/DHMKoter/1.0.0/GEOREST/HentKoter?geop=POINT(${worldXY[0]} ${worldXY[1]})&elevationmodel=dtm&username=${API_DHM_TOKENA}&password=${API_DHM_TOKENB}`)
  .then((response) => {
    return response.json()
  })
  .then((kote) => {
    return kote.HentKoterRespons.data[0].kote
  })
}

function fetchImageData(imageId) {
  return fetch(`https://api.dataforsyningen.dk/rest/skraafoto_api/v1.0/search?limit=1&crs=http://www.opengis.net/def/crs/EPSG/0/25832&ids=${imageId}&token=e88d7be6754140025ebeb63d57e991ae`)
  .then((response) => response.json())
  .then((data) => {
    return data.features[0]
  })
}

console.log('-------------------------------------------------------')
console.log('-- Experiments with pan-Danish GeoTiff terrain model --')
console.log('-------------------------------------------------------')

/* 
It should
- fetch geotiff from all of DK
- fetch image data from several images covering the same area
- should simulate a click in one image (img1 at [8566,4105])
- should calculate worldxyz 1 from that click
- should calculate imagexy in another image
- should calculate worldxyz 2 from that imagexy
- should compare worldxyz 1 and worldxyz 2
- should compare worldxyz 1 z and worldxyz 2 z and kote
*/

const DKGeoTiff = await getDenmarkGeoTiff(auth, 500)
const imgData0 = await fetchImageData(image0)
const imgData1 = await fetchImageData(image1)
const imgData2 = await fetchImageData(image2)
const imgData3 = await fetchImageData(image3)
const imgData4 = await fetchImageData(image4)

// Simulate click in image north at [8566,4105]
const calcdWorldXYZ1 = await getWorldXYZ({
  xy: image1xy, 
  image: imgData1, 
  terrain: DKGeoTiff
})
const calcdImageXY2 = getImageXY(imgData2, ...calcdWorldXYZ1)
const calcdWorldXYZ2 = await getWorldXYZ({
  xy: calcdImageXY2, 
  image: imgData2, 
  terrain: DKGeoTiff
})
const calcdImageXY3 = getImageXY(imgData3, ...calcdWorldXYZ2)
const calcdWorldXYZ3 = await getWorldXYZ({
  xy: calcdImageXY3, 
  image: imgData3, 
  terrain: DKGeoTiff
})
const calcdImageXY4 = getImageXY(imgData4, ...calcdWorldXYZ3)
const calcdWorldXYZ4 = await getWorldXYZ({
  xy: calcdImageXY4, 
  image: imgData4, 
  terrain: DKGeoTiff
})
const calcdImageXY0 = getImageXY(imgData0, ...calcdWorldXYZ4)
const calcdWorldXYZ0 = await getWorldXYZ({
  xy: calcdImageXY0, 
  image: imgData0, 
  terrain: DKGeoTiff
})

const kote = await fetchKote([calcdWorldXYZ0[0], calcdWorldXYZ0[1]])

console.table({
  origins: {worldxyz: worldxy, imagexy: image1xy},
  image1: {worldxyz: calcdWorldXYZ1, imagexy: image1xy},
  image2: {worldxyz: calcdWorldXYZ2, imagexy: calcdImageXY2},
  image3: {worldxyz: calcdWorldXYZ3, imagexy: calcdImageXY3},
  image4: {worldxyz: calcdWorldXYZ4, imagexy: calcdImageXY4},
  image0: {worldxyz: calcdWorldXYZ0, imagexy: calcdImageXY0}
})

console.table({
  elevations: {
    kote: kote,
    gtiff: calcdWorldXYZ0[2]
  }
})

console.table({
  imageXY: {
    original: [8566,4105],
    'round-trip': getImageXY(imgData1, ...calcdWorldXYZ0)
  }
})

console.table({
  'Rådhuspladsen': {
    kote: await fetchKote(point1),
    gtiff: await getElevation(...point1, DKGeoTiff)
  },
  'In the sea': {
    kote: await fetchKote(point2),
    gtiff: await getElevation(...point2, DKGeoTiff)
  },
  'Near Himmelbjerg': {
    kote: await fetchKote(point3),
    gtiff: await getElevation(...point3, DKGeoTiff)
  },
  'Marshes in the west': {
    kote: await fetchKote(point4),
    gtiff: await getElevation(...point4, DKGeoTiff)
  },
  'Vejle 1': {
    kote: await fetchKote(point5),
    gtiff: await getElevation(...point5, DKGeoTiff)
  },
  'Vejle 2': {
    kote: await fetchKote(point6),
    gtiff: await getElevation(...point6, DKGeoTiff)
  },
  'Vejle 3': {
    kote: await fetchKote(point7),
    gtiff: await getElevation(...point7, DKGeoTiff)
  },
  'Skagen': {
    kote: await fetchKote(pointn),
    gtiff: await getElevation(...pointn, DKGeoTiff)
  },
  'Gedser': {
    kote: await fetchKote(points),
    gtiff: await getElevation(...points, DKGeoTiff)
  },
  'Blåvand': {
    kote: await fetchKote(pointv),
    gtiff: await getElevation(...pointv, DKGeoTiff)
  },
  'Chr. Ø': {
    kote: await fetchKote(pointø),
    gtiff: await getElevation(...pointø, DKGeoTiff)
  }
})

console.log('got DKGeotiff', (DKGeoTiff.source.arrayBuffer.byteLength / 1024), 'Kb')
