import ts from 'typescript';
import type AstTransformer from './AstTransformer';
import type * as cs from './ir/Ir';

export type Handler<TNode extends ts.Node = ts.Node, TResult extends cs.Node | null = cs.Node | null> = (
    transformer: AstTransformer,
    parent: cs.Node,
    node: TNode
) => TResult;

export class HandlerRegistry {
    private readonly _handlers = new Map<ts.SyntaxKind, Handler>();

    register<TNode extends ts.Node>(kind: ts.SyntaxKind, handler: Handler<TNode>): void {
        this._handlers.set(kind, handler as Handler);
    }

    wrap<TNode extends ts.Node>(
        kind: ts.SyntaxKind,
        wrapper: (base: Handler<TNode>, transformer: AstTransformer, parent: cs.Node, node: TNode) => cs.Node | null
    ): void {
        const base = this._handlers.get(kind);
        if (!base) {
            throw new Error(`wrap: no handler registered for SyntaxKind ${ts.SyntaxKind[kind]} (${kind})`);
        }
        this._handlers.set(kind, (transformer, parent, node) =>
            wrapper(base as Handler<TNode>, transformer, parent, node as TNode)
        );
    }

    has(kind: ts.SyntaxKind): boolean {
        return this._handlers.has(kind);
    }

    resolve(kind: ts.SyntaxKind): Handler {
        return this._handlers.get(kind) ?? _noopHandler;
    }
}

const _noopHandler: Handler = () => null;
