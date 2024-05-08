const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => {
    const envPath = argv.mode === 'development' ?  '.env' : `.env.${argv.mode}`;
    return {
        entry: {
            dist: {import: './src/app/catalunya-gmap-main', filename: `./dist/${argv.mode}/catalunya-gmap.min.js`},
            web: {import: './src/app/catalunya-gmap-main', filename: `./web/js/catalunya-gmap.min.js`},
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, './'),
        },
        plugins: [
            new Dotenv({
                path: envPath
            })
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
};