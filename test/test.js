/* eslint-env jest */

const fs = require('fs')
const stream = require('stream')
const toStream = require('string-to-stream')
const toString = require('stream-to-string')
const {
  addUpdateBBoxes,
  removeBBoxes,
  GeojsonNullTransform,
  AddUpdateBBoxes,
  RemoveBBoxes,
  wrapWithStreams
} = require('../src/index.js')

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

const streamIn = fn => fs.createReadStream('test/geojson/' + fn, 'utf8')
const readInStr = fn => fs.readFileSync('test/geojson/' + fn, 'utf8')
const readInJson = fn => JSON.parse(readInStr(fn))

test('stream json in one chunk', () => {
  const strIn = streamIn('polygon-right-bbox.geojson')
  const nullTransform = new GeojsonNullTransform()
  const strOut = stream.PassThrough()
  strIn.pipe(nullTransform).pipe(strOut)

  expect.assertions(1)
  return toString(strOut).then(function (str) {
    const jsonOut = JSON.parse(str)
    const jsonExp = readInJson('polygon-right-bbox.geojson')
    expect(jsonOut).toEqual(jsonExp)
  })
})

test('stream json in awkward chunks', () => {
  const strIn = readInStr('featurecollection-right-bbox.geojson')
  const nullTransform = new GeojsonNullTransform()
  const strOut = stream.PassThrough()
  nullTransform.pipe(strOut)

  // feed the str in in 50 char increments
  for (let i = 0; i <= strIn.length; i += 50) {
    nullTransform.write(strIn.substr(i, 50))
  }
  nullTransform.end()

  expect.assertions(1)
  return toString(strOut).then(function (str) {
    const jsonOut = JSON.parse(str)
    const jsonExp = readInJson('featurecollection-right-bbox.geojson')
    expect(jsonOut).toEqual(jsonExp)
  })
})

test('remove bbox from single geometry', () => {
  let geojson = readInJson('polygon-right-bbox.geojson')
  removeBBoxes(geojson)
  expect(geojson).toEqual(readInJson('polygon-no-bbox.geojson'))
})

test('remove bboxes from GeometryCollection', () => {
  let geojson = readInJson('geometrycollection-right-bbox.geojson')
  removeBBoxes(geojson)
  expect(geojson).toEqual(readInJson('geometrycollection-no-bbox.geojson'))
})

test('remove bboxes from Feature', () => {
  let geojson = readInJson('feature-right-bbox.geojson')
  removeBBoxes(geojson)
  expect(geojson).toEqual(readInJson('feature-no-bbox.geojson'))
})

test('remove bboxes from FeatureCollection', () => {
  let geojson = readInJson('featurecollection-right-bbox.geojson')
  removeBBoxes(geojson)
  expect(geojson).toEqual(readInJson('featurecollection-no-bbox.geojson'))
})

test('end-to-end remove bboxes read in awkward chunks', () => {
  const strIn = readInStr('featurecollection-right-bbox.geojson')
  const remover = new RemoveBBoxes()
  const strOut = stream.PassThrough()
  remover.pipe(strOut)

  // feed the str in in 50 char increments
  for (let i = 0; i <= strIn.length; i += 50) {
    remover.write(strIn.substr(i, 50))
  }
  remover.end()

  expect.assertions(1)
  return toString(strOut).then(function (str) {
    const jsonOut = JSON.parse(str)
    const jsonExp = readInJson('featurecollection-no-bbox.geojson')
    expect(jsonOut).toEqual(jsonExp)
  })
})

test('add bbox to single geometry', () => {
  let geojson = readInJson('polygon-no-bbox.geojson')
  addUpdateBBoxes(geojson)
  expect(geojson).toEqual(readInJson('polygon-right-bbox.geojson'))
})

test('add bboxes to GeometryCollection', () => {
  let geojson = readInJson('geometrycollection-no-bbox.geojson')
  addUpdateBBoxes(geojson)
  expect(geojson).toEqual(readInJson('geometrycollection-right-bbox.geojson'))
})

test('add bbox to Feature', () => {
  let geojson = readInJson('feature-no-bbox.geojson')
  addUpdateBBoxes(geojson)
  expect(geojson).toEqual(readInJson('feature-right-bbox.geojson'))
})

test('add bbox to FeatureCollection', () => {
  let geojson = readInJson('featurecollection-no-bbox.geojson')
  addUpdateBBoxes(geojson)
  expect(geojson).toEqual(readInJson('featurecollection-right-bbox.geojson'))
})

test('end-to-end add bboxes read in awkward chunks', () => {
  const strIn = readInStr('featurecollection-no-bbox.geojson')
  const adder = new AddUpdateBBoxes()
  const strOut = stream.PassThrough()
  adder.pipe(strOut)

  // feed the str in in 50 char increments
  for (let i = 0; i <= strIn.length; i += 50) {
    adder.write(strIn.substr(i, 50))
  }
  adder.end()

  expect.assertions(1)
  return toString(strOut).then(function (str) {
    const jsonOut = JSON.parse(str)
    const jsonExp = readInJson('featurecollection-right-bbox.geojson')
    expect(jsonOut).toEqual(jsonExp)
  })
})

test('update bbox to single geometry', () => {
  let geojson = readInJson('polygon-wrong-bbox.geojson')
  addUpdateBBoxes(geojson)
  expect(geojson).toEqual(readInJson('polygon-right-bbox.geojson'))
})

test('update bboxes to GeometryCollection', () => {
  let geojson = readInJson('geometrycollection-wrong-bbox.geojson')
  addUpdateBBoxes(geojson)
  expect(geojson).toEqual(readInJson('geometrycollection-right-bbox.geojson'))
})

test('update bbox to Feature', () => {
  let geojson = readInJson('feature-wrong-bbox.geojson')
  addUpdateBBoxes(geojson)
  expect(geojson).toEqual(readInJson('feature-right-bbox.geojson'))
})

test('update bbox to FeatureCollection', () => {
  let geojson = readInJson('featurecollection-wrong-bbox.geojson')
  addUpdateBBoxes(geojson)
  expect(geojson).toEqual(readInJson('featurecollection-right-bbox.geojson'))
})

test('end-to-end update bboxes read in awkward chunks', () => {
  const strIn = readInStr('featurecollection-wrong-bbox.geojson')
  const updater = new AddUpdateBBoxes()
  const strOut = stream.PassThrough()
  updater.pipe(strOut)

  // feed the str in in 50 char increments
  for (let i = 0; i <= strIn.length; i += 50) {
    updater.write(strIn.substr(i, 50))
  }
  updater.end()

  expect.assertions(1)
  return toString(strOut).then(function (str) {
    const jsonOut = JSON.parse(str)
    const jsonExp = readInJson('featurecollection-right-bbox.geojson')
    expect(jsonOut).toEqual(jsonExp)
  })
})
