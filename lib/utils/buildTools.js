const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const htmlWebpackPlugin = require('html-webpack-plugin');
const config = require('../config/webpack.base.conf');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function getHtmlWebpackPluginConfig(template, filename, chunks) {
  return {
    template,
    filename,
    chunks,
    // favicon: './favicon.ico',
    // title: title,
    inject: true,
    hash: true,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true,
    }
  };
};

function getProductionConfig(htmlEntry, htmlEntryArray, destDir) {
  let webpackConfig = merge(config, {
    entry: htmlEntry,
    mode: 'production',
    output: {
      path: path.resolve(destDir),
      filename: 'assets/js/[name].[hash].js',
      publicPath: '/'
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css'
      }),
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true
        }
      }),
      new UglifyJSPlugin({
        uglifyOptions: {
          compress: {
            warnings: false,
            drop_debugger: false,
            drop_console: true
          }
        }
      })
    ]
  });

  htmlEntryArray.forEach(element => {
    webpackConfig.plugins.push(new htmlWebpackPlugin(
      getHtmlWebpackPluginConfig(element.template, element.filename, element.chunks)
    ));
  });
  return webpackConfig;
}

exports.buildForProduction = async (htmlEntry, htmlEntryArray, tmpDir, destDir) => {
  const webpackConfig = getProductionConfig(htmlEntry, htmlEntryArray, destDir);
  const compiler = webpack(webpackConfig);

  compiler.run((error, stats) => {
    if (error) {
      console.log(error);
      process.exit(1);
    }
    fs.remove(tmpDir);
    console.log(stats.toString(webpackConfig.stats));
    console.log(`\nBuilding finished!`);
  });
};

exports.getHtmlEntryArray = (dirPrefix, list) => {
  return list.map(info => {
    return {
      template: `${dirPrefix}${info.url}`,
      filename: `.${info.url}`,
      chunks: [info.title]
    };
  });
}


exports.getHtmlEntry = (dirPrefix, list) => {
  let result = {};
  list.forEach(info => {
    result[info.title] = `${dirPrefix}${info.js}`
  });
  return result;
}
