import auth from '../config.js'
import { getElevation, visualizeGeotiff } from '../modules/saul-elevation.js'
import { getImageXY, getWorldXYZ } from '../modules/saul-core.js'
import { getDenmarkGeoTiff, consumeGeoTIFF } from '../modules/api.js'

const geoTiffResolution = 1000

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
  return fetch(`https://services.datafordeler.dk/DHMTerraen/DHMKoter/1.0.0/GEOREST/HentKoter?geop=POINT(${worldXY[0]} ${worldXY[1]})&elevationmodel=dtm&username=${auth.API_DHM_TOKENA}&password=${auth.API_DHM_TOKENB}`)
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

/*
 * Example request to get terrain data for all of DK
 * https://services.datafordeler.dk/DHMNedboer/dhm_wcs/1.0.0/WCS?SERVICE=WCS&COVERAGE=dhm_terraen&RESPONSE_CRS=epsg:25832&CRS=epsg:25832&FORMAT=GTiff&REQUEST=GetCoverage&VERSION=1.0.0&username=QKJBQATHVS&password=ytxCA8UGM5n0Z*zi&height=1000&width=1000&bbox=430000,6040000,900000,6413000
 */

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

// Get GTiff from API
// const DKGeoTiff = await getDenmarkGeoTiff({auth: auth, size: geoTiffResolution})

// Get big GTiff
const DKGeoTiff = await getDenmarkGeoTiff({src: 'http://localhost:7701/dk-terrain.tiff'})

// Get tiny GTiff
//const DKGeoTiff = await getDenmarkGeoTiff({src: 'http://localhost:7701/tiny-dk-terrain.tiff'})

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
const calcdImageXY10 = getImageXY(imgData1, ...calcdWorldXYZ0)
const calcdWorldXYZ10 = await getWorldXYZ({
  xy: calcdImageXY10, 
  image: imgData1, 
  terrain: DKGeoTiff
})

function getRandomPoint() {
  const bbox = [430000,6040000,900000,6413000]
  const width = bbox[2] - bbox[0]
  const height = bbox[3] - bbox[1]
  const randomX = bbox[0] + (Math.random() * width)
  const randomY = bbox[1] + (Math.random() * height)
  return [randomX, randomY]
}

const randomPoint1 = getRandomPoint()
const randomPoint2 = getRandomPoint()
const randomPoint3 = getRandomPoint()
const randomPoint4 = getRandomPoint()
const randomPoint5 = getRandomPoint()
const randomPoint6 = getRandomPoint()
const randomPoint7 = getRandomPoint()
const randomPoint8 = getRandomPoint()
const randomPoint9 = getRandomPoint()
const randomPoint10 = getRandomPoint()

console.log('From origin, use world coordinate to calculate image coordinate.')
console.log('Then uses that image coordinate to calculate world coordinate and feed it into the next image calculations.')
console.table({
  origins: {worldxyz: worldxy, imagexy: image1xy},
  image1: {worldxyz: calcdWorldXYZ1, imagexy: image1xy},
  image2: {worldxyz: calcdWorldXYZ2, imagexy: calcdImageXY2},
  image3: {worldxyz: calcdWorldXYZ3, imagexy: calcdImageXY3},
  image4: {worldxyz: calcdWorldXYZ4, imagexy: calcdImageXY4},
  image0: {worldxyz: calcdWorldXYZ0, imagexy: calcdImageXY0},
  back_to_image1: {worldxyz: calcdWorldXYZ10, imagexy: calcdImageXY10}
})

console.log('Using image px coordinate to calculate a world coordinate and back again.')
console.table({
  imageXY: {
    original: [8566,4105],
    'round-trip': getImageXY(imgData1, ...calcdWorldXYZ0)
  }
})

console.log('Samle elevations fetched from kote API or calculated from GeoTiff:')
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
  },
  'Random 1': {
    kote: await fetchKote(randomPoint1),
    gtiff: await getElevation(...randomPoint1, DKGeoTiff)
  },
  'Random 2': {
    kote: await fetchKote(randomPoint2),
    gtiff: await getElevation(...randomPoint2, DKGeoTiff)
  },
  'Random 3': {
    kote: await fetchKote(randomPoint3),
    gtiff: await getElevation(...randomPoint3, DKGeoTiff)
  },
  'Random 4': {
    kote: await fetchKote(randomPoint4),
    gtiff: await getElevation(...randomPoint4, DKGeoTiff)
  },
  'Random 5': {
    kote: await fetchKote(randomPoint5),
    gtiff: await getElevation(...randomPoint5, DKGeoTiff)
  },
  'Random 6': {
    kote: await fetchKote(randomPoint6),
    gtiff: await getElevation(...randomPoint6, DKGeoTiff)
  },
  'Random 7': {
    kote: await fetchKote(randomPoint7),
    gtiff: await getElevation(...randomPoint7, DKGeoTiff)
  },
  'Random 8': {
    kote: await fetchKote(randomPoint8),
    gtiff: await getElevation(...randomPoint8, DKGeoTiff)
  },
  'Random 9': {
    kote: await fetchKote(randomPoint9),
    gtiff: await getElevation(...randomPoint9, DKGeoTiff)
  },
  'Random 10': {
    kote: await fetchKote(randomPoint10),
    gtiff: await getElevation(...randomPoint10, DKGeoTiff)
  }
})

console.log('got DKGeotiff', (DKGeoTiff.source.arrayBuffer.byteLength / 1024), 'Kb', pointø)

//visualizeGeotiff(DKGeoTiff)
