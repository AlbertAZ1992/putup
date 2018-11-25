// const path = require('path');
// const copyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
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

      }
    ]
  },
  // plugins: [
  //   //静态资源输出
  //   new copyWebpackPlugin([{
  //     from: path.resolve(__dirname, "../src/assets"),
  //     to: './assets',
  //     ignore: ['.*']
  //   }])
  // ]
}
