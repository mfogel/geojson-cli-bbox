/* eslint-env jest */

const fs = require('fs')
const stream = require('stream')
const toStream = require('string-to-stream')
const toString = require('stream-to-string')
const { addBBoxes, RemoveBBoxes, wrapWithStreams } = require('../src/index.js')

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

test('remove bbox from single geometry', () => {
  const strIn = streamIn('polygon-right-bbox.geojson')
  const remover = new RemoveBBoxes()
  const strOut = stream.PassThrough()
  strIn.pipe(remover).pipe(strOut)

  expect.assertions(1)
  return toString(strOut).then(function (str) {
    const jsonOut = JSON.parse(str)
    const jsonExp = readInJson('polygon-no-bbox.geojson')
    expect(jsonOut).toEqual(jsonExp)
  })
})

test('remove bboxes from GeometryCollection', () => {
  const strIn = streamIn('geometrycollection-right-bbox.geojson')
  const remover = new RemoveBBoxes()
  const strOut = stream.PassThrough()
  strIn.pipe(remover).pipe(strOut)

  expect.assertions(1)
  return toString(strOut).then(function (str) {
    const jsonOut = JSON.parse(str)
    const jsonExp = readInJson('geometrycollection-no-bbox.geojson')
    expect(jsonOut).toEqual(jsonExp)
  })
})

test('remove bboxes from Feature', () => {
  const strIn = streamIn('feature-right-bbox.geojson')
  const remover = new RemoveBBoxes()
  const strOut = stream.PassThrough()
  strIn.pipe(remover).pipe(strOut)

  expect.assertions(1)
  return toString(strOut).then(function (str) {
    const jsonOut = JSON.parse(str)
    const jsonExp = readInJson('feature-no-bbox.geojson')
    expect(jsonOut).toEqual(jsonExp)
  })
})

test('remove bboxes from FeatureCollection', () => {
  const strIn = streamIn('featurecollection-right-bbox.geojson')
  const remover = new RemoveBBoxes()
  const strOut = stream.PassThrough()
  strIn.pipe(remover).pipe(strOut)

  expect.assertions(1)
  return toString(strOut).then(function (str) {
    const jsonOut = JSON.parse(str)
    const jsonExp = readInJson('featurecollection-no-bbox.geojson')
    expect(jsonOut).toEqual(jsonExp)
  })
})

test('remove bboxes read in awkward chunks', () => {
  const strIn = readInStr('featurecollection-right-bbox.geojson')
  const remover = new RemoveBBoxes()
  const strOut = stream.PassThrough()
  remover.pipe(strOut)

  // feed the str in in 50 char increments
  for (let i = 0; (i += 50); i <= strIn.length) {
    remover.write(strIn.substr(i, i + 50))
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
  addBBoxes(geojson)
  expect(geojson).toEqual(readInJson('polygon-right-bbox.geojson'))
})

test('add bboxes to GeometryCollection', () => {
  let geojson = readInJson('geometrycollection-no-bbox.geojson')
  addBBoxes(geojson)
  expect(geojson).toEqual(readInJson('geometrycollection-right-bbox.geojson'))
})

test('add bbox to Feature', () => {
  let geojson = readInJson('feature-no-bbox.geojson')
  addBBoxes(geojson)
  expect(geojson).toEqual(readInJson('feature-right-bbox.geojson'))
})

test('add bbox to FeatureCollection', () => {
  let geojson = readInJson('featurecollection-no-bbox.geojson')
  addBBoxes(geojson)
  expect(geojson).toEqual(readInJson('featurecollection-right-bbox.geojson'))
})

test('update bbox to single geometry', () => {
  let geojson = readInJson('polygon-wrong-bbox.geojson')
  addBBoxes(geojson)
  expect(geojson).toEqual(readInJson('polygon-right-bbox.geojson'))
})

test('update bboxes to GeometryCollection', () => {
  let geojson = readInJson('geometrycollection-wrong-bbox.geojson')
  addBBoxes(geojson)
  expect(geojson).toEqual(readInJson('geometrycollection-right-bbox.geojson'))
})

test('update bbox to Feature', () => {
  let geojson = readInJson('feature-wrong-bbox.geojson')
  addBBoxes(geojson)
  expect(geojson).toEqual(readInJson('feature-right-bbox.geojson'))
})

test('update bbox to FeatureCollection', () => {
  let geojson = readInJson('featurecollection-wrong-bbox.geojson')
  addBBoxes(geojson)
  expect(geojson).toEqual(readInJson('featurecollection-right-bbox.geojson'))
})
