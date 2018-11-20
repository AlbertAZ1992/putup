const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const moment = require('moment');
const swig = require('swig');
const md = require('markdown-it')({
  html: true
});

async function build(fileName, options) {
  const cwd = options.cwd || process.cwd();
  const postDir = path.resolve(cwd, './posts');
  const targetDir = path.resolve(cwd, './dist');
  const layoutDir = path.resolve(__dirname, './source', 'layout');
  const config = {};

  let postsList = await resolvePosts(postDir);
  await buildAllPosts(postsList, layoutDir, targetDir, config);

}

async function buildAllPosts(postsList, layoutDir, targetDir, config) {
  for (post of postsList) {
    let layout = path.resolve(layoutDir, post.layout + '.html');
    let html = renderPost(layout, {
      config,
      post
    });

    await fs.outputFile(
      path.resolve(
        targetDir,
        post.dateInfo[0],
        post.dateInfo[1],
        post.dateInfo[2],
        post.title,
        'index.html'),
      html);
  }
}

async function resolvePosts(postDir) {
  const files = await fs.readdir(postDir);
  if (files && files.length) {
    let blogList = [];
    for (let file of files) {
      let postContent = fs.readFileSync(path.resolve(postDir, file)).toString();
      let post = parsePostContent(postContent);
      let dateStr = post.dateInfo.join('/');
      let nameStr = post.title.trim();
      post.timeStamp = new Date(post.date);
      post.url = `/${dateStr}/${nameStr}/index.html`;
      blogList.push(post);
    }
    return blogList;
  }
  return [];
}


function renderPost(file, data) {
  return swig.render(fs.readFileSync(file).toString(), {
    filename: file,
    autoescape: false,
    locals: data
  })
}

function parsePostContent(data) {
  let split = '----\n';
  let i = data.indexOf(split);
  let info = {};
  if (i !== -1) {
    let j = data.indexOf(split, i + split.length);
    if (j !== -1) {
      info.source = data.slice(j + split.length);
      data.slice(i + split.length, j).trim().split('\n').forEach((line) => {
        let i = line.indexOf(':');
        if (i !== -1) {
          var name = line.slice(0, i).trim();
          var value = line.slice(i + 1).trim();
          info[name] = value;
        }
      });

    }
  }

  info.layout = info.layout || 'post';
  info.content = md.render(info.source || '');

  let dateMoment = moment(info.date, 'YYYY-MM-DD,HH:mm:ss');
  info.dateMoment = dateMoment;
  let dateArr = dateMoment.toArray().slice(0, 3);
  dateArr[1] += 1;
  dateArr[1] = dateArr[1] < 10 ? '0' + dateArr[1] : dateArr[1];
  info.dateInfo = dateArr.map(v => v.toString());

  return info;
}

module.exports = (...args) => {
  return build(...args).catch(error => {
    console.error(chalk.bgRed(' ERROR '), chalk.red(error));
    process.exit(1);
  })
};
