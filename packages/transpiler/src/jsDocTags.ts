import ts from 'typescript';

/**
 * Canonical names of JSDoc tags the transpiler treats as semantic directives.
 *
 * Tags are written in TS source as `@partial`, `@discriminated`, etc.
 *
 * Centralizing the literals here lets us:
 *  - find every consumer of a tag with a single grep on the export,
 *  - reuse parameterized helpers (`hasTag`, `findTag`, `getTagComment`) instead
 *    of repeating `ts.getJSDocTags(node).find(t => t.tagName.text === '...')`
 *    in 20+ call sites.
 */
export const JsDocTag = {
    /** Generates a partial class/member (Kotlin Partials, C# partial). */
    partial: 'partial',
    /** Forces public visibility regardless of TS export status. */
    public: 'public',
    /** Forces internal visibility. */
    internal: 'internal',
    /** Marks an interface to be promoted to a record class. */
    record: 'record',
    /** Marks a type alias as a discriminated union. */
    discriminated: 'discriminated',
    /** Filters declarations to a specific target language (`@target csharp`). */
    target: 'target',
    /** Marks a function/method as async (Kotlin: suspend). */
    async: 'async',
    /** Kotlin: emit field as `lateinit var`. */
    lateinit: 'lateinit',
    /** Marks members that delegate to a per-target implementation. */
    delegated: 'delegated'
} as const;

/** Find the first JSDoc tag with the given name on a node, or undefined. */
export function findTag(node: ts.Node, name: string): ts.JSDocTag | undefined {
    return ts.getJSDocTags(node).find(t => t.tagName.text === name);
}

/** Does the node carry the given JSDoc tag? */
export function hasTag(node: ts.Node, name: string): boolean {
    return ts.getJSDocTags(node).some(t => t.tagName.text === name);
}

/** All occurrences of a tag, in source order. */
export function findAllTags(node: ts.Node, name: string): ts.JSDocTag[] {
    return ts.getJSDocTags(node).filter(t => t.tagName.text === name);
}

/**
 * The free-text comment that follows a tag, or undefined if there is none.
 * Returns a string regardless of TS's union (it returns string | NodeArray | undefined).
 */
export function getTagComment(tag: ts.JSDocTag): string | undefined {
    const c = tag.comment;
    if (c === undefined) {
        return undefined;
    }
    return typeof c === 'string' ? c : ts.getTextOfJSDocComment(c);
}

/**
 * Find a JSDoc tag whose name matches AND whose comment satisfies the given
 * predicate. The predicate receives the normalised comment text (or undefined
 * when the tag has no trailing comment). Used by call sites that distinguish
 * multiple uses of the same tag by inspecting the comment, e.g. `@delegated
 * csharp foo` vs `@delegated kotlin bar`.
 */
export function findTagWithComment(
    node: ts.Node,
    name: string,
    commentPredicate: (comment: string | undefined) => boolean
): ts.JSDocTag | undefined {
    return ts.getJSDocTags(node).find(t => t.tagName.text === name && commentPredicate(getTagComment(t)));
}
