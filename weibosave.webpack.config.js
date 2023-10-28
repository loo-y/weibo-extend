const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');

const outDir = path.resolve(__dirname, './extension/weiboSave')
const scriptPath = path.resolve(__dirname, './weiboSave/scripts/')

module.exports = {
    mode: 'production', // 设置为 'development' 或 'production'
    externals: {
        './myblog.json': 'myblog',
    },
    entry: {
        weibosave: path.resolve(scriptPath, './weibosave'),
    },
    output: {
        path: outDir,
        filename: 'scripts/[name].js',
    },
    resolve: {
        extensions: ['.ts', '.js', '.tsx'], // 解析的文件扩展名包括 .ts 和 .js
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
                path.resolve(outDir, 'weibosave.js')
            ],
        }),
        new HtmlWebpackPlugin({
            template: './weiboSave/index.html',  // 指定 HTML 模板文件
            filename: 'index.html',  // 输出的 HTML 文件名
            minify: {
              collapseWhitespace: true,  // 压缩 HTML 文件中的空白字符
              removeComments: true,  // 删除 HTML 文件中的注释
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    // transpileOnly: true,
                    compilerOptions: {
                        target: 'es5',
                        noEmit: false,
                    },
                },
                exclude: /node_modules/,
            },
            {
                test: /\.tsx$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react'],
                        },
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            // transpileOnly: true,
                            compilerOptions: {
                                target: 'es5',
                                noEmit: false,
                            },
                        },
                    },
                ],
            },
        ],
    },
}
