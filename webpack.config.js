const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: {
        prod:  { import: './src/app/catalunya-gmap-main', filename: './dist/prod/catalunya-gmap.min.js'},
        local: { import: './src/app/catalunya-gmap-main', filename: './dist/local/catalunya-gmap.min.js'},
        work:  { import: './src/app/catalunya-gmap-main', filename: './dist/work/catalunya-gmap.min.js'},
        web:   { import: './src/app/catalunya-gmap-main', filename: './web/js/catalunya-gmap.min.js'},
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './'),
    },
    plugins: [
        new Dotenv() // This automatically loads your .env file and injects them
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, './web'),
        },
        compress: true,
        port: 9000,
    },
    externals: {
        jquery: 'jQuery',
    },
};