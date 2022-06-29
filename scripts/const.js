const path = require('path');
const rootPath = process.cwd();
const resolvePath = path.resolve.bind(path, rootPath);
const buildPath = resolvePath('dist');

module.exports = { rootPath, resolvePath, buildPath };
