import type {
    BlockStatement,
    IdentifierName,
    MemberExpression,
    Program,
    Statement,
    VariableDeclaration
} from '@oxc-project/types';
import MagicString from 'magic-string';
import { parseAst } from 'rolldown/parseAst';
import type { Plugin } from 'vite';

/**
 * Lowers `using x = ElementStyleHelper.foo(...)` declarations to
 * `const x = ...; try { ...rest of block... } finally { x?.[Symbol.dispose]?.(); }`.
 *
 * TypeScript's native `using` lowering allocates a disposal stack per scope,
 * which is too much overhead for these declarations sprinkled across rendering
 * hot paths (notes, glyphs).
 *
 * Caveats:
 * - Only declarations in a curly-brace `BlockStatement` (or `Program` body) are
 *   rewritten. `using` in a switch case body without explicit braces is left alone.
 * - Multiple `using ... ElementStyleHelper` declarations in the same block produce
 *   stacked try/finally blocks, with each finally inserted right after the last
 *   statement before the next match.
 */
export function elementStyleUsingPlugin(): Plugin {
    return {
        name: 'alphatab:lower-element-style-using',
        enforce: 'pre',
        transform: {
            filter: { id: /\.tsx?$/ },
            handler(code, id) {
                if (!code.includes('ElementStyleHelper')) {
                    return null;
                }

                const program = parseAst(
                    code,
                    { lang: id.endsWith('.tsx') ? 'tsx' : 'ts', sourceType: 'module' },
                    id
                );

                const ms = new MagicString(code);
                walk(program, node => {
                    if (node.type === 'BlockStatement' || node.type === 'Program') {
                        rewriteBody((node as BlockStatement | Program).body as Statement[], ms);
                    }
                });

                if (!ms.hasChanged()) {
                    return null;
                }

                return {
                    code: ms.toString(),
                    map: ms.generateMap({ hires: 'boundary', source: id })
                };
            }
        }
    };
}

function rewriteBody(body: Statement[], ms: MagicString): void {
    let open: { id: string; lastStmtEnd: number } | null = null;

    for (const stmt of body) {
        if (isElementStyleHelperUsing(stmt)) {
            if (open) {
                ms.appendLeft(open.lastStmtEnd, ` } finally { ${open.id}?.[Symbol.dispose]?.(); }`);
            }

            const idNode = stmt.declarations[0].id;
            if (idNode.type !== 'Identifier') {
                // destructured `using` is not supported.
                open = null;
                continue;
            }
            const name = (idNode as IdentifierName).name;

            // `using` is 5 chars; replace with `const`
            ms.update(stmt.start, stmt.start + 5, 'const');
            ms.appendLeft(stmt.end, ' try {');

            open = { id: name, lastStmtEnd: stmt.end };
        } else if (open) {
            open.lastStmtEnd = stmt.end;
        }
    }

    if (open) {
        ms.appendLeft(open.lastStmtEnd, ` } finally { ${open.id}?.[Symbol.dispose]?.(); }`);
    }
}

function isElementStyleHelperUsing(
    stmt: Statement
): stmt is VariableDeclaration & { declarations: [{ id: IdentifierName; init: { type: string } }] } {
    if (stmt.type !== 'VariableDeclaration') { return false; }
    if (stmt.kind !== 'using' && stmt.kind !== 'await using') { return false; }
    if (stmt.declarations.length !== 1) { return false; }
    const init = stmt.declarations[0].init;
    if (!init) { return false; }
    // Accept a direct `ElementStyleHelper.X(...)` call or a ternary
    // whose leaves are each a call or undefined/void 0.
    return isElementStyleHelperInit(init as unknown as { type: string }) && hasElementStyleHelperCall(init as unknown as { type: string });
}

function isElementStyleHelperInit(expr: { type: string } | null | undefined): boolean {
    if (!expr) { return false; }
    if (expr.type === 'CallExpression') {
        return isElementStyleHelperCall(expr);
    }
    if (expr.type === 'Identifier') {
        return (expr as IdentifierName).name === 'undefined';
    }
    if (expr.type === 'UnaryExpression') {
        // `void 0`, `void undefined`, etc.
        return (expr as unknown as { operator: string }).operator === 'void';
    }
    if (expr.type === 'ConditionalExpression') {
        const c = expr as unknown as { consequent: { type: string }; alternate: { type: string } };
        return isElementStyleHelperInit(c.consequent) && isElementStyleHelperInit(c.alternate);
    }
    return false;
}

function hasElementStyleHelperCall(expr: { type: string } | null | undefined): boolean {
    if (!expr) { return false; }
    if (expr.type === 'CallExpression') {
        return isElementStyleHelperCall(expr);
    }
    if (expr.type === 'ConditionalExpression') {
        const c = expr as unknown as { consequent: { type: string }; alternate: { type: string } };
        return hasElementStyleHelperCall(c.consequent) || hasElementStyleHelperCall(c.alternate);
    }
    return false;
}

function isElementStyleHelperCall(expr: { type: string }): boolean {
    const callee = (expr as unknown as { callee: unknown }).callee as MemberExpression | { type: string } | undefined;
    if (!callee || callee.type !== 'MemberExpression') { return false; }
    const object = (callee as MemberExpression).object;
    return object.type === 'Identifier' && (object as IdentifierName).name === 'ElementStyleHelper';
}

function walk(node: unknown, visit: (n: { type: string }) => void): void {
    if (!node || typeof node !== 'object') { return; }
    const typed = node as { type?: string };
    if (typeof typed.type === 'string') {
        visit(typed as { type: string });
    }
    for (const key of Object.keys(node)) {
        if (key === 'parent') { continue; }
        const value = (node as Record<string, unknown>)[key];
        if (Array.isArray(value)) {
            for (const v of value) { walk(v, visit); }
        } else if (value && typeof value === 'object' && typeof (value as { type?: string }).type === 'string') {
            walk(value, visit);
        }
    }
}
