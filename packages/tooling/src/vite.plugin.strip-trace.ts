import MagicString from 'magic-string';
import { parseAst } from 'rolldown/parseAst';
import type { Plugin } from 'vite';

interface AstNode {
    type: string;
    start: number;
    end: number;
    [key: string]: unknown;
}

const traceMembers = new Set(['trace', 'isTraceEnabled']);

/**
 * Removes alphaTab's trace logging from library builds: every `Logger.trace(...)` expression statement
 * including its arguments, and every `if (Logger.isTraceEnabled) ...` statement including its body.
 * A build without trace output therefore behaves like a build with the trace level turned off.
 *
 * The build fails when
 * - `Logger.trace` or `Logger.isTraceEnabled` is used in any other form (part of an expression, returned,
 *   passed on, `else` branch on the guard),
 * - a trace call argument may have side effects (calls, `new`, assignments, `++`/`--`, `delete`, `await`,
 *   functions; property reads are accepted),
 * - an output chunk still reads `trace` or `isTraceEnabled` from something named `Logger`.
 *
 * `Logger` may also be reached as a property (`alphaTab.Logger.trace(...)`). The dev server is not affected.
 */
export function stripTracePlugin(): Plugin {
    let removed = 0;
    return {
        name: 'alphatab:strip-trace',
        enforce: 'pre',
        apply: 'build',
        buildStart() {
            removed = 0;
        },
        transform: {
            filter: { id: /\.tsx?$/ },
            handler(code, id) {
                if (!code.includes('trace') && !code.includes('isTraceEnabled')) {
                    return null;
                }
                const program = parseAst(
                    code,
                    { lang: id.endsWith('.tsx') ? 'tsx' : 'ts', sourceType: 'module' },
                    id
                ) as unknown as AstNode;

                const ms = new MagicString(code);
                const fail = (node: AstNode, message: string): never => {
                    this.error(`${id}:${lineOf(code, node.start)}: ${message}`);
                };

                walk(program, node => {
                    if (node.type === 'IfStatement' && isTraceMember(node.test as AstNode, 'isTraceEnabled', false)) {
                        if (node.alternate) {
                            fail(node, '`if (Logger.isTraceEnabled)` must not have an else branch');
                        }
                        ms.overwrite(node.start, node.end, ';');
                        removed++;
                        return false;
                    }
                    if (node.type === 'ExpressionStatement') {
                        const call = node.expression as AstNode;
                        if (
                            call.type === 'CallExpression' &&
                            !call.optional &&
                            isTraceMember(call.callee as AstNode, 'trace', false)
                        ) {
                            for (const arg of call.arguments as AstNode[]) {
                                const effect = findSideEffect(arg);
                                if (effect) {
                                    fail(effect, `Logger.trace arguments must not have side effects (${effect.type})`);
                                }
                            }
                            ms.overwrite(node.start, node.end, ';');
                            removed++;
                            return false;
                        }
                    }
                    if (node.type === 'MemberExpression' && isTraceMember(node, undefined, false)) {
                        fail(
                            node,
                            'Logger.trace must be called as a plain statement and Logger.isTraceEnabled only be used as a whole if condition'
                        );
                    }
                    return true;
                });

                if (!ms.hasChanged()) {
                    return null;
                }
                return {
                    code: ms.toString(),
                    map: ms.generateMap({ hires: 'boundary', source: id })
                };
            }
        },
        renderChunk(code, chunk) {
            if (!/\.\s*(trace|isTraceEnabled)\b/.test(code)) {
                return null;
            }
            const program = parseAst(code, { lang: 'js', sourceType: 'module' }) as unknown as AstNode;
            walk(program, node => {
                if (node.type === 'MemberExpression' && isTraceMember(node, undefined, true)) {
                    this.error(
                        `${chunk.fileName}:${lineOf(code, node.start)}: trace logging survived the strip: ${code.slice(node.start, node.end)}`
                    );
                }
                return true;
            });
            return null;
        },
        buildEnd() {
            this.info(`Removed ${removed} trace statements`);
        }
    };
}

