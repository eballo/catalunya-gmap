const path         = require('path');
const fs           = require('fs');
const webpack      = require('webpack');
const Dotenv       = require('dotenv-webpack');
const TerserPlugin = require('terser-webpack-plugin');
const pkg          = require('./package.json');

function readPluginPath() {
    const envFile = path.join(__dirname, '.env.production');
    if (!fs.existsSync(envFile)) return null;
    for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
        const m = line.match(/^PLUGIN_PATH=(.*)$/);
        if (m) return m[1].trim().replace(/^'(.*)'$/, '$1');
    }
    return null;
}

module.exports = (env, argv) => {
    const envPath = env && env.demo
        ? '.env.demo'
        : argv.mode === 'development' ? '.env' : `.env.${argv.mode}`;

    const entries = {
        dist: { import: './src/app/catalunya-gmap-main', filename: `./dist/${argv.mode}/catalunya-gmap.min.js` },
        web:  { import: './src/app/catalunya-gmap-main', filename: `./web/js/catalunya-gmap.min.js` },
    };

    if (env && env.plugin) {
        const pluginPath = process.env.PLUGIN_PATH || readPluginPath();
        if (!pluginPath) throw new Error('PLUGIN_PATH not set. Add it to .env.production or set the environment variable.');
        entries.wp = {
            import: './src/app/catalunya-gmap-main',
            filename: path.relative(path.resolve(__dirname), path.join(pluginPath, 'plugins/refreshMap/pages/js/catalunya-gmap.min.js')),
        };
    }

    return {
        entry: entries,
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, './'),
        },
        optimization: {
            minimizer: [
                new TerserPlugin({ extractComments: false }),
            ],
        },
        plugins: [
            new Dotenv({ path: envPath }),
            new webpack.BannerPlugin({ banner: `/*! catalunya-gmap v${pkg.version} */`, raw: true }),
        ],
        devServer: {
            static: { directory: path.join(__dirname, './web') },
            compress: true,
            port: 9090,
        },
        externals: {
            jquery: 'jQuery',
        },
    };
};