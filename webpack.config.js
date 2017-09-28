/**
 * Created by xgharibyan on 6/7/17.
 */

const webpack = require('webpack');
const path = require('path');
const _ = require('lodash');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FileListPlugin = require('file-list-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const ENV = process.env.NODE_ENV || 'local';
const BUILD_DIR = path.resolve(__dirname, 'build');
const APP_DIR = path.resolve(__dirname, 'client');
const REPLACE_PATH = `${APP_DIR}/index.html`;

const plugins = [
    new ExtractTextPlugin(`style.css`),
    new CopyWebpackPlugin([
        {from: `${REPLACE_PATH}`, to: `${BUILD_DIR}/index.html`},
    ]),
    new FileListPlugin({
        fileName: `assets.js`,

        // how a compilation is transformed onto the items list
        itemsFromCompilation: function defaultItemsFromCompilation(compilation){
            return _.keys(compilation.assets)
        },

        // how to format the list from list items
        format: function defaultFormat(listItems){
            return `var listItems = '${listItems}'\n window.assets = listItems.split(",")`;
            //listItems.join('\n')
        }
    })
];

if (ENV == 'prod') {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        mangle: false,
        output: {
            comments: false
        },
        compress: {
            drop_console: true,
            warnings: false
        }
    }));
    plugins.push(new CleanWebpackPlugin(['build'], {
        root: path.resolve(__dirname, ''),
        verbose: true,
        dry: false,
        //exclude: ['shared.js']
    }))
}

module.exports = {
    context: APP_DIR,
    entry: {
        app: './index.js',
    },
    output: {
        path: BUILD_DIR,
        filename: 'bundle.js',
    },
    watchOptions: {
        aggregateTimeout: 300, // <---------
        poll: 1000, // <---------
        ignored:  path.resolve(__dirname, "node_modules")
    },
    module: {
        rules: [
            {
                test: /\.js?/,
                exclude: [
                    path.resolve(__dirname, "node_modules")
                ],
                //enforce: "pre",
                //enforce: "post",
                loader: "babel-loader",
                options: {
                    presets: ["es2015", 'react', 'stage-1'],
                    plugins:['transform-decorators-legacy']
                },
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192
                        }
                    }
                ]
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            },
            {
                test  : /\.(nompng|ttf|eot|svg|woff|mp3|wav|ogg(2)?)(\?[a-z0-9]+)?$/,
                loader: "file-loader",
            },
            {
                test: /\.scss$/,
                exclude: [
                    path.resolve(__dirname, "node_modules")
                ],
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',

                    // Could also be write as follow:
                    // use: 'css-loader?modules&importLoader=2&sourceMap&localIdentName=[name]__[local]___[hash:base64:5]!sass-loader'
                    use: [
                        {
                            loader: 'css-loader',
                            query: {
                                modules: true,
                                sourceMap: true,
                                importLoaders: 2,
                                localIdentName: '[name]__[local]___[hash:base64:5]'
                            }
                        },
                        'sass-loader'
                    ]
                }),
            },
        ]
    },
    plugins: plugins
};