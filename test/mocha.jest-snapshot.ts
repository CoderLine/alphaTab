/** @target web */
import chalk from 'chalk';
import * as chai from 'chai';
import url from 'node:url';
import path from 'node:path';
import {
    addSerializer,
    buildSnapshotResolver,
    type SnapshotResolver,
    SnapshotState,
    toMatchSnapshot
} from 'jest-snapshot';
import type { Config } from '@jest/types';
import slash from 'slash';
import type { SyncExpectationResult } from 'expect';
import { equals, iterableEquality, subsetEquality } from '@jest/expect-utils';
import * as matcherUtils from 'jest-matcher-utils';
import { AssertionError } from 'assertion-error';
import { type PrettyFormatConfig, type PrettyFormatPrinter, ScoreSerializerPlugin } from './PrettyFormat';

// Mocha and Chai integration (called from global-hooks.ts)
declare global {
    namespace Chai {
        interface Assertion {
            toMatchSnapshot(message?: string): Assertion;
        }
    }
}

export async function initializeJestSnapshot() {
    // Setup jest-snapshot

    addSerializer({
        test(val) {
            return ScoreSerializerPlugin.instance.test(val);
        },
        serialize(val, config, indentation, depth, refs, printer) {
            //
            return ScoreSerializerPlugin.instance.serialize(
                val,
                config as PrettyFormatConfig,
                indentation,
                depth,
                refs,
                printer as PrettyFormatPrinter
            );
        }
    });

    currentResolver = await buildSnapshotResolver(globalConfig);

    chai.use((chai, utils) => {
        utils.addMethod(
            chai.Assertion.prototype,
            'toMatchSnapshot',
            function (this: Record<string, unknown>, message?: string) {
                const received = utils.flag(this, 'object');
                const isNot = utils.flag(this, 'negate') as boolean;

                const args = [received];
                if (message !== undefined) {
                    args.push(message);
                }

                const matchResult = toMatchSnapshot.apply(
                    {
                        // Context
                        snapshotState: snapshotState!,

                        // MatcherContext -> MatcherState
                        assertionCalls,
                        currentConcurrentTestName: undefined,
                        currentTestName: currentTest!.fullTitle(),
                        error: undefined,
                        expand: snapshotOptions.expand,
                        expectedAssertionsNumber: null,
                        expectedAssertionsNumberError: undefined,
                        isExpectingAssertions: false,
                        isExpectingAssertionsError: undefined,
                        isNot,
                        numPassingAsserts: 0,
                        promise: undefined,
                        suppressedErrors: [],
                        testPath: currentTest!.file,

                        // MatcherContext -> MatcherUtils
                        customTesters: [],
                        dontThrow() {},
                        equals,
                        utils: {
                            ...matcherUtils,
                            iterableEquality,
                            subsetEquality
                        }
                    },
                    args as any
                ) as SyncExpectationResult;

                assertionCalls++;

                if (!matchResult.pass) {
                    throw new AssertionError(matchResult.message());
                }
            }
        );
    });
}

export function beforeEachTest(newTest: Mocha.Test) {
    if (currentTest === undefined || currentTest?.file !== newTest.file) {
        if (snapshotState) {
            storeSnapshotState(snapshotState);
        }

        snapshotState = new SnapshotState(currentResolver!.resolveSnapshotPath(newTest.file!), snapshotOptions);
    }
    assertionCalls = 0;
    currentTest = newTest;
    executedTestNames.add(newTest.fullTitle());
}

export function afterAll() {
    if (snapshotState) {
        storeSnapshotState(snapshotState);
    }

    writeSummaryReport();
}

//
// Adapted code from Jest for the use in Mocha
// MIT License
// Copyright (c) Meta Platforms, Inc. and affiliates.
// Copyright Contributors to the Jest project.
// https://github.com/jestjs/jest/blob/main/LICENSE

// General Snapshot matching
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

