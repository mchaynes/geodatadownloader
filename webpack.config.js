// Most of this was taken from: https://github.com/defiantgoat/esri-react-typescript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ArcGISPlugin = require('@arcgis/webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path');

module.exports = {
    entry: './src/index.tsx',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.png/,
                type: 'asset/inline'
            },
            {
                test: /\.(jpe?g|gif|jp2|webp|ico)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                },
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'build'),
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "public/index.html",
            excludeChunks: ["server"],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public', to: './', globOptions: { ignore: ["**/index.html"] } }
            ]
        }),

    ],
};