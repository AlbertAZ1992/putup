const express = require('express');
const staticServe = require('serve-static');
const path = require('path');
const chalk = require('chalk');

function preview(options) {
  const app = express();
  const port = 3000;
  const cwd = options.cwd || process.cwd();
  const destDir = options.dest ? path.resolve(cwd, options.dest) : path.resolve(cwd, './dist');
  app.use(staticServe(path.resolve(destDir)));
  app.listen(port, (error) => {
    if (error) {
      console.log(error);
      process.exit(1);
    }
    console.log(`\n Blog site has been started at localhost: ${chalk.cyan(port)}`);
    console.log(`\n Press CTRL+C to quit~`)
  });
  return;
}

module.exports = (...args) => {
  return preview(...args)
};
