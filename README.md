# geojson-cli-bbox

Add, update, or remove bounding boxes from your GeoJSON files.

[![npm version](https://img.shields.io/npm/v/geojson-cli-bbox.svg)](https://www.npmjs.com/package/geojson-cli-bbox)
[![build status](https://img.shields.io/travis/mfogel/geojson-cli-bbox/master.svg)](https://travis-ci.org/mfogel/geojson-cli-bbox)
[![test coverage](https://img.shields.io/coveralls/mfogel/geojson-cli-bbox/master.svg)](https://coveralls.io/r/mfogel/geojson-cli-bbox)

## Quickstart

```sh
$ npm install -g geojson-cli-bbox
$ cat world.geojson | geojson-cli-bbox add > world-with-bboxes.geojson
```

## Commands

### geojson-cli-bbox add

Add missing `bbox` values and update existing incorrect or non-optimal `bbox` values.

### geojson-cli-bbox remove

Remove all `bbox` values.

## Options

### `-s` / `--silent`

Send any warnings (normally written to `stderr`) straight to `/dev/null`.

## Changelog

### 0.2.2

* Set up CI: travis, coveralls

### 0.2.1

* Add license file

### 0.2

* Internally, use [Transform streams](https://nodejs.org/docs/latest-v9.x/api/stream.html#stream_implementing_a_transform_stream)

### 0.1

* Initial release
