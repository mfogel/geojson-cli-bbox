#!/usr/bin/env node

const process = require('process')

require('yargs')
  .command(
    'add',
    'Add or update all bounding boxes',
    yargs => yargs.demandCommand(0, 0),
    () => add(process.stdin, process.stdout)
  )
  .command(
    'remove',
    'Remove all bounding boxes',
    yargs => yargs.demandCommand(0, 0),
    () => remove(process.stdin, process.stdout)
  )
  .demandCommand(1, 'Please specify a command')
  .alias('h', 'help')
  .alias('v', 'version')
  .epilogue('Input is read from stdin, output is written to stdout')
  .strict()
  .parse()

function add (streamIn, streamOut) {
  console.log('do the add')
}

function remove (streamIn, streamOut) {
  console.log('do the remove')
}
