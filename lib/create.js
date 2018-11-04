const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const post = require('./post');

async function create(blogName, options) {
  const cwd = options.cwd || process.cwd();
  const inCurrent = blogName === '.';
  const name = inCurrent ? path.relative('../', cwd) : blogName;
  const targetDir = path.resolve(cwd, blogName || '.');
  const sourceDir = path.resolve(__dirname, './source');

  console.log(cwd, inCurrent, targetDir, sourceDir, name);

  if (fs.existsSync(targetDir)) {
    if (options.force) {
      await fs.remove(targetDir);
    } else {
      if (inCurrent) {
        const { ok } = await inquirer.prompt([
          {
            name: 'ok',
            type: 'confirm',
            message: `Generate your blog in current directory?`
          }
        ]);
        if (!ok) {
          return;
        }
      } else {
        const { action } = await inquirer.prompt([
          {
            name: 'action',
            type: 'list',
            message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
            choises: [
              { name: 'Overwrite', value: 'overwrite' },
              { name: 'Cancel', value: false }
            ]
          }
        ]);
        if (!action) {
          return;
        } else if (action === 'overwrite') {
          console.log(`\nRemoving ${chalk.cyan(targetDir)}...`);
          await fs.remove(targetDir);
        }
      }
    }
  }

  await fs.copy(sourceDir, targetDir);
  await post(targetDir);
}

module.exports = (...args) => {
  console.log(args);
  return create(...args).catch(error => {
    console.error(chalk.bgRed(' ERROR '), chalk.red(error));
    process.exit(1);
  })
};