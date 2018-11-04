const fs = require('fs-extra');
const path = require('path');

async function post(dir) {

  const postPath = path.resolve(dir, 'posts', 'Hello world.md');
  const postData = [
    'title: hello world',
    'date: 2018-09-20'
  ].join('\n');

  await fs.outputFile(postPath, postData);
}

module.exports = (...args) => {
  return post(...args).catch(error => {
    console.error(chalk.bgRed(' ERROR '), chalk.red(msg));
    process.exit(1);
  })
};
