/**
 * Pure target-agnostic naming helpers. These functions transform
 * arbitrary text (file basenames, JSDoc-attached identifiers, ...)
 * into emitter-friendly identifiers and PascalCase forms. They depend
 * on no context state — both the C# and Kotlin target strategies and
 * the shared EmitterContext call them directly.
 *
 * Extracted from `CSharpEmitterContext` per
 * `docs/emitter-context-split-analysis.md` §5.1 / Backlog-14 B14.1.
 */

export function toIdentifier(text: string): string {
    // kebab-case and "spaced name" to camelCase
    const parts = text.split(/[ -]/g);
    let name = '';
    for (let i = 0; i < parts.length; i++) {
        if (i > 0) {
            name += parts[i].substring(0, 1).toUpperCase() + parts[i].substring(1);
        } else {
            name += parts[i];
        }
    }

    return name.replace(/[^a-zA-Z0-9_]/g, m => {
        return (
            {
                '#': 'Hash',
                '@': 'At'
            }[m] ?? '_'
        );
    });
}

export function toPascalCase(text: string): string {
    if (text.indexOf('-') >= 0) {
        return kebabCaseToPascalCase(text);
    }

    if (!text) {
        return '';
    }

    return text
        .split('.')
        .map(p => p.substr(0, 1).toUpperCase() + p.substr(1))
        .join('.');
}

function kebabCaseToPascalCase(text: string): string {
    return text
        .split('-')
        .map(w => toPascalCase(w))
        .join('');
}

/**
 * Derives the wrapper class name for a TS source file's top-level globals
 * (functions and `const`/`let`/`var` declarations). The wrapper hosts
 * those declarations as static members. The naming convention is the
 * file's basename in PascalCase plus a `Globals` suffix, e.g.
 * `note-helpers.ts` → `NoteHelpersGlobals`.
 */
export function fileNameToWrapperClassName(fileName: string): string {
    const lastSlash = Math.max(fileName.lastIndexOf('/'), fileName.lastIndexOf('\\'));
    let base = lastSlash >= 0 ? fileName.substring(lastSlash + 1) : fileName;
    const dot = base.lastIndexOf('.');
    if (dot > 0) {
        base = base.substring(0, dot);
    }
    return `${toPascalCase(toIdentifier(base))}Globals`;
}

/**
 * Builds a fully qualified target type name from a dotted TS path
 * (`System.Collections.Generic.IEnumerable`, `kotlin.collections.Iterable`,
 * ...). The last segment is run through `toTypeNameCase`; every preceding
 * segment is run through `toNamespaceNameCase`. Both casing callbacks
 * are supplied by the caller (a `TargetStrategy`); the function itself
 * is pure and context-free.
 */
export function makeTypeName(
    tsName: string,
    toTypeNameCase: (text: string) => string,
    toNamespaceNameCase: (text: string) => string
): string {
    const parts = tsName.split('.');
    let result = '';
    for (let i = 0; i < parts.length; i++) {
        if (i > 0) {
            result += '.';
        }
        if (i === parts.length - 1) {
            result += toTypeNameCase(parts[i]);
        } else {
            result += toNamespaceNameCase(parts[i]);
        }
    }
    return result;
}
