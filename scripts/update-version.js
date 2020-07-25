const packageJsonFilePath = `${__dirname}/../package.json`;
const pkg = require(packageJsonFilePath);
const {exec} = require('child_process');

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