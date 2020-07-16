const packageJsonFilePath = `${__dirname}/../package.json`;
const pkg = require(packageJsonFilePath);
const {exec} = require('child_process');

let version = pkg.version.match(/([0-9]+\.[0-9]+\.[0-9]+)/)[0];
version = `${version}-${process.argv[2]}.${process.argv[3]}`;
console.log(`Updating version to ${version}`);

exec(`npm --no-git-tag-version version ${version}`)