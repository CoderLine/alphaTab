import { execSync } from 'node:child_process';
import { appendFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { exit } from 'node:process';
import { type ParseArgsOptionsConfig, parseArgs } from 'node:util';
import { isWebsiteRelevant } from './ci-areas.mts';

const options: ParseArgsOptionsConfig = {
    platform: {
        type: 'string'
    },
    mode: {
        type: 'string'
    },
    force: {
        type: 'string'
    },
    tag: {
        type: 'string'
    },
    stage: {
        type: 'string'
    },
    'dry-run': {
        type: 'string'
    }
};

function getFeatureCommits() {
    const featureCommits = execSync(
        "git log --since='26 hours ago' --pretty=format:'%H;%an <%ae>' --perl-regexp --author='^((?!dependabot).*)$'",
        {
            encoding: 'utf-8'
        }
    )
        .split('\n')
        .filter(l => l.trim().length > 0)
        .map(l => {
            const p = l.split(';');
            return { hash: p[0], author: p[1] };
        });

    console.info('Detected following feature commits', featureCommits);
    return featureCommits;
}

function getChangedPackages(force: boolean) {
    const packages = new Set<string>();
    if (!force) {
        const featureCommits = getFeatureCommits();
        if (featureCommits.length === 0) {
            console.info('No feature commits, no packages changed');
            return packages;
        }

        // translate commits to changed packages
        for (const commit of featureCommits) {
            const files = execSync(`git show --name-only ${commit.hash} --pretty=""`, {
                encoding: 'utf-8'
            }).split('\n');

            for (const file of files) {
                const parts = file.split('/');
                if (parts[0] === 'packages' && parts.length > 2) {
                    packages.add(parts[1]);
                }
            }
        }
    } else {
        for (const pkg of readdirSync(resolve(import.meta.dirname, '../packages/'), { withFileTypes: true })) {
            if (pkg.isDirectory()) {
                packages.add(pkg.name);
            }
        }
    }

    for (const packageName of Array.from(packages)) {
        const packageJson = resolve(import.meta.dirname, '../packages/', packageName, 'package.json');
        if (!existsSync(packageJson)) {
            packages.delete(packageName);
            continue;
        }

        const isPrivate = JSON.parse(readFileSync(packageJson, 'utf-8')).private;
        if (isPrivate) {
            packages.delete(packageName);
        }
    }

    console.info('Detected following changed packages', packages);
    return packages;
}

/**
 * The website redeploys when the window changed the site itself or a package it ships. The window is diffed as a
 * whole, so changes that only arrive through merge commits are included.
 */
function hasWebsiteChanges(force: boolean) {
    if (force) {
        return true;
    }
    if (getFeatureCommits().length === 0) {
        console.info('No feature commits, website unchanged');
        return false;
    }

    const base = execSync("git rev-list -1 --before='26 hours ago' HEAD", { encoding: 'utf-8' }).trim();
    if (!base) {
        console.info('No commit older than 26 hours in the checked out history, treating the website as changed');
        return true;
    }

    const relevant = execSync(`git diff --name-only ${base} HEAD`, { encoding: 'utf-8' })
        .split('\n')
        .filter(f => f.length > 0 && isWebsiteRelevant(f));
    console.info('Detected following website relevant changes', relevant);
    return relevant.length > 0;
}

function exec(command: string, cwd: string) {
    console.info(`executing command ${command} in ${cwd}`);
    execSync(command, { stdio: 'inherit', cwd });
}

function publish(platform: string, packages: Set<string>, dryRun: boolean) {
    switch (platform) {
        case 'web': {
            const publishCommand = args.stage === 'true' ? 'npm stage publish' : 'npm publish';
            // verbose logging surfaces the outcome of the OIDC token exchange
            const dryRunArgs = dryRun ? ' --dry-run --loglevel verbose' : '';
            for (const packageName of packages) {
                exec(
                    `${publishCommand} --access public --tag ${args.tag}${dryRunArgs}`,
                    resolve(import.meta.dirname, '../packages', packageName)
                );
            }
            // the website build waits until the registry serves each of these versions
            const published: Record<string, string> = {};
            if (!dryRun) {
                for (const packageName of packages) {
                    const { name, version } = readPackageJson(packageName);
                    published[name] = version;
                }
            }
            writeOutput(`published_versions=${JSON.stringify(published)}`);
            break;
        }
        case 'dotnet': {
            const cwd = resolve(import.meta.dirname, '../packages/csharp/src');
            for (const pkg of ['AlphaTab', 'AlphaTab.Windows']) {
                if (dryRun) {
                    // dotnet nuget push has no dry-run mode
                    const nupkgs = readdirSync(resolve(cwd, pkg, 'bin/Release')).filter(f => f.endsWith('.nupkg'));
                    if (nupkgs.length === 0) {
                        throw new Error(`No nupkg found for ${pkg}`);
                    }
                    console.info(`dry run, skipping push of ${pkg}:`, nupkgs);
                } else {
                    exec(
                        `dotnet nuget push ${pkg}/bin/Release/*.nupkg -k ${process.env.NUGET_API_KEY} -s https://api.nuget.org/v3/index.json`,
                        cwd
                    );
                }
            }
            break;
        }
        case 'kotlin': {
            // DistPath is a local maven repository: builds and signs the publications without uploading them
            const task = dryRun ? 'publishAllPublicationsToDistPathRepository' : 'publishToMavenCentral';
            exec(`./gradlew ${task}`, resolve(import.meta.dirname, '../packages/kotlin/src/'));
            break;
        }
    }
}

function pack(platform: string, packages: Set<string>) {
    switch (platform) {
        case 'web':
            for (const packageName of packages) {
                console.info('npm pack', packageName);
                execSync('npm pack', {
                    stdio: 'inherit',
                    cwd: resolve(import.meta.dirname, '../packages', packageName)
                });
            }
            break;
        case 'dotnet':
            console.info('dotnet pack skipped, nupkgs are created automatically');
            break;
        case 'kotlin':
            console.info('kotlin pack skipped, there is no pack step');
            break;
    }
}

function check(platform: string, packages: Set<string>) {
    let hasChanges = false;
    switch (platform) {
        case 'web':
            hasChanges = packages.size > 0;
            break;
        case 'dotnet':
            hasChanges = packages.has('alphatab') || packages.has('csharp');
            if (!hasChanges) {
                console.info('dotnet build skipped, no relevant package changed');
            }
            break;
        case 'kotlin':
            hasChanges = packages.has('alphatab') || packages.has('kotlin');
            if (!hasChanges) {
                console.info('kotlin build skipped, no relevant package changed');
            }
            break;
    }

    writeOutput(`has_changes=${hasChanges ? 'true' : 'false'}`);
}

function readPackageJson(packageName: string): { name: string; version: string } {
    const packageJson = resolve(import.meta.dirname, '../packages', packageName, 'package.json');
    return JSON.parse(readFileSync(packageJson, 'utf-8'));
}

function writeOutput(line: string) {
    if (process.env.GITHUB_OUTPUT) {
        appendFileSync(process.env.GITHUB_OUTPUT, `${line}\n`);
    } else {
        console.info(line);
    }
}

const args = parseArgs({
    options,
    strict: true
}).values;

if (args.platform === 'website') {
    if (args.mode !== 'check') {
        console.error('The website platform only supports --mode check');
        exit(1);
    }
    writeOutput(`has_changes=${hasWebsiteChanges(args.force === 'true') ? 'true' : 'false'}`);
    exit(0);
}

const packages = getChangedPackages(args.force === 'true');

switch (args.mode) {
    case 'pack':
        pack(args.platform as string, packages);
        break;
    case 'publish':
        publish(args.platform as string, packages, args['dry-run'] === 'true');
        break;
    case 'check':
        check(args.platform as string, packages);
        break;
    default:
        console.error('Invalid mode', args.mode);
        exit(1);
}
