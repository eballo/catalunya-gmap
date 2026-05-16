#!/usr/bin/env node
const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function readEnvFile(filePath) {
    if (!fs.existsSync(filePath)) return {};
    return fs.readFileSync(filePath, 'utf8').split('\n').reduce((acc, line) => {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m) acc[m[1].trim()] = m[2].trim().replace(/^'(.*)'$/, '$1');
        return acc;
    }, {});
}

function getPluginPath() {
    if (process.env.PLUGIN_PATH) return process.env.PLUGIN_PATH;
    const env = readEnvFile(path.join(ROOT, '.env.production'));
    if (env.PLUGIN_PATH) return env.PLUGIN_PATH;
    throw new Error('PLUGIN_PATH not set. Add it to .env.production or set the environment variable.');
}

function minify(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*([\{\}\:\;\,])\s*/g, '$1')
        .trim();
}

function copyDirSync(src, dest, onlyIfNotExists = false) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath  = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath, onlyIfNotExists);
        } else if (!onlyIfNotExists || !fs.existsSync(destPath)) {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

const PLUGIN_PATH = getPluginPath();
const PLUGIN_CSS  = path.join(PLUGIN_PATH, 'plugins/refreshMap/pages/css');
const PLUGIN_IMG  = path.join(PLUGIN_PATH, 'plugins/refreshMap/pages/images');

// CSS — always overwrite (changes with each build)
const cssSrc = path.join(ROOT, 'web/css/catalunya-gmap.css');
if (!fs.existsSync(cssSrc)) { console.error(`CSS source not found: ${cssSrc}`); process.exit(1); }
const cssContent = minify(fs.readFileSync(cssSrc, 'utf8'));
for (const dest of [path.join(PLUGIN_CSS, 'catalunya-gmap.min.css'), path.join(ROOT, 'dist/production/catalunya-gmap.min.css')]) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, cssContent);
    console.log(`CSS → ${path.relative(ROOT, dest)}`);
}

// Images — only copy if destination file does not exist yet
const imgSrc = path.join(ROOT, 'web/images');
if (fs.existsSync(imgSrc)) {
    copyDirSync(imgSrc, PLUGIN_IMG, true);
    console.log(`Images → ${path.relative(ROOT, PLUGIN_IMG)}`);
}
