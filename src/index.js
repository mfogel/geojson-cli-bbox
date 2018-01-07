const { Transform } = require('stream')
const geojsonhint = require('@mapbox/geojsonhint')
const turfBBox = require('@turf/bbox')
const toString = require('stream-to-string')

const addBBoxes = geojson => {
  /* Input geojson altered in-place! */
  removeBBoxes(geojson)

  const bbox = [Infinity, Infinity, -Infinity, -Infinity]
  const updateBBox = newBbox => {
    bbox[0] = Math.min(bbox[0], newBbox[0])
    bbox[1] = Math.min(bbox[1], newBbox[1])
    bbox[2] = Math.max(bbox[2], newBbox[2])
    bbox[3] = Math.max(bbox[3], newBbox[3])
  }

  if (geojson['geometry']) updateBBox(addBBoxes(geojson['geometry']))
  if (geojson['geometries']) {
    geojson['geometries'].forEach(geom => updateBBox(addBBoxes(geom)))
  }
  if (geojson['features']) {
    geojson['features'].forEach(geom => updateBBox(addBBoxes(geom)))
  }

  if (geojson['coordinates']) updateBBox(turfBBox(geojson))
  geojson['bbox'] = bbox

  return bbox // For recursion
}

const removeBBoxes = geojson => {
  /* Input geojson altered in-place! */
  delete geojson['bbox']
  if (geojson['geometry']) removeBBoxes(geojson['geometry'])
  if (geojson['geometries']) {
    geojson['geometries'].forEach(removeBBoxes)
  }
  if (geojson['features']) {
    geojson['features'].forEach(removeBBoxes)
  }
}

const parseGeojsonStr = (str, warn = console.warn) => {
  let geojson
  try {
    geojson = JSON.parse(str)
  } catch (err) {
    throw SyntaxError(`Unable to parse input as JSON: ${err.message}`)
  }

  const errors = geojsonhint.hint(geojson)
  errors.forEach(e =>
    warn(
      `Warning: Input is not valid GeoJSON: ${e.message}\n`,
      ` Attempting requested operation anyway`
    )
  )

  return geojson
}

const wrapWithStreams = func => {
  return (streamIn, streamOut, silent = false) => {
    const warn = silent ? () => {} : undefined
    return toString(streamIn, 'utf8').then(str => {
      let geojson = parseGeojsonStr(str, warn)
      func(geojson)
      streamOut.write(JSON.stringify(geojson))
      streamOut.end()
    })
  }
}

class RemoveBBoxes extends Transform {
  constructor (options = {}) {
    options['decodeStrings'] = false
    super(options)
  }

  _transform (chunk, encoding, callback) {
    let geojson = parseGeojsonStr(chunk)
    removeBBoxes(geojson)
    callback(null, JSON.stringify(geojson))
  }
}

module.exports = {
  addBBoxes,
  removeBBoxes,
  wrapWithStreams,
  RemoveBBoxes
}
