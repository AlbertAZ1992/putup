const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const moment = require('moment');

async function post(fileName, options, layout, content) {
  const cwd = options.cwd || process.cwd();
  const postPath = path.resolve(cwd, './posts', `${fileName}.md`);
  const postData = [
    '----',
    `title: ${fileName}`,
    `date: ${moment().format('YYYY-MM-DD')}`,
    `layout: ${layout || 'post'}`,
    '----',
    `${content || ''}`
  ].join('\n');

  if (fs.existsSync(postPath)) {
    if (options.force) {
      await fs.remove(postPath);
    } else {
      const { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: `Target file ${chalk.cyan(fileName)}.md already exists in posts dir. Pick an action:`,
          choices: [
            { name: 'Overwrite', value: 'overwrite' },
            { name: 'Cancel', value: false }
          ]
        }
      ]);
      if (!action) {
        return;
      } else if (action === 'overwrite') {
        console.log(`\nRemoving ${chalk.cyan(`${fileName}.md`)} ...`);
        await fs.remove(postPath);
      }
    }
  }

  console.log(`\nPosting ${chalk.cyan(`${fileName}.md`)} ...`);
  await fs.outputFile(postPath, postData);
}

module.exports = (...args) => {
  return post(...args).catch(error => {
    console.error(chalk.bgRed(' ERROR '), chalk.red(error));
    process.exit(1);
  })
};
