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
    yargs =>
      wrapWithStreams(addBBoxes)(stdin, stdout, yargs.silent).catch(onError)
  )
  .command(
    'remove',
    'Remove all bounding boxes',
    yargs => yargs.demandCommand(0, 0),
    yargs =>
      wrapWithStreams(removeBBoxes)(stdin, stdout, yargs.silent).catch(onError)
  )
  .demandCommand(1, 'Please specify a command')
  .option('s', {
    alias: 'silent',
    describe: 'Do not write warnings to stderr',
    boolean: true
  })
  .alias('h', 'help')
  .alias('v', 'version')
  .epilogue('Input is read from stdin, output is written to stdout')
  .strict()
  .parse()
