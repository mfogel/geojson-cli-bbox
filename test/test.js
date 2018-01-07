/* eslint-env jest */

const fs = require('fs')
const stream = require('stream')
const toStream = require('string-to-stream')
const { addBBoxes, removeBBoxes, wrapWithStreams } = require('../src/index.js')

test('error on invalid json input', () => {
  const streamIn = toStream('this is some bad bad json')
  const dummy = wrapWithStreams(() => {})
  return expect(dummy(streamIn, null)).rejects.toEqual(expect.any(SyntaxError))
})

test('warn on valid json but invalid geojson input', () => {
  const streamIn = toStream('{"valid": "json, but not geojson"}')
  const dummy = wrapWithStreams(() => {})
  const streamOut = stream.PassThrough()

  console.warn = jest.fn()
  expect.assertions(1)
  return dummy(streamIn, streamOut).then(() => {
    expect(console.warn).toHaveBeenCalled()
  })
})

test('no warnings when silent', () => {
  const streamIn = toStream('{"valid": "json, but not geojson"}')
  const dummy = wrapWithStreams(() => {})
  const streamOut = stream.PassThrough()

  console.warn = jest.fn()
  expect.assertions(1)
  return dummy(streamIn, streamOut, true).then(() => {
    expect(console.warn).not.toHaveBeenCalled()
  })
})

const readInJson = path => JSON.parse(fs.readFileSync(path, 'utf8'))

test('remove bbox from single geometry', () => {
  let geojson = readInJson('test/geojson/polygon-right-bbox.geojson')
  removeBBoxes(geojson)
  expect(geojson).toEqual(readInJson('test/geojson/polygon-no-bbox.geojson'))
})

test('remove bboxes from GeometryCollection', () => {
  let geojson = readInJson('test/geojson/geometrycollection-right-bbox.geojson')
  removeBBoxes(geojson)
  expect(geojson).toEqual(
    readInJson('test/geojson/geometrycollection-no-bbox.geojson')
  )
})

test('remove bboxes from Feature', () => {
  let geojson = readInJson('test/geojson/feature-right-bbox.geojson')
  removeBBoxes(geojson)
  expect(geojson).toEqual(readInJson('test/geojson/feature-no-bbox.geojson'))
})

test('remove bboxes from FeatureCollection', () => {
  let geojson = readInJson('test/geojson/featurecollection-right-bbox.geojson')
  removeBBoxes(geojson)
  expect(geojson).toEqual(
    readInJson('test/geojson/featurecollection-no-bbox.geojson')
  )
})

test('add bbox to single geometry', () => {
  let geojson = readInJson('test/geojson/polygon-no-bbox.geojson')
  addBBoxes(geojson)
  expect(geojson).toEqual(readInJson('test/geojson/polygon-right-bbox.geojson'))
})

test('add bboxes to GeometryCollection', () => {
  let geojson = readInJson('test/geojson/geometrycollection-no-bbox.geojson')
  addBBoxes(geojson)
  expect(geojson).toEqual(
    readInJson('test/geojson/geometrycollection-right-bbox.geojson')
  )
})

test('add bbox to Feature', () => {
  let geojson = readInJson('test/geojson/feature-no-bbox.geojson')
  addBBoxes(geojson)
  expect(geojson).toEqual(readInJson('test/geojson/feature-right-bbox.geojson'))
})

test('add bbox to FeatureCollection', () => {
  let geojson = readInJson('test/geojson/featurecollection-no-bbox.geojson')
  addBBoxes(geojson)
  expect(geojson).toEqual(
    readInJson('test/geojson/featurecollection-right-bbox.geojson')
  )
})

test('update bbox to single geometry', () => {
  let geojson = readInJson('test/geojson/polygon-wrong-bbox.geojson')
  addBBoxes(geojson)
  expect(geojson).toEqual(readInJson('test/geojson/polygon-right-bbox.geojson'))
})

test('update bboxes to GeometryCollection', () => {
  let geojson = readInJson('test/geojson/geometrycollection-wrong-bbox.geojson')
  addBBoxes(geojson)
  expect(geojson).toEqual(
    readInJson('test/geojson/geometrycollection-right-bbox.geojson')
  )
})

test('update bbox to Feature', () => {
  let geojson = readInJson('test/geojson/feature-wrong-bbox.geojson')
  addBBoxes(geojson)
  expect(geojson).toEqual(readInJson('test/geojson/feature-right-bbox.geojson'))
})

test('update bbox to FeatureCollection', () => {
  let geojson = readInJson('test/geojson/featurecollection-wrong-bbox.geojson')
  addBBoxes(geojson)
  expect(geojson).toEqual(
    readInJson('test/geojson/featurecollection-right-bbox.geojson')
  )
})
