import { execSync } from 'node:child_process';
import { appendFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { exit } from 'node:process';
import { type ParseArgsOptionsConfig, parseArgs } from 'node:util';

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

function getChangedPackages(force: boolean) {
    const packages = new Set<string>();
    if (!force) {
        // get all commits since 26 hours
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
                const packageName = file.split('/')[1];
                if (packageName) {
                    packages.add(packageName);
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

    const hasChangesOutput = `has_changes=${hasChanges ? 'true' : 'false'}`;
    if (process.env.GITHUB_OUTPUT) {
        appendFileSync(process.env.GITHUB_OUTPUT, hasChangesOutput);
    } else {
        console.info(hasChangesOutput);
    }
}

const args = parseArgs({
    options,
    strict: true
}).values;
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
