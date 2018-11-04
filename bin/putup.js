#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const slash = require('slash');
const minimist = require('minimist');

const program = require('commander');

program
  .version(require('../package.json').version, '-v, --version')
  .usage('<command> [options]');

program
  .command('create <blog-name>')
  .description('Create a new blog powered by putup')
  .option('-f, --force', 'Overwrite target directory if it exists')
  .action((name, cmd) => {
    const options = cleanArgs(cmd)
    require('../lib/create')(name, options);
  });



// // add some useful info on help
// program.on('--help', () => {
//   console.log()
//   console.log(`  Run ${chalk.cyan(`vue <command> --help`)} for detailed usage of given command.`)
//   console.log()
// })


program.on('--help', () => {
  console.log('  Examples:');
  console.log('');
  console.log('    this is an example');
  console.log('');
});

program.parse(process.argv);


function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

function cleanArgs(cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ''))
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}
