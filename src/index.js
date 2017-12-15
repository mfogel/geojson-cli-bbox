const geojsonhint = require('@mapbox/geojsonhint')
const toString = require('stream-to-string')

const addBBoxes = geojson => {
  removeBBoxes(geojson)
  // TODO: do the add
}

const removeBBoxes = geojson => {
  delete geojson['bbox']
  if (geojson['geometry']) removeBBoxes(geojson['geometry'])
  if (geojson['geometries']) {
    geojson['geometries'].forEach(removeBBoxes)
  }
  if (geojson['features']) {
    geojson['features'].forEach(removeBBoxes)
  }
}

const parseGeojsonStr = str => {
  let geojson
  try {
    geojson = JSON.parse(str)
  } catch (err) {
    throw SyntaxError(`Unable to parse input as JSON: ${err.message}`)
  }

  const errors = geojsonhint.hint(geojson)
  if (errors[0]) {
    throw SyntaxError(`Input is not valid GeoJSON: ${errors[0].message}`)
  }
  return geojson
}

const wrapWithStreams = func => {
  return (streamIn, streamOut) => {
    return toString(streamIn, 'utf8').then(str => {
      let geojson = parseGeojsonStr(str)
      func(geojson)
      streamOut.write(JSON.stringify(geojson))
    })
  }
}

module.exports = { addBBoxes, removeBBoxes, wrapWithStreams }
