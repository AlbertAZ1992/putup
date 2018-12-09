const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CompressionWebpackPlugin = require('compression-webpack-plugin');

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
            loader: "url-loader",
            options: {
              limit: 5 * 1024,
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
          test: /\.(le|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: (loader) => [
                  require('autoprefixer')()
                ]
              }
            },
            'less-loader'
          ]
        }
      ]
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            chunks: "initial",
            name: "common",
            minChunks: 2,
            maxInitialRequests: 5,
            minSize: 0
          }
        }
      },
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          uglifyOptions: {
            compress: {
              warnings: false,
              drop_debugger: false,
              drop_console: true
            }
          }
        }),
        new OptimizeCSSAssetsPlugin({})
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'assets/css/[name].css',
        chunkFilename: 'assets/css/[name].[id].css'
      }),
      new CompressionWebpackPlugin({})
    ]
  };

  htmlEntryArray.forEach(element => {
    webpackConfig.plugins.push(new htmlWebpackPlugin(
      getHtmlWebpackPluginConfig(element.template, element.filename, element.chunks)
    ));
  });
  return webpackConfig;
}
