const packageJsonFilePath = `${__dirname}/../package.json`;
const pkg = require(packageJsonFilePath);
const fs = require('fs');

const version = pkg.version.match(/([0-9]+\.[0-9]+\.[0-9]+)/)[0];
const propsPath = `${__dirname}/../src.csharp/Directory.Build.props`;

let propsSource = fs.readFileSync(propsPath, 'utf-8');
propsSource = propsSource.replace(/MainVersion>[^<]+<\//g, `MainVersion>${version}</`);

fs.writeFileSync(propsPath, propsSource);