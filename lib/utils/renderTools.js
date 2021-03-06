const path = require('path');
const moment = require('moment');
const nunjucks = require('nunjucks');
const hljs = require('highlight.js');
const md = require('markdown-it')({
  html: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
          hljs.highlight(lang, str, true).value +
          '</code></pre>';
      } catch (__) {}
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

exports.renderPostToHtml = (file, config, data) => {
  nunjucks.configure(path.resolve(__dirname, '../layout'), config);
  return nunjucks.render(file, data);
}

exports.parsePostContentToPostObj = (content) => {
  let split = '----\n';
  let i = content.indexOf(split);
  let postObj = {};
  if (i !== -1) {
    let j = content.indexOf(split, i + split.length);
    if (j !== -1) {
      postObj.source = content.slice(j + split.length);
      content.slice(i + split.length, j).trim().split('\n').forEach((line) => {
        let i = line.indexOf(':');
        if (i !== -1) {
          var name = line.slice(0, i).trim();
          var value = line.slice(i + 1).trim();
          postObj[name] = value;
        }
      });

    }
  }

  postObj.layout = postObj.layout || 'post';
  postObj.content = md.render(postObj.source || '');

  let dateMoment = moment(postObj.date, 'YYYY-MM-DD,HH:mm:ss');
  postObj.dateMoment = dateMoment;
  let dateArr = dateMoment.toArray().slice(0, 3);
  dateArr[1] += 1;
  dateArr[1] = dateArr[1] < 10 ? '0' + dateArr[1] : dateArr[1];
  postObj.dateInfo = dateArr.map(date => date.toString());

  return postObj;
}
