/** @target web */
import fs from 'node:fs';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/**
 * The website reference shows `@defaultValue` as the default of each setting,
 * so it must state the value the property is initialized with. Checked are numeric,
 * boolean and enum member initializers; other defaults are documented in their JSON form.
 */
describe('SettingsDocumentationTests', () => {
    const files = [
        'src/CoreSettings.ts',
        'src/DisplaySettings.ts',
        'src/ExporterSettings.ts',
        'src/ImporterSettings.ts',
        'src/NotationSettings.ts',
        'src/PlayerSettings.ts',
        'src/RenderingResources.ts'
    ];

    function isComparable(initializer: ts.Expression, documented: string): boolean {
        if (ts.isPropertyAccessExpression(initializer)) {
            // enum members are documented by name (a number is reported as a mismatch); static fields
            // holding fonts or engraving defaults are documented by their JSON value
            return ts.isIdentifier(initializer.expression) && /^([A-Z]\w*\.\w+|-?[\d.]+)$/.test(documented);
        }
        return (
            ts.isNumericLiteral(initializer) ||
            (ts.isPrefixUnaryExpression(initializer) && ts.isNumericLiteral(initializer.operand)) ||
            initializer.kind === ts.SyntaxKind.TrueKeyword ||
            initializer.kind === ts.SyntaxKind.FalseKeyword
        );
    }

    function sameValue(documented: string, initializer: string): boolean {
        const documentedNumber = Number(documented);
        const initializerNumber = Number(initializer);
        if (!Number.isNaN(documentedNumber) && !Number.isNaN(initializerNumber)) {
            return documentedNumber === initializerNumber;
        }
        return documented === initializer;
    }

    it('default-values-match-initializers', () => {
        const mismatches: string[] = [];
        let checked = 0;
        for (const file of files) {
            const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
            const visit = (node: ts.Node) => {
                if (ts.isPropertyDeclaration(node) && node.initializer) {
                    for (const tag of ts.getJSDocTags(node)) {
                        if (tag.tagName.text !== 'defaultValue') {
                            continue;
                        }
                        // only plain code values like `6` or `LayoutMode.Page`; prose and expressions are skipped
                        const match = /^`([^`]+)`$/.exec(ts.getTextOfJSDocComment(tag.comment)?.trim() ?? '');
                        if (!match || !isComparable(node.initializer, match[1])) {
                            continue;
                        }
                        checked++;
                        const initializer = node.initializer.getText(source);
                        if (!sameValue(match[1], initializer)) {
                            mismatches.push(
                                `${file} ${node.name.getText(source)}: @defaultValue ${match[1]}, initializer ${initializer}`
                            );
                        }
                    }
                }
                ts.forEachChild(node, visit);
            };
            visit(source);
        }
        expect(checked).toBeGreaterThan(50);
        expect(mismatches).toEqual([]);
    });
});
