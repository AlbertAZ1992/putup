const fs = require('fs-extra');
const webpack = require('webpack');
const { getWebpackConfig } = require('./getWebpackConfig');


exports.buildForProduction = async (htmlEntry, htmlEntryArray, tmpDir, destDir) => {
  const webpackConfig = getWebpackConfig(htmlEntry, htmlEntryArray, destDir);
  const compiler = webpack(webpackConfig);

  compiler.run((error, stats) => {
    if (error) {
      console.log(error);
      process.exit(1);
    }
    console.log(stats.toString(webpackConfig.stats));

    fs.remove(tmpDir);
    console.log(`\nBuilding finished!`);
  });
};

exports.getHtmlEntryArray = (dirPrefix, list) => {
  let result = list.map(info => {
    return {
      template: `${dirPrefix}${info.url}`,
      filename: `.${info.url}`,
      chunks: [info.title]
    };
  });
  result.push({
    template: `${dirPrefix}/index.html`,
    filename: 'index.html',
    chunks: ['index']
  })
  return result;
}


exports.getHtmlEntry = (dirPrefix, list) => {
  let result = {};
  list.forEach(info => {
    result[info.title] = `${dirPrefix}${info.js}`
  });
  result['index'] = `${dirPrefix}/index.js`
  return result;
}


exports.getSiteInfo = async (dir) => {
  const configObj = await fs.readJson(`${dir}/config.json`);
  return configObj;
}