/**
 * Whether `node` reads `member` (any trace member when undefined) from `Logger`. In bundle output the
 * binding may carry a deduplication suffix (`Logger$1`).
 */
function isTraceMember(node: AstNode | null | undefined, member: string | undefined, bundled: boolean): boolean {
    if (!node || node.type !== 'MemberExpression' || node.computed) {
        return false;
    }
    const property = node.property as AstNode;
    if (property.type !== 'Identifier') {
        return false;
    }
    const name = property.name as string;
    if (member === undefined ? !traceMembers.has(name) : name !== member) {
        return false;
    }
    const object = node.object as AstNode;
    const loggerName = /^Logger(\$\d+)?$/;
    if (object.type === 'Identifier') {
        return bundled ? loggerName.test(object.name as string) : object.name === 'Logger';
    }
    if (object.type === 'MemberExpression' && !object.computed) {
        const objectProperty = object.property as AstNode;
        return objectProperty.type === 'Identifier' && objectProperty.name === 'Logger';
    }
    return false;
}

const pureWrappers = new Set([
    'ParenthesizedExpression',
    'TSAsExpression',
    'TSSatisfiesExpression',
    'TSNonNullExpression',
    'TSTypeAssertion',
    'ChainExpression',
    'SpreadElement'
]);

/**
 * Returns the first node within the expression that may have a side effect when evaluated, or null.
 * Property reads count as pure.
 */
function findSideEffect(node: AstNode | null): AstNode | null {
    if (!node) {
        return null;
    }
    switch (node.type) {
        case 'Literal':
        case 'Identifier':
        case 'ThisExpression':
        case 'Super':
            return null;
        case 'TemplateLiteral':
            return firstSideEffect(node.expressions as AstNode[]);
        case 'MemberExpression':
            return (
                findSideEffect(node.object as AstNode) ??
                (node.computed ? findSideEffect(node.property as AstNode) : null)
            );
        case 'BinaryExpression':
        case 'LogicalExpression':
            return findSideEffect(node.left as AstNode) ?? findSideEffect(node.right as AstNode);
        case 'ConditionalExpression':
            return (
                findSideEffect(node.test as AstNode) ??
                findSideEffect(node.consequent as AstNode) ??
                findSideEffect(node.alternate as AstNode)
            );
        case 'UnaryExpression':
            return node.operator === 'delete' ? node : findSideEffect(node.argument as AstNode);
        case 'ArrayExpression':
            return firstSideEffect(node.elements as (AstNode | null)[]);
        case 'ObjectExpression':
            for (const property of node.properties as AstNode[]) {
                const effect =
                    property.type === 'Property'
                        ? ((property.computed ? findSideEffect(property.key as AstNode) : null) ??
                          findSideEffect(property.value as AstNode))
                        : findSideEffect(property);
                if (effect) {
                    return effect;
                }
            }
            return null;
    }
    if (pureWrappers.has(node.type)) {
        return findSideEffect((node.expression ?? node.argument) as AstNode);
    }
    return node;
}

function firstSideEffect(nodes: (AstNode | null)[]): AstNode | null {
    for (const n of nodes) {
        const effect = findSideEffect(n);
        if (effect) {
            return effect;
        }
    }
    return null;
}

/**
 * Visits all nodes depth first; children are skipped when `visit` returns false.
 */
function walk(node: unknown, visit: (n: AstNode) => boolean): void {
    if (!node || typeof node !== 'object') {
        return;
    }
    if (Array.isArray(node)) {
        for (const child of node) {
            walk(child, visit);
        }
        return;
    }
    const typed = node as AstNode;
    if (typeof typed.type === 'string' && !visit(typed)) {
        return;
    }
    for (const key of Object.keys(typed)) {
        if (key === 'parent') {
            continue;
        }
        const value = typed[key];
        if (value && typeof value === 'object') {
            walk(value, visit);
        }
    }
}

function lineOf(code: string, offset: number): number {
    let line = 1;
    for (let i = 0; i < offset; i++) {
        if (code.charCodeAt(i) === 10) {
            line++;
        }
    }
    return line;
}
