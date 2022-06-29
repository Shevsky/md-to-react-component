const fs = require('fs');
const { buildPath } = require('./const');

const { devDependencies, scripts, ...buildPackageJson } = require('./../package.json');

fs.writeFileSync(`${buildPath}/package.json`, JSON.stringify(buildPackageJson, null, 2));
