import * as fs from 'node:fs';
import url from 'node:url';
import {exec} from 'node:child_process';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packageJsonFilePath = `${__dirname}/../package.json`;
const pkg = JSON.parse(fs.readFileSync(packageJsonFilePath, 'utf-8'));

let version = pkg.version.match(/([0-9]+\.[0-9]+\.[0-9]+)/)[0];

if(process.argv.length === 4) {
    // node update-version.js alpha 37
    // -> "version": "1.0.0-alpha37",
    version = `${version}-${process.argv[2]}.${process.argv[3]}`;
    console.log(`Updating version to ${version}`);
} else {
    console.log(`Keeping version on ${version}`);
}

exec(`npm --no-git-tag-version version ${version}`)