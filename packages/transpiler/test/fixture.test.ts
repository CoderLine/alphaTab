import fs from 'node:fs';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import {
    discoverFixtures,
    errorsPath,
    formatEmitDiagnostics,
    goldenPath,
    pickEmittedSource,
    runFixture,
    type Target,
    UPDATE_FIXTURES
} from './fixture';

/**
 * Fixture-based regression tests. Each directory under test/fixtures
 * with an `input.ts` produces one test per target. The emitted .cs/.kt
 * is compared against `expected.cs`/`expected.kt` in the same dir.
 *
 * Conventions:
 *  - input.ts is a self-contained TypeScript module that type-checks.
 *  - If TypeScript reports semantic/syntactic errors, the test fails
 *    with the message before comparing output (catches malformed
 *    fixtures early).
 *  - If the emitter reports error-level diagnostics, the test fails
 *    likewise.
 *  - To accept intentional changes: UPDATE_FIXTURES=1 npx vitest run fixture
 *
 * Fixtures starting with `_` are smoke/scaffolding and only assert that
 * the pipeline runs without errors; they don't need a golden file.
 *
 * Negative fixtures: a directory containing an `errors.txt` file is treated
 * as a negative fixture. The TypeScript program must still type-check
 * cleanly (no TS errors), but the emitter is expected to produce one or
 * more error-level diagnostics. The diagnostics are normalized via
 * `formatEmitDiagnostics` and compared against `errors.txt`. Both targets
 * share the transformer and thus must produce identical listings. Negative
 * fixtures must not also carry `expected.cs`/`expected.kt` goldens — that
 * combination is a configuration error and fails loudly. Place negative
 * fixtures under `test/fixtures/errors/<name>/`.
 */
describe('transpiler fixtures', () => {
    const fixtures = discoverFixtures();
    if (fixtures.length === 0) {
        it.skip('no fixtures discovered', () => {});
        return;
    }

    for (const fixture of fixtures) {
        const isNegative = fs.existsSync(errorsPath(fixture.dir));
        if (isNegative) {
            // Negative fixtures share a single errors.txt across targets, but we
            // still exercise both targets to confirm parity. Each target gets a
            // separate `it` so failures point at the offending target.
            const listings = new Map<Target, string>();

            for (const target of ['csharp', 'kotlin'] as Target[]) {
                it(`[${target}] ${fixture.name}`, () => {
                    const result = runFixture(target, fixture.dir);
                    try {
                        // Sanity: refuse to share errors.txt with positive goldens.
                        for (const t of ['csharp', 'kotlin'] as Target[]) {
                            const g = goldenPath(fixture.dir, t);
                            if (fs.existsSync(g)) {
                                throw new Error(
                                    `Fixture ${fixture.name} has both errors.txt and ${g}. ` +
                                        'Negative fixtures must not carry expected.cs/expected.kt goldens.'
                                );
                            }
                        }

                        const tsErrors = result.tsDiagnostics.filter(d => d.category === ts.DiagnosticCategory.Error);
                        expect(
                            tsErrors,
                            `Negative fixture ${fixture.name} must type-check cleanly; got TypeScript errors:\n${formatDiags(tsErrors)}`
                        ).toEqual([]);

                        const emitErrors = result.emitDiagnostics.filter(
                            d => d.category === ts.DiagnosticCategory.Error
                        );
                        // Hard requirement: a negative fixture must actually fail the
                        // emitter. Otherwise the test silently becomes a no-op the
                        // day someone "fixes" the underlying behavior.
                        expect(
                            emitErrors.length,
                            `Negative fixture ${fixture.name} produced zero emitter errors. ` +
                                'Either remove the fixture or move it under a positive directory.'
                        ).toBeGreaterThan(0);

                        const listing = formatEmitDiagnostics(emitErrors);
                        listings.set(target, listing);

                        const errsFile = errorsPath(fixture.dir);
                        if (UPDATE_FIXTURES) {
                            // Both targets write the same file. They had better agree —
                            // the second write would silently overwrite a divergent
                            // first one otherwise, so cross-check via `listings`.
                            const other = target === 'csharp' ? 'kotlin' : 'csharp';
                            const prev = listings.get(other);
                            if (prev !== undefined && prev !== listing) {
                                throw new Error(
                                    `Negative fixture ${fixture.name} produced different ` +
                                        `diagnostics across targets:\n--- ${other} ---\n${prev}\n--- ${target} ---\n${listing}`
                                );
                            }
                            fs.writeFileSync(errsFile, `${listing}\n`);
                            return;
                        }

                        if (!fs.existsSync(errsFile)) {
                            throw new Error(
                                `No errors.txt at ${errsFile}. Run with UPDATE_FIXTURES=1 to generate one.`
                            );
                        }
                        const expected = fs.readFileSync(errsFile, 'utf8').replace(/\s+$/, '');
                        expect(listing).toBe(expected);
                    } finally {
                        fs.rmSync(result.tempRoot, { recursive: true, force: true });
                    }
                }, 30_000);
            }
            continue;
        }

        for (const target of ['csharp', 'kotlin'] as Target[]) {
            it(`[${target}] ${fixture.name}`, () => {
                const result = runFixture(target, fixture.dir);
                try {
                    const tsErrors = result.tsDiagnostics.filter(d => d.category === ts.DiagnosticCategory.Error);
                    expect(
                        tsErrors,
                        `Fixture ${fixture.name} has TypeScript errors:\n${formatDiags(tsErrors)}`
                    ).toEqual([]);

                    const emitErrors = result.emitDiagnostics.filter(d => d.category === ts.DiagnosticCategory.Error);
                    expect(
                        emitErrors,
                        `Fixture ${fixture.name} produced emitter errors:\n${formatDiags(emitErrors)}`
                    ).toEqual([]);

                    const isSmoke = fixture.name.startsWith('_');
                    if (isSmoke) {
                        // Smoke fixtures just need to emit at least one file.
                        expect(result.files.size, `Smoke fixture ${fixture.name} produced no output`).toBeGreaterThan(
                            0
                        );
                        return;
                    }

                    const actual = pickEmittedSource(result.files);
                    const golden = goldenPath(fixture.dir, target);

                    if (UPDATE_FIXTURES) {
                        fs.writeFileSync(golden, actual);
                        return;
                    }
                    if (!fs.existsSync(golden)) {
                        throw new Error(`No golden file at ${golden}. Run with UPDATE_FIXTURES=1 to generate one.`);
                    }
                    const expected = fs.readFileSync(golden, 'utf8');
                    expect(actual).toBe(expected);
                } finally {
                    fs.rmSync(result.tempRoot, { recursive: true, force: true });
                }
            }, 30_000);
        }
    }
});

function formatDiags(diags: ts.Diagnostic[]): string {
    return diags
        .slice(0, 20)
        .map(d => {
            const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
            if (d.file && d.start !== undefined) {
                const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
                return `  ${d.file.fileName}:${line + 1}:${character + 1}: ${msg}`;
            }
            return `  ${msg}`;
        })
        .join('\n');
}
