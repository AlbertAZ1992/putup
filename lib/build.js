const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { renderPostToHtml, parsePostContentToPostObj } = require('./utils/renderTools');
const { buildForProduction, getHtmlEntry, getHtmlEntryArray, getSiteInfo } = require('./utils/buildTools');

async function build(options) {
  const cwd = options.cwd || process.cwd();
  const postDir = path.resolve(cwd, './posts');
  const destDir = options.dest ? path.resolve(cwd, options.dest) : path.resolve(cwd, './dist');
  const tmpDir = path.resolve(destDir, './tmp');
  const tmpPrefix = options.dest ? `./${options.dest}/tmp` : `./dist/tmp`;
  const layoutDir = path.resolve(__dirname, 'layout');

  console.log(`\nRsolving posts in ${chalk.cyan(`${postDir}`)} ...`);
  let postsList = await resolvePosts(postDir);

  if (postsList && postsList.length) {
    console.log(`\nCleaning existing files in dest folder ${chalk.cyan(`${destDir}`)} ...`);
    await fs.remove(destDir);

    const siteInfo = await getSiteInfo(cwd)
    console.log(`\nRendering all posts...`);
    await renderAllPosts(postsList, layoutDir, tmpDir, siteInfo);

    console.log(`\nRendering index page...`);
    await renderIndexList(postsList, layoutDir, tmpDir, siteInfo)

    await fs.copy(path.resolve(cwd, './assets'), path.resolve(destDir, './assets'));

    console.log(`\nBuilding in dest folder ${chalk.cyan(`${destDir}`)} with Webpack...`);
    const htmlEntry = getHtmlEntry(tmpPrefix, postsList);
    const htmlEntryArray = getHtmlEntryArray(tmpPrefix, postsList);
    await buildForProduction(htmlEntry, htmlEntryArray, tmpDir, destDir);

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
    postsList.sort((a, b) => {
      return a.timeStamp - b.timeStamp;
    });
    postsList = postsList.map((postObj, index) => {
      return {
        ...postObj,
        prev: {
          url: index > 0 ? postsList[index - 1].url : null,
          title: index > 0 ? postsList[index - 1].title.trim() : null
        },
        next: {
          url: index < postsList.length - 1 ? postsList[index + 1].url : null,
          title: index < postsList.length - 1 ? postsList[index + 1].title.trim() : null
        }
      }
    })
    return postsList;
  }
  return [];
}

async function renderAllPosts(postsList, layoutDir, targetDir, siteInfo) {
  for (postObj of postsList) {
    let layout = path.resolve(layoutDir, postObj.layout,  'index.html');
    let entry = path.resolve(layoutDir, postObj.layout, 'index.js');
    let theme = path.resolve(layoutDir, 'theme');
    let html = renderPostToHtml(layout, { autoescape: false }, {...postObj, site: siteInfo});

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
      entry,
      path.resolve(
        targetDir,
        postObj.dateInfo[0],
        postObj.dateInfo[1],
        postObj.dateInfo[2],
        postObj.title.trim(),
        'index.js'
      )
    );
    await fs.copy(
      theme,
      path.resolve(
        targetDir,
        postObj.dateInfo[0],
        postObj.dateInfo[1],
        postObj.dateInfo[2],
        postObj.title.trim()
      )
    );
  }
}

async function renderIndexList(postsList, layoutDir, targetDir, siteInfo) {
  let layout = path.resolve(layoutDir, 'list', 'index.html');
  let entry = path.resolve(layoutDir, 'list', 'index.js');
  let theme = path.resolve(layoutDir, 'theme');
  let html = renderPostToHtml(layout, { autoescape: false }, {list: postsList, site: siteInfo});
  await fs.outputFile(path.resolve(targetDir, 'index.html'), html);
  await fs.copy(entry, path.resolve(targetDir, 'index.js'));
  await fs.copy(theme, path.resolve(targetDir));
}

module.exports = (...args) => {
  return build(...args).catch(error => {
    console.error(chalk.bgRed(' ERROR '), chalk.red(error, error.stack));
    process.exit(1);
  })
};
