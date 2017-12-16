# geojson-cli-bbox

A command-line tool to add, update, or remove bounding boxes from your geojson files.

## Quickstart

```sh
$ npm install -g geojson-cli-bbox
$ cat world.geojson | geojson-cli-bbox add > world-with-bboxes.geojson
```

## geojson-cli-bbox add

Add missing `bbox` values and update existing incorrect or non-optimal `bbox` values.

## geojson-cli-bbox remove

Remove all `bbox` values.
