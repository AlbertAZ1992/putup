const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { renderPostToHtml, parsePostContentToPostObj } = require('./utils/renderTools');
const { buildForProduction, getHtmlEntry, getHtmlEntryArray } = require('./utils/buildTools');

async function build(options) {
  const cwd = options.cwd || process.cwd();
  const postDir = path.resolve(cwd, './posts');
  const destDir = options.dest ? path.resolve(cwd, options.dest) : path.resolve(cwd, './dist');
  const layoutDir = path.resolve(__dirname, 'layout');
  const config = {};

  console.log(`\nRsolving posts in ${chalk.cyan(`${postDir}`)} ...`);
  let postsList = await resolvePosts(postDir);

  if (postsList && postsList.length) {
    console.log(`\nCleaning existing files in dest folder ${chalk.cyan(`${destDir}`)} ...`);
    await fs.remove(destDir);

    console.log(`\nRendering all posts in dest folder ${chalk.cyan(`${destDir}`)}...`);
    await renderAllPosts(postsList, layoutDir, destDir, config);

    console.log(`\nBuilding with Webpack`);
    const htmlEntry = getHtmlEntry('dist', postsList);
    const htmlEntryArray = getHtmlEntryArray('dist', postsList)
    const buildDir = path.resolve(cwd, './output');
    await buildForProduction(htmlEntry, htmlEntryArray, buildDir);

  } else {

    console.log(`\nNo posts in ${chalk.cyan(`${postDir}`)}.`);
    console.log(`\nTry to post a new markdown file with ${chalk.cyan(`post`)} command`);
    return
  }
}

async function resolvePosts(postDir) {
  const posts = await fs.readdir(postDir);
  if (posts && posts.length) {
    let postsList = [];
    for (let post of posts) {
      let postContent = fs.readFileSync(path.resolve(postDir, post)).toString();
      let postObj = parsePostContentToPostObj(postContent);
      let dateStr = postObj.dateInfo.join('/');
      let nameStr = postObj.title.trim();
      postObj.timeStamp = new Date(postObj.date);
      postObj.url = `/${dateStr}/${nameStr}/index.html`;
      postObj.js = `/${dateStr}/${nameStr}/index.js`;
      postsList.push(postObj);
    }
    return postsList;
  }
  return [];
}

async function renderAllPosts(postsList, layoutDir, targetDir, config) {
  for (postObj of postsList) {
    let layout = path.resolve(layoutDir, postObj.layout + '.html');
    let js = path.resolve(layoutDir, postObj.layout + '.js');
    let html = renderPostToHtml(layout, {
      config,
      postObj
    });

    await fs.outputFile(
      path.resolve(
        targetDir,
        postObj.dateInfo[0],
        postObj.dateInfo[1],
        postObj.dateInfo[2],
        postObj.title.trim(),
        'index.html'
      ),
      html
    );
    await fs.copy(
      js,
      path.resolve(
        targetDir,
        postObj.dateInfo[0],
        postObj.dateInfo[1],
        postObj.dateInfo[2],
        postObj.title.trim(),
        'index.js'
      )
    );
  }
}

module.exports = (...args) => {
  return build(...args).catch(error => {
    console.error(chalk.bgRed(' ERROR '), chalk.red(error, error.stack));
    process.exit(1);
  })
};
