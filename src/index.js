const { Transform } = require('stream')
const geojsonhint = require('@mapbox/geojsonhint')
const turfBBox = require('@turf/bbox')

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

class GeojsonNullTransform extends Transform {
  constructor (options = {}) {
    options['decodeStrings'] = false
    super(options)
    this.warn = options['warn']
    this.input = ''
  }

  _transform (chunk, encoding, callback) {
    this.input += chunk
    callback()
  }

  _flush (callback) {
    try {
      let geojson = this.parse(this.input)
      this.operate(geojson)
      callback(null, JSON.stringify(geojson))
    } catch (err) {
      callback(err)
    }
  }

  parse (str) {
    let geojson
    try {
      geojson = JSON.parse(str)
    } catch (err) {
      throw new SyntaxError(`Unable to parse input as JSON: ${err.message}`)
    }

    const errors = geojsonhint.hint(geojson)
    errors.forEach(e =>
      this.warn(`Warning: Input is not valid GeoJSON: ${e.message}`)
    )

    return geojson
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
  GeojsonNullTransform,
  AddUpdateBBoxes,
  RemoveBBoxes
}
