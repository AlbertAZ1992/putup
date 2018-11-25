const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const htmlWebpackPlugin = require('html-webpack-plugin');
const config = require('../config/webpack.base.conf');
const cleanWebpackPlugin = require('clean-webpack-plugin');
//4.x之后用以压缩
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function getHtmlWebpackPluginConfig (title, url, chunks) {
  return {
    template: url, // `./src/pages/${name}/index.html`,
    filename: `${title}.html`,
    // favicon: './favicon.ico',
    // title: title,
    inject: true,
    hash: true,
    chunks: chunks,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true,
    }
  };
};

exports.buildForProduction = async (htmlEntry, htmlEntryArray, buildDir) => {
  console.log('hi');

  const webpackConfig = merge(config, {
    entry: htmlEntry,
    mode: 'production', // 通过 mode 声明生产环境
    output: {
      path: path.resolve(buildDir),
      // 打包多出口文件
      // 生成 a.bundle.[hash].js  b.bundle.[hash].js
      filename: './js/[name].[hash].js',
      publicPath: './'
    },
    devtool: 'cheap-source-map',
    plugins: [
      //删除dist目录
      new cleanWebpackPlugin([buildDir], {
        root: buildDir,
        verbose: true, //开启在控制台输出信息
        // dry Use boolean 'true' to test/emulate delete. (will not remove files).
        // Default: false - remove files
        dry: false,
      }),

      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: '[name].css',
        chunkFilename: '[id].css'
      }),

      //压缩css
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
      getHtmlWebpackPluginConfig(element.title, element.url, element.chunks)
    ));
  });

  const compiler = webpack(webpackConfig);

  compiler.run((error, stats) => {
    if (error) {
      console.log(error);
      process.exit(1);
    }
    const statsOutputOptions = webpackConfig.stats;
    console.log(stats.toString(statsOutputOptions));
  });
};

exports.getHtmlEntryArray = (dir, list) => {
  return list.map(info => {
    return {
      title: info.title,
      url: `./${dir}${info.url}`,
      chunks: [info.title]
    };
  });
}


exports.getHtmlEntry = (dir, list) => {
  let result = {};
  list.forEach(info => {
    result[info.title] = `./${dir}${info.js}`
  });
  return result;
}
