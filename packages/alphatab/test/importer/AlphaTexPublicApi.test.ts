/** @target web */
import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('AlphaTexPublicApiTests', () => {
    it('barrel-exports-public-ast-types', () => {
        const ast = fs.readFileSync('src/importer/alphaTex/AlphaTexAst.ts', 'utf8');
        const barrel = fs.readFileSync('src/importer/alphaTex/_barrel.ts', 'utf8');

        const publicNames = [
            ...ast.matchAll(/\/\*\*((?:(?!\*\/)[\s\S])*?)\*\/\s*export (?:interface|enum|class|type) (\w+)/g)
        ]
            .filter(m => m[1].includes('@public'))
            .map(m => m[2]);
        expect(publicNames.length).toBeGreaterThan(0);

        const exported = new Set([...barrel.matchAll(/(?:type )?(\w+)\s*[,}]/g)].map(m => m[1]));
        expect(publicNames.filter(n => !exported.has(n))).toEqual([]);
    });
});
