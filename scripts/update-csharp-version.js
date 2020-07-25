const packageJsonFilePath = `${__dirname}/../package.json`;
const pkg = require(packageJsonFilePath);
const fs = require('fs');

let version = pkg.version.match(/([0-9]+\.[0-9]+\.[0-9]+)/)[0];
let assemblyVersion = version;

if(process.argv.length === 4) {
    // update-csharp-version.js alpha 37
    // -> <Version>1.0.0-alpha37</Version>
    // -> <AssemblyVersion>1.0.0.37</AssemblyVersion>
    // -> <FileVersion>1.0.0.37</FileVersion>
    version = `${version}-${process.argv[2]}.${process.argv[3]}`;
    assemblyVersion = `${assemblyVersion}.${process.argv[3]}`;
} else if(process.argv.length === 3) {
    // update-csharp-version.js 37
    // -> <Version>1.0.0</Version>
    // -> <AssemblyVersion>1.0.0.37</AssemblyVersion>
    // -> <FileVersion>1.0.0.37</FileVersion>
    assemblyVersion = `${assemblyVersion}.${process.argv[2]}`;
}

console.log(`Updating Version to ${version}`);
console.log(`Updating AssemblyVersion to ${assemblyVersion}`);

const propsPath = `${__dirname}/../src.csharp/Directory.Build.props`;

let propsSource = fs.readFileSync(propsPath, 'utf-8');
propsSource = propsSource.replace(/<Version>[^<]+<\//g, `<Version>${version}</`);
propsSource = propsSource.replace(/<AssemblyVersion>[^<]+<\//g, `<AssemblyVersion>${assemblyVersion}</`);

fs.writeFileSync(propsPath, propsSource);