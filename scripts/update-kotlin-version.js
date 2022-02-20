const packageJsonFilePath = `${__dirname}/../package.json`;
const pkg = require(packageJsonFilePath);
const fs = require('fs');

let version = pkg.version.match(/([0-9]+\.[0-9]+\.[0-9]+)/)[0];

if(process.argv.length === 3) {
    // update-kotlin-version.js SNAPSHOT
    // -> version = "1.3.0-SNAPSHOT"
    version = `${version}-${process.argv[2]}`;
} else if(process.argv.length === 3) {
    // update-kotlin-version.js
    // -> version = "1.3.0"
}

console.log(`Updating Version to ${version}`);

const buildFile = `${__dirname}/../src.kotlin/alphaTab/alphaTab/build.gradle.kts`;

let propsSource = fs.readFileSync(buildFile, 'utf-8');
propsSource = propsSource.replace(/version\s*=.*/g, `version = "${version}"`);
fs.writeFileSync(buildFile, propsSource);