type SnapshotStateOptions = ConstructorParameters<typeof SnapshotState>[1];
type SnapshotSummary = {
    added: number;
    didUpdate: boolean;
    failure: boolean;
    filesAdded: number;
    filesRemoved: number;
    filesRemovedList: Array<string>;
    filesUnmatched: number;
    filesUpdated: number;
    matched: number;
    total: number;
    unchecked: number;
    uncheckedKeysByFile: Array<UncheckedSnapshot>;
    unmatched: number;
    updated: number;
};
type UncheckedSnapshot = {
    filePath: string;
    keys: Array<string>;
};

const globalConfig: Config.ProjectConfig = {
    rootDir: path.resolve(__dirname, '..'),
    snapshotFormat: {},
    // defaults
    automock: false,
    cache: false,
    cacheDirectory: '',
    clearMocks: false,
    collectCoverageFrom: [],
    coverageDirectory: '',
    coveragePathIgnorePatterns: [],
    cwd: '',
    dependencyExtractor: undefined,
    detectLeaks: false,
    detectOpenHandles: false,
    displayName: undefined,
    errorOnDeprecated: false,
    extensionsToTreatAsEsm: [],
    fakeTimers: {},
    filter: undefined,
    forceCoverageMatch: [],
    globalSetup: undefined,
    globalTeardown: undefined,
    globals: {},
    haste: {},
    id: '',
    injectGlobals: false,
    moduleDirectories: [],
    moduleFileExtensions: [],
    moduleNameMapper: [],
    modulePathIgnorePatterns: [],
    modulePaths: undefined,
    openHandlesTimeout: 0,
    preset: undefined,
    prettierPath: '',
    resetMocks: false,
    resetModules: false,
    resolver: undefined,
    restoreMocks: false,
    roots: [],
    runner: '',
    runtime: undefined,
    sandboxInjectedGlobals: [],
    setupFiles: [],
    setupFilesAfterEnv: [],
    skipFilter: false,
    skipNodeResolution: undefined,
    slowTestThreshold: 0,
    snapshotResolver: undefined,
    snapshotSerializers: [],
    testEnvironment: '',
    testEnvironmentOptions: {},
    testMatch: [],
    testLocationInResults: false,
    testPathIgnorePatterns: [],
    testRegex: [],
    testRunner: '',
    transform: [],
    transformIgnorePatterns: [],
    watchPathIgnorePatterns: [],
    unmockedModulePathPatterns: undefined,
    workerIdleMemoryLimit: undefined
};

// https://github.com/jestjs/jest/blob/4e7d916ec6a16de5548273c17b5d2c5761b0aebb/packages/jest-config/src/normalize.ts#L1079-L1088
const argvCi = !!process.env.CI;
const argvUpdateSnapshot = process.argv.includes('--updateSnapshot');
const snapshotOptions: SnapshotStateOptions = {
    updateSnapshot: argvCi ? 'none' : (argvUpdateSnapshot ? 'all' : 'new'),
    rootDir: globalConfig.rootDir,
    snapshotFormat: globalConfig.snapshotFormat,
    expand: undefined,
    prettierPath: undefined
};

let currentResolver: SnapshotResolver | undefined;
let currentTest: Mocha.Test | undefined = undefined;
let snapshotState: SnapshotState | undefined = undefined;
let assertionCalls = 0;

//  Snapshot results
const executedTestNames = new Set<string>();
const aggregatedResults: SnapshotSummary = {
    // https://github.com/jestjs/jest/blob/4e7d916ec6a16de5548273c17b5d2c5761b0aebb/packages/jest-test-result/src/helpers.ts#L22
    added: 0,
    didUpdate: false, // is set only after the full run
    failure: false,
    filesAdded: 0,
    // combines individual test results + removed files after the full run
    filesRemoved: 0,
    filesRemovedList: [],
    filesUnmatched: 0,
    filesUpdated: 0,
    matched: 0,
    total: 0,
    unchecked: 0,
    uncheckedKeysByFile: [],
    unmatched: 0,
    updated: 0
};

