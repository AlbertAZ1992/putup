const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function getHtmlWebpackPluginConfig(template, filename, chunks) {
  return {
    template,
    filename,
    chunks,
    inject: true,
    hash: true,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true,
    }
  };
};

exports.getWebpackConfig = (htmlEntry, htmlEntryArray, destDir) => {

  let webpackConfig = {
    entry: htmlEntry,
    mode: 'production',
    output: {
      path: path.resolve(destDir),
      filename: 'assets/js/[name].[hash].js',
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: ["babel-loader"],
          exclude: "/node_modules/"
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: [{
            // 需要下载file-loader和url-loader
            loader: "url-loader",
            options: {
              limit: 5 * 1024, //小于这个时将会已base64位图片打包处理
              // 图片文件输出的文件夹
              outputPath: "images"
            }
          }]
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
          }
        },
        {
          test: /\.html$/,
          use: ["html-loader"]
        },
        {
          test: /\.less$/,
          use: ["style-loader", "css-loader", "less-loader"]
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        }
      ]
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
  };

  htmlEntryArray.forEach(element => {
    webpackConfig.plugins.push(new htmlWebpackPlugin(
      getHtmlWebpackPluginConfig(element.template, element.filename, element.chunks)
    ));
  });
  return webpackConfig;
}
