#!/usr/bin/env node

const { stdin, stdout, exit } = require('process')
const { addBBoxes, removeBBoxes, wrapWithStreams } = require('./index.js')

const onError = err => {
  console.error(err.message)
  exit(1)
}

require('yargs')
  .command(
    'add',
    'Add or update all bounding boxes',
    yargs => yargs.demandCommand(0, 0),
    () => wrapWithStreams(addBBoxes)(stdin, stdout).catch(onError)
  )
  .command(
    'remove',
    'Remove all bounding boxes',
    yargs => yargs.demandCommand(0, 0),
    () => wrapWithStreams(removeBBoxes)(stdin, stdout).catch(onError)
  )
  .demandCommand(1, 'Please specify a command')
  .alias('h', 'help')
  .alias('v', 'version')
  .epilogue('Input is read from stdin, output is written to stdout')
  .strict()
  .parse()