function storeSnapshotState(snapshotState: SnapshotState) {
    // https://github.com/jestjs/jest/blob/4e7d916ec6a16de5548273c17b5d2c5761b0aebb/packages/jest-circus/src/legacy-code-todo-rewrite/jestAdapter.ts#L137

    const uncheckedCount = snapshotState.getUncheckedCount();
    const uncheckedKeys = snapshotState.getUncheckedKeys();
    if (uncheckedCount) {
        snapshotState.removeUncheckedKeys();
    }
    const status = snapshotState.save();

    // https://github.com/jestjs/jest/blob/4e7d916ec6a16de5548273c17b5d2c5761b0aebb/packages/jest-test-result/src/helpers.ts#L119C1-L120C1
    // Snapshot data

    if (snapshotState.added) {
        aggregatedResults.filesAdded++;
    }
    if (status.deleted) {
        aggregatedResults.filesRemoved++;
    }
    if (snapshotState.unmatched) {
        aggregatedResults.filesUnmatched++;
    }
    if (snapshotState.updated) {
        aggregatedResults.filesUpdated++;
    }

    aggregatedResults.unmatched += snapshotState.unmatched;
    aggregatedResults.updated += snapshotState.updated;
    aggregatedResults.total +=
        snapshotState.added + snapshotState.matched + snapshotState.unmatched + snapshotState.updated;

    aggregatedResults.added += snapshotState.added;
    aggregatedResults.matched += snapshotState.matched;
    aggregatedResults.unchecked += status.deleted ? 0 : uncheckedCount;
    if (uncheckedKeys.length > 0) {
        aggregatedResults.uncheckedKeysByFile.push({
            filePath: currentTest!.file!,
            keys: uncheckedKeys
        });
    }

    aggregatedResults.filesAdded += snapshotState.added;
    aggregatedResults.filesRemoved += uncheckedCount;
    aggregatedResults.filesUnmatched += snapshotState.unmatched;
}

// Result Summary Printing
// https://github.com/jestjs/jest/blob/4e7d916ec6a16de5548273c17b5d2c5761b0aebb/packages/jest-reporters/src/getSnapshotSummary.ts#L25
const ARROW = ' \u203A ';
const DOWN_ARROW = ' \u21B3 ';
const DOT = ' \u2022 ';
const FAIL_COLOR = chalk.bold.red;
const OBSOLETE_COLOR = chalk.bold.yellow;
const SNAPSHOT_ADDED = chalk.bold.green;
const SNAPSHOT_NOTE = chalk.dim;
const SNAPSHOT_REMOVED = chalk.bold.green;
const SNAPSHOT_SUMMARY = chalk.bold;
const SNAPSHOT_UPDATED = chalk.bold.green;

function pluralize(word: string, count: number, ending = 's'): string {
    return `${count} ${word}${count === 1 ? '' : ending}`;
}

function relativePath(
    config: Config.GlobalConfig | Config.ProjectConfig,
    testPath: string
): { basename: string; dirname: string } {
    // this function can be called with ProjectConfigs or GlobalConfigs. GlobalConfigs
    // do not have config.cwd, only config.rootDir. Try using config.cwd, fallback
    // to config.rootDir. (Also, some unit just use config.rootDir, which is ok)
    testPath = path.relative((config as Config.ProjectConfig).cwd || config.rootDir, testPath);
    const dirname = path.dirname(testPath);
    const basename = path.basename(testPath);
    return { basename, dirname };
}

function formatTestPath(config: Config.GlobalConfig | Config.ProjectConfig, testPath: string): string {
    const { dirname, basename } = relativePath(config, testPath);
    return slash(chalk.dim(dirname + path.sep) + chalk.bold(basename));
}

