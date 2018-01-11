# geojson-cli-bbox

A command-line tool to add, update, or remove bounding boxes from your geojson files.

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

### 0.2.1

 * Add license file

### 0.2

* Internally, use [Transform streams](https://nodejs.org/docs/latest-v9.x/api/stream.html#stream_implementing_a_transform_stream)

### 0.1

* Initial release
