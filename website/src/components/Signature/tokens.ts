export type SignatureToken =
    [string, string] | [string, string, string];

/**
 * Tokens separated by `\n`; each starts with its kind code (`i`dentifier, `t`oken,
 * `k`eyword, `w`hitespace) and may carry a link target after `\t`. Backslash, CR,
 * LF and tab inside the text are escaped as `\\`, `\r`, `\n` and `\t`.
 * Written by `TypeReferencedCodeBuilder.toJSON` in scripts/generate-common.mts.
 */
export type EncodedSignatureTokens = string;

const tokenKinds: Record<string, string> = {
    i: 'identifier',
    t: 'token',
    k: 'keyword',
    w: 'whitespace',
};

const unescapeTokenText = (text: string) =>
    text.replace(/\\(.)/g, (_, c: string) => c === 'n' ? '\n' : c === 'r' ? '\r' : c === 't' ? '\t' : c);

export function decodeSignatureTokens(encoded: EncodedSignatureTokens): SignatureToken[] {
    return encoded.split('\n').map(token => {
        const kind = tokenKinds[token[0]!]!;
        const linkStart = token.indexOf('\t');
        return linkStart === -1
            ? [kind, unescapeTokenText(token.substring(1))]
            : [kind, unescapeTokenText(token.substring(1, linkStart)), unescapeTokenText(token.substring(linkStart + 1))];
    });
}
