import type { Registry } from 'vscode-textmate';

/**
 * A wrapper around components related to textmate grammar support for Monaco.
 */
export type TextMateGrammarSupport = {
    /**
     * The underlying {@link Registry} handling loading of grammars.
     */
    registry: Registry;
    /**
     * A lookup to register supported grammars. The key is the `scopeName` requested
     * by a language and the value is a promise to load the grammar in a supported formats.
     */
    grammars: Record<string, () => Promise<string>>;
};
