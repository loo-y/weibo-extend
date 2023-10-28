const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const outDir = path.resolve(__dirname, './extension/weibSave')
const scriptPath = path.resolve(__dirname, './weibSave/scripts/')

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
        filename: '[name].js',
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
