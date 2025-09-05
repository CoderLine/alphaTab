import * as fs from 'node:fs';
import url from 'node:url';
import path from 'node:path';
import { exec } from 'node:child_process';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const rootPkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'));
const currentNpmVersion = rootPkg.version.match(/([0-9]+\.[0-9]+\.[0-9]+)/)[0];

function updateNpmVersion(packageJsonFilePath) {
    let version = currentNpmVersion;
    if (process.argv.length === 4) {
        // node update-version.js alpha 37
        // -> "version": "1.0.0-alpha37",
        version = `${version}-${process.argv[2]}.${process.argv[3]}`;
    }

    console.log(`NPM Path: ${packageJsonFilePath}`);
    console.log(`Updating version to ${version}`);

    const parent = path.dirname(packageJsonFilePath);
    const currentDir = process.cwd();
    process.chdir(parent);
    try {
        exec(`npm --no-git-tag-version version ${version}`);
    } finally {
        process.chdir(currentDir);
    }
}

function updateCSharpVersion(propsPath) {
    let version = currentNpmVersion;
    let assemblyVersion = version;

    if (process.argv.length === 4) {
        // node update-version.js alpha 37
        // -> <Version>1.0.0-alpha37</Version>
        // -> <AssemblyVersion>1.0.0.37</AssemblyVersion>
        // -> <FileVersion>1.0.0.37</FileVersion>
        version = `${version}-${process.argv[2]}.${process.argv[3]}`;
        assemblyVersion = `${assemblyVersion}.${process.argv[3]}`;
    } else if (process.argv.length === 3) {
        // node update-version.js 37
        // -> <Version>1.0.0</Version>
        // -> <AssemblyVersion>1.0.0.37</AssemblyVersion>
        // -> <FileVersion>1.0.0.37</FileVersion>
        assemblyVersion = `${assemblyVersion}.${process.argv[2]}`;
    } else {
        // node update-version.js
        // -> <Version>1.0.0</Version>
        // -> <AssemblyVersion>1.0.0.0</AssemblyVersion>
        // -> <FileVersion>1.0.0.0</FileVersion>
        assemblyVersion = `${assemblyVersion}.0`;
    }

    console.log(`Props Path: ${propsPath}`);
    console.log(`  Updating Version to ${version}`);
    console.log(`  Updating AssemblyVersion to ${assemblyVersion}`);

    let propsSource = fs.readFileSync(propsPath, 'utf-8');
    propsSource = propsSource.replace(/<Version>[^<]+<\//g, `<Version>${version}</`);
    propsSource = propsSource.replace(/<AssemblyVersion>[^<]+<\//g, `<AssemblyVersion>${assemblyVersion}</`);

    fs.writeFileSync(propsPath, propsSource);
}

function updateKotlinVersion(buildFile) {
    let version = currentNpmVersion;
    if (process.argv.length === 4) {
        // node update-version.js alpha 37
        // -> version = "1.3.1-SNAPSHOT"
        version = `${version}-SNAPSHOT`;
    } else if (process.argv.length === 3) {
        // node update-version.js 37
        // -> version = "1.3.1"
    } else {
        // node update-version.js
        // -> version = "1.3.1-SNAPSHOT"
        version = `${version}-SNAPSHOT`;
    }

    console.log(`Kotlin Path: ${buildFile}`);
    console.log(`  Updating Version to ${version}`);

    let propsSource = fs.readFileSync(buildFile, 'utf-8');
    propsSource = propsSource.replace(/libVersion\s*= \".*/g, `libVersion = "${version}"`);
    fs.writeFileSync(buildFile, propsSource);
}

updateNpmVersion(path.resolve(__dirname, '../package.json'));
for (const entry of fs.readdirSync(path.resolve(__dirname, '../packages/'), { withFileTypes: true })) {
    if (entry.isDirectory()) {
        const packageJsonFilePath = path.resolve(__dirname, `../packages/${entry.name}/package.json`);
        if (fs.existsSync(packageJsonFilePath)) {
            updateNpmVersion(packageJsonFilePath);
        }
    }
}

updateCSharpVersion(path.resolve(__dirname, '../packages/csharp/src/Directory.Build.props'));
updateKotlinVersion(path.resolve(__dirname, '../packages/kotlin/src/android/build.gradle.kts'));

console.log('Done updating versions.');
