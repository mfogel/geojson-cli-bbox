#!/usr/bin/env node

const { stdin, stdout, exit } = require('process')
const { AddUpdateBBoxes, RemoveBBoxes } = require('./index.js')

const onError = err => {
  console.error(`Error: ${err.message}`)
  exit(1)
}

const getWarn = silent => (silent ? () => {} : console.warn)

require('yargs')
  .command(
    'add',
    'Add or update all bounding boxes',
    yargs => yargs.demandCommand(0, 0),
    yargs =>
      stdin
        .pipe(new AddUpdateBBoxes({ warn: getWarn(yargs.silent) }))
        .on('error', onError)
        .pipe(stdout)
  )
  .command(
    'remove',
    'Remove all bounding boxes',
    yargs => yargs.demandCommand(0, 0),
    yargs =>
      stdin
        .pipe(new RemoveBBoxes({ warn: getWarn(yargs.silent) }))
        .on('error', onError)
        .pipe(stdout)
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
