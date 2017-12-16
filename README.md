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

Sometimes it is better to say nothing at all. Any warnings, normally written to `stderr`, will be sent straight to `/dev/null`.
