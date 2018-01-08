const { Transform } = require('stream')
const geojsonhint = require('@mapbox/geojsonhint')
const turfBBox = require('@turf/bbox')
const toString = require('stream-to-string')

const addUpdateBBoxes = geojson => {
  /* Input geojson altered in-place! */
  const bbox = [Infinity, Infinity, -Infinity, -Infinity]
  const updateBBox = newBbox => {
    bbox[0] = Math.min(bbox[0], newBbox[0])
    bbox[1] = Math.min(bbox[1], newBbox[1])
    bbox[2] = Math.max(bbox[2], newBbox[2])
    bbox[3] = Math.max(bbox[3], newBbox[3])
  }

  if (geojson['geometry']) updateBBox(addUpdateBBoxes(geojson['geometry']))
  if (geojson['geometries']) {
    geojson['geometries'].forEach(geom => updateBBox(addUpdateBBoxes(geom)))
  }
  if (geojson['features']) {
    geojson['features'].forEach(geom => updateBBox(addUpdateBBoxes(geom)))
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

class GeojsonNullTransform extends Transform {
  constructor (options = {}) {
    options['decodeStrings'] = false
    super(options)
    this.input = ''
  }

  _transform (chunk, encoding, callback) {
    this.input += chunk
    callback()
  }

  _flush (callback) {
    let geojson = parseGeojsonStr(this.input)
    this.operate(geojson)
    callback(null, JSON.stringify(geojson))
  }

  operate (geojson) {
    // makes for easy testing
    return geojson
  }
}

class RemoveBBoxes extends GeojsonNullTransform {
  operate (geojson) {
    removeBBoxes(geojson)
  }
}

class AddUpdateBBoxes extends GeojsonNullTransform {
  operate (geojson) {
    addUpdateBBoxes(geojson)
  }
}

module.exports = {
  addUpdateBBoxes,
  removeBBoxes,
  wrapWithStreams,
  GeojsonNullTransform,
  AddUpdateBBoxes,
  RemoveBBoxes
}