function writeSummaryReport() {
    const snapshots = aggregatedResults;
    const updateCommand = '--updateSnapshots';

    // filter out obsolete keys if we did not execute the related test
    for (const uncheckedFile of snapshots.uncheckedKeysByFile) {
        const keysToRemove = new Set<string>();
        for (const key of uncheckedFile.keys) {
            let removeKey = true;
            for (const executed of executedTestNames) {
                if (key.startsWith(executed)) {
                    removeKey = false;
                    break;
                }
            }

            if (removeKey) {
                keysToRemove.add(key);
                snapshots.unchecked--;
                snapshots.filesRemoved--;
            }
        }

        uncheckedFile.keys = uncheckedFile.keys.filter(k => !keysToRemove.has(k));
    }

    snapshots.uncheckedKeysByFile = snapshots.uncheckedKeysByFile.filter(f => f.keys.length > 0);

    const summary: string[] = [];
    summary.push(SNAPSHOT_SUMMARY('Snapshot Summary'));
    if (snapshots.added) {
        summary.push(
            `${SNAPSHOT_ADDED(
                `${ARROW + pluralize('snapshot', snapshots.added)} written `
            )}from ${pluralize('test suite', snapshots.filesAdded)}.`
        );
    }

    if (snapshots.unmatched) {
        summary.push(
            `${FAIL_COLOR(`${ARROW}${pluralize('snapshot', snapshots.unmatched)} failed`)} from ${pluralize(
                'test suite',
                snapshots.filesUnmatched
            )}. ${SNAPSHOT_NOTE(`Inspect your code changes or ${updateCommand} to update them.`)}`
        );
    }

    if (snapshots.updated) {
        summary.push(
            `${SNAPSHOT_UPDATED(
                `${ARROW + pluralize('snapshot', snapshots.updated)} updated `
            )}from ${pluralize('test suite', snapshots.filesUpdated)}.`
        );
    }

    if (snapshots.filesRemoved) {
        if (snapshots.didUpdate) {
            summary.push(
                `${SNAPSHOT_REMOVED(
                    `${ARROW}${pluralize('snapshot file', snapshots.filesRemoved)} removed `
                )}from ${pluralize('test suite', snapshots.filesRemoved)}.`
            );
        } else {
            summary.push(
                `${OBSOLETE_COLOR(
                    `${ARROW}${pluralize('snapshot file', snapshots.filesRemoved)} obsolete `
                )}from ${pluralize('test suite', snapshots.filesRemoved)}. ${SNAPSHOT_NOTE(
                    `To remove ${snapshots.filesRemoved === 1 ? 'it' : 'them all'}, ${updateCommand}.`
                )}`
            );
        }
    }
    if (snapshots.filesRemovedList && snapshots.filesRemovedList.length > 0) {
        const [head, ...tail] = snapshots.filesRemovedList;
        summary.push(`  ${DOWN_ARROW} ${DOT}${formatTestPath(globalConfig, head)}`);

        for (const key of tail) {
            summary.push(`      ${DOT}${formatTestPath(globalConfig, key)}`);
        }
    }

    if (snapshots.unchecked) {
        if (snapshots.didUpdate) {
            summary.push(
                `${SNAPSHOT_REMOVED(`${ARROW}${pluralize('snapshot', snapshots.unchecked)} removed `)}from ${pluralize(
                    'test suite',
                    snapshots.uncheckedKeysByFile.length
                )}.`
            );
        } else {
            summary.push(
                `${OBSOLETE_COLOR(`${ARROW}${pluralize('snapshot', snapshots.unchecked)} obsolete `)}from ${pluralize(
                    'test suite',
                    snapshots.uncheckedKeysByFile.length
                )}. ${SNAPSHOT_NOTE(`To remove ${snapshots.unchecked === 1 ? 'it' : 'them all'}, ${updateCommand}.`)}`
            );
        }

        for (const uncheckedFile of snapshots.uncheckedKeysByFile) {
            summary.push(`  ${DOWN_ARROW}${formatTestPath(globalConfig, uncheckedFile.filePath)}`);

            for (const key of uncheckedFile.keys) {
                summary.push(`      ${DOT}${key}`);
            }
        }
    }

    console.log();
    for (const line of summary) {
        console.log(line);
    }
}
