import * as fs from 'node:fs';
import url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packageJsonFilePath = `${__dirname}/../package.json`;
const pkg = JSON.parse(fs.readFileSync(packageJsonFilePath, 'utf-8'));

let version = pkg.version.match(/([0-9]+\.[0-9]+\.[0-9]+)/)[0];

if(process.argv.length === 3) {
    // update-kotlin-version.js SNAPSHOT
    // -> version = "1.3.1-SNAPSHOT"
    version = `${version}-${process.argv[2]}`;
} else if(process.argv.length === 2) {
    // update-kotlin-version.js
    // -> version = "1.3.1"
}

console.log(`Updating Version to ${version}`);

const buildFile = `${__dirname}/../src.kotlin/alphaTab/android/build.gradle.kts`;

let propsSource = fs.readFileSync(buildFile, 'utf-8');
propsSource = propsSource.replace(/libVersion\s*= \".*/g, `libVersion = "${version}"`);
fs.writeFileSync(buildFile, propsSource);
